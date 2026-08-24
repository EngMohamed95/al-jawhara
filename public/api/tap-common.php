<?php
/**
 * tap-common.php — shared helpers for the Tap Payments endpoints
 * (tap-charge.php, tap-webhook.php, tap-status.php)
 */

function tapRespond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function tapLoadConfig() {
    $configFile = __DIR__ . '/tap-config.php';
    if (!file_exists($configFile)) {
        tapRespond(['error' => 'Tap config missing — copy tap-config.example.php to tap-config.php and fill in your keys'], 500);
    }
    require_once $configFile;
}

/* Whether Tap should run in test mode — driven by the toggle the merchant
   sets on the Dashboard → Payments tab (site_content.paymentSettings.tap.testMode),
   so switching test/live doesn't require touching server files after setup. */
function tapIsTestMode($pdo) {
    try {
        $stmt = $pdo->prepare("SELECT paymentSettings FROM site_content WHERE id = 1");
        $stmt->execute();
        $row = $stmt->fetch();
        if ($row && !empty($row['paymentSettings'])) {
            $settings = json_decode($row['paymentSettings'], true);
            if (isset($settings['tap']['testMode'])) {
                return (bool)$settings['tap']['testMode'];
            }
        }
    } catch (\PDOException $e) {
    }
    return true; // default to test mode until explicitly switched to live
}

function tapSecretKey($testMode) {
    return $testMode ? TAP_SECRET_KEY_TEST : TAP_SECRET_KEY_LIVE;
}

/* Both keys — used by the webhook, which must verify a signature without
   knowing in advance whether the charge that triggered it was test or live. */
function tapBothSecretKeys() {
    return array_filter([TAP_SECRET_KEY_LIVE, TAP_SECRET_KEY_TEST]);
}

function tapApiRequest($method, $path, $secretKey, $body = null) {
    $ch = curl_init('https://api.tap.company/v2/' . ltrim($path, '/'));
    $headers = [
        'Authorization: Bearer ' . $secretKey,
        'Content-Type: application/json',
    ];
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body, JSON_UNESCAPED_UNICODE));
    }
    $raw  = curl_exec($ch);
    $err  = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($raw === false) {
        return ['ok' => false, 'code' => 0, 'error' => $err];
    }
    $data = json_decode($raw, true);
    return ['ok' => $code >= 200 && $code < 300, 'code' => $code, 'data' => $data];
}
