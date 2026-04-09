<?php
/**
 * send-email.php — إرسال إيميل تأكيد الطلب للعميل عن طريق Gmail SMTP
 * يدعم العربية والإنجليزية حسب اللغة المرسلة
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

    $read();
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

$lang        = ($body['lang'] ?? 'ar') === 'en' ? 'en' : 'ar';
$isAr        = $lang === 'ar';
$dir         = $isAr ? 'rtl' : 'ltr';

$toEmail     = filter_var($body['email'],        FILTER_SANITIZE_EMAIL);
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
$currency    = $isAr ? 'د.ك' : 'KWD';

// ── النصوص حسب اللغة ────────────────────────────────────
$t = $isAr ? [
    'subject'      => "تأكيد طلبك {$orderRef} — الجوهرة",
    'welcome'      => "مرحباً {$toName}!",
    'msg'          => 'شكراً لثقتك بالجوهرة. تم استلام طلبك بنجاح وسيتم التواصل معك قريباً لتأكيد موعد التوصيل.',
    'orderRef'     => 'رقم الطلب',
    'orderDate'    => 'تاريخ الطلب',
    'paymentMethod'=> 'طريقة الدفع',
    'phoneLabel'   => 'الهاتف',
    'addressLabel' => 'عنوان التوصيل',
    'orderDetails' => 'تفاصيل الطلب',
    'product'      => 'المنتج',
    'qty'          => 'الكمية',
    'price'        => 'السعر',
    'subtotal'     => 'المجموع الفرعي',
    'delivery'     => 'رسوم التوصيل',
    'total'        => 'الإجمالي',
    'notes'        => 'ملاحظات',
    'footer'       => 'شركة الجوهرة للورق والمناديل',
    'contact'      => 'للاستفسار',
    'block'        => "قطعة {$block}",
    'payments'     => [
        'cash'       => 'الدفع عند الاستلام (كاش)',
        'transfer'   => 'تحويل بنكي',
        'knet'       => 'KNET',
        'myfatoorah' => 'MyFatoorah',
        'tap'        => 'Tap',
        'benefitpay' => 'Benefit Pay',
    ],
] : [
    'subject'      => "Order Confirmation {$orderRef} — Al-Jawhara",
    'welcome'      => "Hello {$toName}!",
    'msg'          => 'Thank you for shopping with Al-Jawhara. Your order has been received and we will contact you shortly to confirm delivery.',
    'orderRef'     => 'Order Number',
    'orderDate'    => 'Order Date',
    'paymentMethod'=> 'Payment Method',
    'phoneLabel'   => 'Phone',
    'addressLabel' => 'Delivery Address',
    'orderDetails' => 'Order Details',
    'product'      => 'Product',
    'qty'          => 'Qty',
    'price'        => 'Price',
    'subtotal'     => 'Subtotal',
    'delivery'     => 'Delivery Fee',
    'total'        => 'Total',
    'notes'        => 'Notes',
    'footer'       => 'Al-Jawhara Paper & Tissues Co.',
    'contact'      => 'Contact us',
    'block'        => "Block {$block}",
    'payments'     => [
        'cash'       => 'Cash on Delivery',
        'transfer'   => 'Bank Transfer',
        'knet'       => 'KNET',
        'myfatoorah' => 'MyFatoorah',
        'tap'        => 'Tap',
        'benefitpay' => 'Benefit Pay',
    ],
];

$paymentLabel = $t['payments'][$payment] ?? $payment;
$blockStr     = $block ? $t['block'] : '';
$fullAddress  = trim(implode($isAr ? '، ' : ', ', array_filter([$governorate, $blockStr, $address])));

// ── جدول المنتجات ────────────────────────────────────────
$itemsRows = '';
foreach ($items as $item) {
    $name      = htmlspecialchars($item['name'] ?? ($item['nameEn'] ?? ''), ENT_QUOTES, 'UTF-8');
    // لو إنجليزي وفيه nameEn استخدمه
    if (!$isAr && !empty($item['nameEn'])) {
        $name = htmlspecialchars($item['nameEn'], ENT_QUOTES, 'UTF-8');
    }
    $qty       = (int)($item['qty'] ?? 1);
    $price     = (float)($item['price'] ?? 0);
    $lineTotal = number_format($price * $qty, 3);
    $itemsRows .= "
    <tr>
      <td style='padding:10px 14px;border-bottom:1px solid #f0f0f0;color:#374151;'>{$name}</td>
      <td style='padding:10px 14px;border-bottom:1px solid #f0f0f0;text-align:center;color:#6b7280;'>{$qty}</td>
      <td style='padding:10px 14px;border-bottom:1px solid #f0f0f0;text-align:left;color:#374151;font-weight:600;'>{$lineTotal} {$currency}</td>
    </tr>";
}

// ── قسم الملاحظات ────────────────────────────────────────
$notesBlock = $notes ? "
<tr>
  <td style='padding:0 40px 24px;'>
    <div style='background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;'>
      <span style='color:#92400e;font-size:13px;font-weight:600;'>{$t['notes']}: </span>
      <span style='color:#78350f;font-size:13px;'>{$notes}</span>
    </div>
  </td>
</tr>" : '';

// ── قالب الإيميل ─────────────────────────────────────────
$html = <<<HTML
<!DOCTYPE html>
<html dir="{$dir}" lang="{$lang}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:{$dir};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:30px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#1e40af,#1d4ed8);padding:40px;text-align:center;">
    <div style="display:inline-block;background:#ffffff;border-radius:16px;padding:14px 32px;box-shadow:0 4px 16px rgba(0,0,0,0.2);">
      <img src="https://al-jawhara.co/wp-content/uploads/2021/02/MobileJawharaLogo.png" alt="Al-Jawhara" style="height:60px;max-width:180px;display:block;object-fit:contain;" />
    </div>
  </td></tr>

  <!-- Welcome -->
  <tr><td style="padding:36px 40px 24px;">
    <h2 style="margin:0 0 12px;color:#111827;font-size:22px;">{$t['welcome']}</h2>
    <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.7;">{$t['msg']}</p>
  </td></tr>

  <!-- Order Info -->
  <tr><td style="padding:0 40px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
      <tr><td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
        <span style="color:#6b7280;font-size:13px;">{$t['orderRef']}</span>
        <span style="float:left;color:#1d4ed8;font-weight:700;font-size:15px;font-family:monospace;">{$orderRef}</span>
      </td></tr>
      <tr><td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
        <span style="color:#6b7280;font-size:13px;">{$t['orderDate']}</span>
        <span style="float:left;color:#374151;font-size:14px;">{$orderDate}</span>
      </td></tr>
      <tr><td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
        <span style="color:#6b7280;font-size:13px;">{$t['paymentMethod']}</span>
        <span style="float:left;color:#374151;font-size:14px;">{$paymentLabel}</span>
      </td></tr>
      <tr><td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
        <span style="color:#6b7280;font-size:13px;">{$t['phoneLabel']}</span>
        <span style="float:left;color:#374151;font-size:14px;">{$phone}</span>
      </td></tr>
      <tr><td style="padding:16px 20px;">
        <span style="color:#6b7280;font-size:13px;">{$t['addressLabel']}</span>
        <span style="float:left;color:#374151;font-size:14px;text-align:left;">{$fullAddress}</span>
      </td></tr>
    </table>
  </td></tr>

  <!-- Items -->
  <tr><td style="padding:0 40px 24px;">
    <h3 style="margin:0 0 12px;color:#111827;font-size:16px;">{$t['orderDetails']}</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
      <thead><tr style="background:#f3f4f6;">
        <th style="padding:10px 14px;text-align:right;color:#6b7280;font-size:13px;font-weight:600;">{$t['product']}</th>
        <th style="padding:10px 14px;text-align:center;color:#6b7280;font-size:13px;font-weight:600;">{$t['qty']}</th>
        <th style="padding:10px 14px;text-align:left;color:#6b7280;font-size:13px;font-weight:600;">{$t['price']}</th>
      </tr></thead>
      <tbody>{$itemsRows}</tbody>
    </table>
  </td></tr>

  <!-- Totals -->
  <tr><td style="padding:0 40px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:6px 0;color:#6b7280;font-size:14px;">{$t['subtotal']}</td>
        <td style="padding:6px 0;text-align:left;color:#374151;font-size:14px;">{$subtotal} {$currency}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#6b7280;font-size:14px;">{$t['delivery']}</td>
        <td style="padding:6px 0;text-align:left;color:#374151;font-size:14px;">{$deliveryFee} {$currency}</td>
      </tr>
      <tr>
        <td style="padding:12px 0 0;border-top:2px solid #e5e7eb;color:#111827;font-size:16px;font-weight:700;">{$t['total']}</td>
        <td style="padding:12px 0 0;border-top:2px solid #e5e7eb;text-align:left;color:#1d4ed8;font-size:18px;font-weight:700;">{$grandTotal} {$currency}</td>
      </tr>
    </table>
  </td></tr>

  {$notesBlock}

  <!-- Footer -->
  <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
    <p style="margin:0 0 8px;color:#374151;font-size:14px;font-weight:600;">{$t['footer']}</p>
    <p style="margin:0;color:#9ca3af;font-size:13px;">{$t['contact']}: <a href="tel:+96560905080" style="color:#1d4ed8;text-decoration:none;">60905080</a></p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
HTML;

// ── إرسال ─────────────────────────────────────────────────
$subject = '=?UTF-8?B?' . base64_encode($t['subject']) . '?=';

try {
    sendSmtp($toEmail, $toName, $subject, $html);
    echo json_encode(['success' => true, 'message' => 'Email sent']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
