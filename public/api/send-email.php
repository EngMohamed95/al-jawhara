<?php
/**
 * send-email.php — إرسال إيميل تأكيد الطلب للعميل عن طريق Gmail SMTP
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }

// ── تحميل الإعدادات ───────────────────────────────────────
$configFile = __DIR__ . '/email-config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Email config missing']);
    exit;
}
require_once $configFile;

// ── SMTP Sender ───────────────────────────────────────────
function sendSmtp($toEmail, $toName, $subject, $htmlBody) {
    $sock = fsockopen(SMTP_HOST, SMTP_PORT, $errno, $errstr, 15);
    if (!$sock) throw new Exception("Cannot connect to SMTP: $errstr ($errno)");

    $read = function() use ($sock) {
        $out = '';
        while ($line = fgets($sock, 1024)) {
            $out .= $line;
            if ($line[3] === ' ') break;
        }
        return $out;
    };

    $cmd = function($line) use ($sock, $read) {
        fwrite($sock, $line . "\r\n");
        return $read();
    };

    $read();                               // 220 greeting
    $cmd('EHLO smtp.gmail.com');
    $r = $cmd('STARTTLS');
    if (strpos($r, '220') === false) throw new Exception("STARTTLS failed: $r");

    stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);

    $cmd('EHLO smtp.gmail.com');
    $cmd('AUTH LOGIN');
    $cmd(base64_encode(SMTP_USER));
    $r = $cmd(base64_encode(SMTP_PASS));
    if (strpos($r, '235') === false) throw new Exception("Auth failed: $r");

    $cmd('MAIL FROM:<' . SMTP_FROM . '>');
    $r = $cmd('RCPT TO:<' . $toEmail . '>');
    if (strpos($r, '250') === false) throw new Exception("RCPT failed: $r");

    $cmd('DATA');

    $encodedFrom = '=?UTF-8?B?' . base64_encode(SMTP_FROM_NAME) . '?=';
    $encodedTo   = '=?UTF-8?B?' . base64_encode($toName) . '?=';

    $msg  = "From: {$encodedFrom} <" . SMTP_FROM . ">\r\n";
    $msg .= "To: {$encodedTo} <{$toEmail}>\r\n";
    $msg .= "Subject: {$subject}\r\n";
    $msg .= "MIME-Version: 1.0\r\n";
    $msg .= "Content-Type: text/html; charset=UTF-8\r\n";
    $msg .= "\r\n";
    $msg .= $htmlBody;
    $msg .= "\r\n.";

    $r = $cmd($msg);
    if (strpos($r, '250') === false) throw new Exception("DATA failed: $r");

    $cmd('QUIT');
    fclose($sock);
    return true;
}

// ── قراءة بيانات الطلب ───────────────────────────────────
$body = json_decode(file_get_contents('php://input'), true);
if (!$body || empty($body['email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing email']);
    exit;
}

$toEmail     = filter_var($body['email'],       FILTER_SANITIZE_EMAIL);
$toName      = htmlspecialchars($body['client']      ?? '', ENT_QUOTES, 'UTF-8');
$orderRef    = htmlspecialchars($body['ref']         ?? '', ENT_QUOTES, 'UTF-8');
$orderDate   = htmlspecialchars($body['date']        ?? '', ENT_QUOTES, 'UTF-8');
$phone       = htmlspecialchars($body['phone']       ?? '', ENT_QUOTES, 'UTF-8');
$address     = htmlspecialchars($body['address']     ?? '', ENT_QUOTES, 'UTF-8');
$governorate = htmlspecialchars($body['governorate'] ?? '', ENT_QUOTES, 'UTF-8');
$block       = htmlspecialchars($body['block']       ?? '', ENT_QUOTES, 'UTF-8');
$notes       = htmlspecialchars($body['notes']       ?? '', ENT_QUOTES, 'UTF-8');
$payment     = $body['payment'] ?? 'cash';
$deliveryFee = number_format((float)($body['deliveryFee'] ?? 0), 3);
$grandTotal  = number_format((float)($body['grandTotal']  ?? $body['total'] ?? 0), 3);
$subtotal    = number_format((float)($body['total']       ?? 0), 3);
$items       = $body['items'] ?? [];

$paymentLabels = [
    'cash'       => 'الدفع عند الاستلام (كاش)',
    'transfer'   => 'تحويل بنكي',
    'knet'       => 'KNET',
    'myfatoorah' => 'MyFatoorah',
    'tap'        => 'Tap',
    'benefitpay' => 'Benefit Pay',
];
$paymentLabel = $paymentLabels[$payment] ?? $payment;
$fullAddress  = trim(implode('، ', array_filter([$governorate, $block ? "قطعة $block" : '', $address])));

// ── جدول المنتجات ────────────────────────────────────────
$itemsRows = '';
foreach ($items as $item) {
    $name      = htmlspecialchars($item['name'] ?? '', ENT_QUOTES, 'UTF-8');
    $qty       = (int)($item['qty'] ?? 1);
    $price     = (float)($item['price'] ?? 0);
    $lineTotal = number_format($price * $qty, 3);
    $itemsRows .= "
    <tr>
      <td style='padding:10px 14px;border-bottom:1px solid #f0f0f0;color:#374151;'>{$name}</td>
      <td style='padding:10px 14px;border-bottom:1px solid #f0f0f0;text-align:center;color:#6b7280;'>{$qty}</td>
      <td style='padding:10px 14px;border-bottom:1px solid #f0f0f0;text-align:left;color:#374151;font-weight:600;'>{$lineTotal} د.ك</td>
    </tr>";
}

// ── قسم الملاحظات ────────────────────────────────────────
$notesBlock = $notes ? "
<tr>
  <td style='padding:0 40px 24px;'>
    <div style='background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;'>
      <span style='color:#92400e;font-size:13px;font-weight:600;'>ملاحظات: </span>
      <span style='color:#78350f;font-size:13px;'>{$notes}</span>
    </div>
  </td>
</tr>" : '';

// ── قالب الإيميل ─────────────────────────────────────────
$html = <<<HTML
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:30px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#16a34a,#15803d);padding:36px 40px;text-align:center;">
    <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;">الجوهرة</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">منتجات الورق والمناديل</p>
  </td></tr>

  <!-- Welcome -->
  <tr><td style="padding:36px 40px 24px;">
    <h2 style="margin:0 0 12px;color:#111827;font-size:22px;">مرحباً {$toName}!</h2>
    <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.7;">شكراً لثقتك بالجوهرة. تم استلام طلبك بنجاح وسيتم التواصل معك قريباً لتأكيد موعد التوصيل.</p>
  </td></tr>

  <!-- Order Info -->
  <tr><td style="padding:0 40px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
      <tr><td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
        <span style="color:#6b7280;font-size:13px;">رقم الطلب</span>
        <span style="float:left;color:#16a34a;font-weight:700;font-size:15px;font-family:monospace;">{$orderRef}</span>
      </td></tr>
      <tr><td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
        <span style="color:#6b7280;font-size:13px;">تاريخ الطلب</span>
        <span style="float:left;color:#374151;font-size:14px;">{$orderDate}</span>
      </td></tr>
      <tr><td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
        <span style="color:#6b7280;font-size:13px;">طريقة الدفع</span>
        <span style="float:left;color:#374151;font-size:14px;">{$paymentLabel}</span>
      </td></tr>
      <tr><td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
        <span style="color:#6b7280;font-size:13px;">الهاتف</span>
        <span style="float:left;color:#374151;font-size:14px;">{$phone}</span>
      </td></tr>
      <tr><td style="padding:16px 20px;">
        <span style="color:#6b7280;font-size:13px;">عنوان التوصيل</span>
        <span style="float:left;color:#374151;font-size:14px;text-align:left;">{$fullAddress}</span>
      </td></tr>
    </table>
  </td></tr>

  <!-- Items -->
  <tr><td style="padding:0 40px 24px;">
    <h3 style="margin:0 0 12px;color:#111827;font-size:16px;">تفاصيل الطلب</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
      <thead><tr style="background:#f3f4f6;">
        <th style="padding:10px 14px;text-align:right;color:#6b7280;font-size:13px;font-weight:600;">المنتج</th>
        <th style="padding:10px 14px;text-align:center;color:#6b7280;font-size:13px;font-weight:600;">الكمية</th>
        <th style="padding:10px 14px;text-align:left;color:#6b7280;font-size:13px;font-weight:600;">السعر</th>
      </tr></thead>
      <tbody>{$itemsRows}</tbody>
    </table>
  </td></tr>

  <!-- Totals -->
  <tr><td style="padding:0 40px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:6px 0;color:#6b7280;font-size:14px;">المجموع الفرعي</td>
        <td style="padding:6px 0;text-align:left;color:#374151;font-size:14px;">{$subtotal} د.ك</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#6b7280;font-size:14px;">رسوم التوصيل</td>
        <td style="padding:6px 0;text-align:left;color:#374151;font-size:14px;">{$deliveryFee} د.ك</td>
      </tr>
      <tr>
        <td style="padding:12px 0 0;border-top:2px solid #e5e7eb;color:#111827;font-size:16px;font-weight:700;">الإجمالي</td>
        <td style="padding:12px 0 0;border-top:2px solid #e5e7eb;text-align:left;color:#16a34a;font-size:18px;font-weight:700;">{$grandTotal} د.ك</td>
      </tr>
    </table>
  </td></tr>

  {$notesBlock}

  <!-- Footer -->
  <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
    <p style="margin:0 0 8px;color:#374151;font-size:14px;font-weight:600;">شركة الجوهرة للورق والمناديل</p>
    <p style="margin:0;color:#9ca3af;font-size:13px;">للاستفسار: <a href="tel:+96560905080" style="color:#16a34a;text-decoration:none;">60905080</a></p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
HTML;

// ── إرسال ─────────────────────────────────────────────────
$subject = '=?UTF-8?B?' . base64_encode("تأكيد طلبك {$orderRef} — الجوهرة") . '?=';

try {
    sendSmtp($toEmail, $toName, $subject, $html);
    echo json_encode(['success' => true, 'message' => 'Email sent']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
