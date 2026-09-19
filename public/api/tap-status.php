<?php
/**
 * tap-status.php — lets the /payment/return page show an immediate result
 * to the customer. The webhook is still the authoritative record; this just
 * avoids making them stare at a spinner if it hasn't arrived yet by asking
 * Tap directly (server-side, with our secret key) for the live charge status.
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET')     { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/tap-common.php';
tapLoadConfig();

$ref = trim($_GET['ref'] ?? '');
$paymentToken = trim($_GET['token'] ?? '');
if (!$ref) tapRespond(['error' => 'Missing ref'], 400);

$stmt = $pdo->prepare("SELECT * FROM orders WHERE ref = :ref LIMIT 1");
$stmt->execute(['ref' => $ref]);
$order = $stmt->fetch();

if (!$order) tapRespond(['error' => 'Order not found'], 404);

if (!tapOrderTokenIsValid($order, $paymentToken)) {
    tapRespond(['error' => 'Invalid payment token'], 403);
}

// Webhook already settled it — no need to call Tap again.
if (in_array($order['paymentStatus'], ['paid', 'failed'], true)) {
    tapRespond(['status' => $order['paymentStatus'], 'ref' => $ref]);
}

if (empty($order['tapChargeId'])) {
    tapRespond(['status' => $order['paymentStatus'] ?: 'pending', 'ref' => $ref]);
}

$testMode = isset($order['tapTestMode']) && $order['tapTestMode'] !== null
    ? (bool)$order['tapTestMode']
    : tapIsTestMode($pdo);
$result = tapApiRequest('GET', 'charges/' . urlencode($order['tapChargeId']), tapSecretKey($testMode));

if (!$result['ok'] || empty($result['data']['status'])) {
    tapRespond(['status' => 'pending', 'ref' => $ref]);
}

$tapStatus = $result['data']['status'];
$paymentStatus = tapPaymentStatus($tapStatus);

if ($paymentStatus !== $order['paymentStatus']) {
    $upd = $pdo->prepare("UPDATE orders
        SET paymentStatus = :ps,
            status = CASE
                WHEN :markPaid = 1 AND status = 'pending' THEN 'confirmed'
                ELSE status
            END
        WHERE id = :id");
    $upd->execute([
        'ps' => $paymentStatus,
        'markPaid' => $paymentStatus === 'paid' ? 1 : 0,
        'id' => $order['id'],
    ]);
}

tapRespond(['status' => $paymentStatus, 'ref' => $ref]);
