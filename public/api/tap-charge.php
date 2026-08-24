<?php
/**
 * tap-charge.php — creates a Tap charge for an already-placed order and
 * returns the hosted payment page URL to redirect the customer to.
 *
 * The frontend only ever sends an order id here — amount, currency and
 * customer details are all read back from the order row we already saved,
 * so a tampered client request can't charge a different amount than the
 * order it's paying for.
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/tap-common.php';
tapLoadConfig();

$body    = json_decode(file_get_contents('php://input'), true) ?: [];
$orderId = isset($body['orderId']) ? (int)$body['orderId'] : 0;

if (!$orderId) {
    tapRespond(['error' => 'Missing orderId'], 400);
}

$stmt = $pdo->prepare("SELECT * FROM orders WHERE id = :id");
$stmt->execute(['id' => $orderId]);
$order = $stmt->fetch();

if (!$order) {
    tapRespond(['error' => 'Order not found'], 404);
}

$amount = (float)($order['grandTotal'] ?: $order['total']);
if ($amount < 0.100) {
    tapRespond(['error' => 'Invalid order amount'], 400);
}

$testMode = tapIsTestMode($pdo);
$secretKey = tapSecretKey($testMode);

$nameParts = preg_split('/\s+/', trim($order['client'] ?: 'Customer'), 2);
$phoneDigits = preg_replace('/\D/', '', $order['phone'] ?? '');
$phoneDigits = preg_replace('/^965/', '', $phoneDigits);

$chargeBody = [
    'amount'   => $amount,
    'currency' => 'KWD',
    'customer_initiated' => true,
    'threeDSecure' => true,
    'description' => 'Order ' . $order['ref'],
    'reference' => [
        'order' => $order['ref'],
    ],
    'metadata' => [
        'orderId' => $orderId,
    ],
    'customer' => [
        'first_name' => $nameParts[0] ?: 'Customer',
        'last_name'  => $nameParts[1] ?? '',
        'email'      => $order['email'] ?: 'no-reply@al-jawhara.com',
        'phone'      => [
            'country_code' => 965,
            'number'       => $phoneDigits ?: '00000000',
        ],
    ],
    'source' => [
        'id' => 'src_all', // shows whichever methods (cards, KNET, ...) are enabled on the Tap merchant account
    ],
    'redirect' => [
        'url' => TAP_SITE_URL . '/payment/return?ref=' . urlencode($order['ref']),
    ],
    'post' => [
        'url' => TAP_SITE_URL . '/api/tap-webhook.php',
    ],
];

$result = tapApiRequest('POST', 'charges', $secretKey, $chargeBody);

if (!$result['ok'] || empty($result['data']['transaction']['url'])) {
    tapRespond(['error' => 'Tap charge creation failed', 'details' => $result['data'] ?? $result['error'] ?? null], 502);
}

$chargeId = $result['data']['id'];

$upd = $pdo->prepare("UPDATE orders SET paymentStatus = 'pending', tapChargeId = :chargeId WHERE id = :id");
$upd->execute(['chargeId' => $chargeId, 'id' => $orderId]);

tapRespond([
    'url'      => $result['data']['transaction']['url'],
    'chargeId' => $chargeId,
]);
