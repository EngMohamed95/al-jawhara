<?php
/**
 * mailer-common.php — دالة إرسال SMTP مشتركة (Gmail SMTP)
 * يفترض أن email-config.php تم تحميله مسبقاً (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_FROM_NAME)
 */

// ── SMTP Sender ───────────────────────────────────────────
// $recipients: array of ['email' => string, 'name' => string]
function sendSmtp($recipients, $subject, $htmlBody) {
    if (empty($recipients)) throw new Exception('No recipients');

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

    $toHeaderParts = [];
    foreach ($recipients as $rcpt) {
        $r = $cmd('RCPT TO:<' . $rcpt['email'] . '>');
        if (strpos($r, '250') === false) throw new Exception("RCPT failed for {$rcpt['email']}: $r");
        $encodedName = '=?UTF-8?B?' . base64_encode($rcpt['name'] ?? '') . '?=';
        $toHeaderParts[] = "{$encodedName} <{$rcpt['email']}>";
    }

    $cmd('DATA');

    $encodedFrom = '=?UTF-8?B?' . base64_encode(SMTP_FROM_NAME) . '?=';

    $msg  = "From: {$encodedFrom} <" . SMTP_FROM . ">\r\n";
    $msg .= "To: " . implode(', ', $toHeaderParts) . "\r\n";
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
