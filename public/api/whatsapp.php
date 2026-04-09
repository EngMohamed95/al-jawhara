<?php
/**
 * whatsapp.php — إرسال إشعار واتساب عند كل طلب جديد
 * يستخدم Green API (مجاني)
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }

$body = json_decode(file_get_contents('php://input'), true);
if (!$body) { http_response_code(400); echo json_encode(['error' => 'Invalid JSON']); exit; }

$order   = $body['order']   ?? [];
$numbers = $body['numbers'] ?? [];

if (empty($order) || empty($numbers)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing order or numbers']);
    exit;
}

// ── بناء الرسالة ─────────────────────────────────────────
$paymentLabels = [
    'cash'       => 'كاش 💵',
    'transfer'   => 'تحويل بنكي 🏦',
    'knet'       => 'KNET 💳',
    'myfatoorah' => 'MyFatoorah 💳',
    'tap'        => 'Tap 💳',
    'benefitpay' => 'Benefit Pay 💳',
];

$ref     = $order['ref']         ?? '';
$client  = $order['client']      ?? '';
$phone   = $order['phone']       ?? '';
$gov     = $order['governorate'] ?? '';
$block   = $order['block']       ?? '';
$payment = $paymentLabels[$order['payment'] ?? ''] ?? ($order['payment'] ?? '');
$total   = $order['grandTotal']  ?? $order['total'] ?? '';
$items   = $order['items']       ?? [];

$itemLines = '';
foreach ($items as $item) {
    $itemLines .= "  • " . ($item['name'] ?? '') . " × " . ($item['qty'] ?? 1) . "\n";
}

$msg  = "🛍️ *طلب جديد — الجوهرة*\n\n";
$msg .= "📋 *رقم الطلب:* {$ref}\n";
$msg .= "👤 *العميل:* {$client}\n";
$msg .= "📞 *الهاتف:* {$phone}\n";
$msg .= "📍 *المنطقة:* {$gov}" . ($block ? " — قطعة {$block}" : "") . "\n";
$msg .= "💳 *الدفع:* {$payment}\n";
$msg .= "💰 *الإجمالي:* {$total} د.ك\n";
if ($itemLines) {
    $msg .= "\n🛒 *المنتجات:*\n{$itemLines}";
}
$msg .= "\n⏰ " . date('Y-m-d H:i');

// ── إرسال عبر Green API لكل رقم ──────────────────────────
$results = [];

foreach ($numbers as $entry) {
    $toPhone    = preg_replace('/[^0-9]/', '', $entry['phone'] ?? '');
    $instanceId = trim($entry['instanceId'] ?? '');
    $apiToken   = trim($entry['apiToken']   ?? '');

    if (!$toPhone || !$instanceId || !$apiToken) {
        $results[] = ['phone' => $toPhone, 'status' => 'skipped - missing fields'];
        continue;
    }

    // Green API format: phone@c.us
    $chatId = $toPhone . '@c.us';

    $url  = "https://api.green-api.com/waInstance{$instanceId}/sendMessage/{$apiToken}";
    $data = json_encode(['chatId' => $chatId, 'message' => $msg]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST,           true);
    curl_setopt($ch, CURLOPT_POSTFIELDS,     $data);
    curl_setopt($ch, CURLOPT_HTTPHEADER,     ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT,        15);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $results[] = ['phone' => $toPhone, 'status' => $code === 200 ? 'sent' : 'failed', 'code' => $code, 'response' => $resp];
}

echo json_encode(['success' => true, 'results' => $results]);
