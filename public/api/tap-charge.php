<?php
/**
 * tap-charge.php — creates a Tap charge for an already-placed order and
 * returns the hosted payment page URL to redirect the customer to.
 *
 * The frontend sends an order id plus its one-time payment token. Amount,
 * currency and customer details are read back from the saved order so a
 * tampered request cannot charge a different amount.
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/tap-common.php';
tapLoadConfig();

$body    = json_decode(file_get_contents('php://input'), true) ?: [];
$orderId = isset($body['orderId']) ? (int)$body['orderId'] : 0;
$paymentToken = isset($body['paymentToken']) ? (string)$body['paymentToken'] : '';

if (!$orderId) {
    tapRespond(['error' => 'Missing orderId'], 400);
}

$stmt = $pdo->prepare("SELECT * FROM orders WHERE id = :id");
$stmt->execute(['id' => $orderId]);
$order = $stmt->fetch();

if (!$order) {
    tapRespond(['error' => 'Order not found'], 404);
}

if (!tapIsEnabled($pdo)) {
    tapRespond(['error' => 'Tap payments are currently disabled'], 503);
}

if (($order['payment'] ?? '') !== 'tap') {
    tapRespond(['error' => 'This order was not created for Tap payment'], 409);
}

if (!tapOrderTokenIsValid($order, $paymentToken)) {
    tapRespond(['error' => 'Invalid payment token'], 403);
}

if (($order['paymentStatus'] ?? '') === 'paid') {
    tapRespond(['error' => 'Order is already paid'], 409);
}

$amount = (float)($order['grandTotal'] ?: $order['total']);
if ($amount < 0.100) {
    tapRespond(['error' => 'Invalid order amount'], 400);
}

$testMode = tapIsTestMode($pdo);
$secretKey = tapSecretKey($testMode);

// Reuse a charge when the browser retries after losing the first response.
if (!empty($order['tapChargeId']) && in_array($order['paymentStatus'] ?? '', ['initiating', 'pending'], true)) {
    $existingMode = isset($order['tapTestMode']) && $order['tapTestMode'] !== null
        ? (bool)$order['tapTestMode']
        : $testMode;
    $existing = tapApiRequest('GET', 'charges/' . urlencode($order['tapChargeId']), tapSecretKey($existingMode));
    if ($existing['ok'] && !empty($existing['data']['status'])) {
        $existingStatus = tapPaymentStatus($existing['data']['status']);
        if ($existingStatus === 'paid') {
            $paid = $pdo->prepare("UPDATE orders
                SET paymentStatus = 'paid',
                    status = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END
                WHERE id = :id");
            $paid->execute(['id' => $orderId]);
            tapRespond(['error' => 'Order is already paid'], 409);
        }
        if ($existingStatus === 'failed') {
            $failed = $pdo->prepare("UPDATE orders SET paymentStatus = 'failed', tapChargeId = NULL WHERE id = :id");
            $failed->execute(['id' => $orderId]);
        } elseif (!empty($existing['data']['transaction']['url'])) {
            tapRespond([
                'url'      => $existing['data']['transaction']['url'],
                'chargeId' => $order['tapChargeId'],
            ]);
        } else {
            tapRespond(['error' => 'A payment attempt is already in progress for this order'], 409);
        }
    } else {
        tapRespond(['error' => 'A payment attempt is already in progress for this order'], 409);
    }
}

// Claim the order atomically so concurrent requests cannot create two charges.
$claim = $pdo->prepare("UPDATE orders SET paymentStatus = 'initiating', tapTestMode = :testMode
    WHERE id = :id AND payment = 'tap'
      AND (paymentStatus IS NULL OR paymentStatus IN ('unpaid', 'failed'))");
$claim->execute(['testMode' => $testMode ? 1 : 0, 'id' => $orderId]);
if ($claim->rowCount() !== 1) {
    tapRespond(['error' => 'A payment attempt is already in progress for this order'], 409);
}

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

// Optional: routes the charge to a specific Merchant Account ID from the Tap
// dashboard. Leave TAP_MERCHANT_ID unset/empty to use the account tied to
// the secret key (the default for a single-merchant integration).
if (defined('TAP_MERCHANT_ID') && TAP_MERCHANT_ID !== '') {
    $chargeBody['merchant'] = ['id' => TAP_MERCHANT_ID];
}

$langCode = ($order['lang'] ?? '') === 'ar' ? 'ar' : 'en';
$result = tapApiRequest('POST', 'charges/', $secretKey, $chargeBody, ['lang_code: ' . $langCode]);

if (!$result['ok'] || empty($result['data']['transaction']['url'])) {
    $reset = $pdo->prepare("UPDATE orders SET paymentStatus = 'failed' WHERE id = :id AND paymentStatus = 'initiating'");
    $reset->execute(['id' => $orderId]);
    tapRespond(['error' => 'Tap charge creation failed', 'details' => $result['data'] ?? $result['error'] ?? null], 502);
}

$chargeId = $result['data']['id'];

$upd = $pdo->prepare("UPDATE orders SET paymentStatus = 'pending', tapChargeId = :chargeId WHERE id = :id AND paymentStatus = 'initiating'");
$upd->execute(['chargeId' => $chargeId, 'id' => $orderId]);

tapRespond([
    'url'      => $result['data']['transaction']['url'],
    'chargeId' => $chargeId,
]);
