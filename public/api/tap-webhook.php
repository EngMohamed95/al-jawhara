<?php
/**
 * tap-webhook.php — Tap's server-to-server payment notification (IPN).
 *
 * This is the ONLY authoritative source for marking an order as paid — the
 * browser redirect back to /payment/return can be lost (closed tab, dropped
 * connection) so it must never be trusted on its own. Verifies the
 * `hashstring` header against a signature we compute from the payload with
 * our own secret key before touching the database.
 */
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/tap-common.php';
tapLoadConfig();

$raw     = file_get_contents('php://input');
$payload = json_decode($raw, true);

if (!$payload || empty($payload['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid payload']);
    exit;
}

$id                = $payload['id'];
$amount             = $payload['amount'] ?? '';
$currency           = $payload['currency'] ?? '';
$gatewayReference   = $payload['reference']['gateway'] ?? '';
$paymentReference   = $payload['reference']['payment'] ?? '';
$status             = $payload['status'] ?? '';
$created            = $payload['transaction']['created'] ?? '';

$toBeHashed = 'x_id' . $id
            . 'x_amount' . $amount
            . 'x_currency' . $currency
            . 'x_gateway_reference' . $gatewayReference
            . 'x_payment_reference' . $paymentReference
            . 'x_status' . $status
            . 'x_created' . $created;

$postedHash = $_SERVER['HTTP_HASHSTRING'] ?? '';
$verified = false;
foreach (tapBothSecretKeys() as $key) {
    $computed = hash_hmac('sha256', $toBeHashed, $key);
    if (hash_equals($computed, $postedHash)) { $verified = true; break; }
}

if (!$verified) {
    http_response_code(401);
    echo json_encode(['error' => 'Signature verification failed']);
    exit;
}

// Acknowledge immediately — Tap only cares that we got it.
http_response_code(200);
echo json_encode(['received' => true]);

// Find the order this charge belongs to.
$orderRef = $payload['reference']['order'] ?? ($payload['metadata']['orderId'] ?? null);
$stmt = $pdo->prepare("SELECT * FROM orders WHERE tapChargeId = :cid OR ref = :ref LIMIT 1");
$stmt->execute(['cid' => $id, 'ref' => $orderRef]);
$order = $stmt->fetch();

if (!$order) exit;

// Idempotent — a retried webhook for an already-paid order is a no-op.
if ($order['paymentStatus'] === 'paid' && $status === 'CAPTURED') exit;

$paymentStatus = $status === 'CAPTURED' ? 'paid' : ($status === 'FAILED' ? 'failed' : strtolower($status));

$upd = $pdo->prepare("UPDATE orders SET paymentStatus = :ps, tapChargeId = :cid, tapPaymentRef = :pref WHERE id = :id");
$upd->execute([
    'ps'   => $paymentStatus,
    'cid'  => $id,
    'pref' => $paymentReference,
    'id'   => $order['id'],
]);
