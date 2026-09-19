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
    if (file_exists($configFile)) {
        require_once $configFile;
    }

    $envConfig = [
        'TAP_SECRET_KEY_TEST' => getenv('TAP_SECRET_KEY_TEST'),
        'TAP_SECRET_KEY_LIVE' => getenv('TAP_SECRET_KEY_LIVE'),
        'TAP_SITE_URL'        => getenv('TAP_SITE_URL'),
    ];
    foreach ($envConfig as $name => $value) {
        if (!defined($name) && is_string($value) && $value !== '') {
            define($name, $value);
        }
    }

    if (!defined('TAP_SECRET_KEY_TEST')) define('TAP_SECRET_KEY_TEST', '');
    if (!defined('TAP_SECRET_KEY_LIVE')) define('TAP_SECRET_KEY_LIVE', '');

    if (!defined('TAP_SITE_URL') || (TAP_SECRET_KEY_TEST === '' && TAP_SECRET_KEY_LIVE === '')) {
        tapRespond(['error' => 'Tap payment configuration is incomplete'], 503);
    }

    if (!filter_var(TAP_SITE_URL, FILTER_VALIDATE_URL) || parse_url(TAP_SITE_URL, PHP_URL_SCHEME) !== 'https') {
        tapRespond(['error' => 'Tap site URL must be a valid HTTPS URL'], 503);
    }
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

function tapIsEnabled($pdo) {
    try {
        $stmt = $pdo->prepare("SELECT paymentSettings FROM site_content WHERE id = 1");
        $stmt->execute();
        $row = $stmt->fetch();
        if ($row && !empty($row['paymentSettings'])) {
            $settings = json_decode($row['paymentSettings'], true);
            return !empty($settings['tap']['enabled']);
        }
    } catch (\PDOException $e) {
    }
    return false;
}

function tapSecretKey($testMode) {
    $key = $testMode ? TAP_SECRET_KEY_TEST : TAP_SECRET_KEY_LIVE;
    $expectedPrefix = $testMode ? 'sk_test_' : 'sk_live_';
    if (!is_string($key) || strpos($key, $expectedPrefix) !== 0 || strpos($key, 'REPLACE_WITH_') !== false) {
        tapRespond(['error' => $testMode ? 'Tap test key is not configured' : 'Tap live key is not configured'], 503);
    }
    return $key;
}

/* Both keys — used by the webhook, which must verify a signature without
   knowing in advance whether the charge that triggered it was test or live. */
function tapBothSecretKeys() {
    return array_values(array_filter(
        [TAP_SECRET_KEY_LIVE, TAP_SECRET_KEY_TEST],
        function ($key) {
            return is_string($key)
                && preg_match('/^sk_(live|test)_/', $key)
                && strpos($key, 'REPLACE_WITH_') === false;
        }
    ));
}

function tapCurrencyDecimals($currency) {
    return in_array(strtoupper((string)$currency), ['BHD', 'JOD', 'KWD', 'OMR'], true) ? 3 : 2;
}

function tapFormatAmount($amount, $currency) {
    return number_format((float)$amount, tapCurrencyDecimals($currency), '.', '');
}

function tapPaymentStatus($tapStatus) {
    $status = strtoupper((string)$tapStatus);
    if ($status === 'CAPTURED') return 'paid';

    $failedStatuses = [
        'FAILED', 'DECLINED', 'CANCELLED', 'ABANDONED',
        'RESTRICTED', 'TIMEDOUT', 'VOID', 'UNKNOWN',
    ];
    if (in_array($status, $failedStatuses, true)) return 'failed';

    return 'pending';
}

function tapOrderTokenIsValid($order, $token) {
    $storedHash = $order['tapPaymentTokenHash'] ?? '';
    if (!is_string($storedHash) || strlen($storedHash) !== 64 || !is_string($token) || $token === '') {
        return false;
    }
    return hash_equals($storedHash, hash('sha256', $token));
}

function tapApiRequest($method, $path, $secretKey, $body = null, $extraHeaders = []) {
    $ch = curl_init('https://api.tap.company/v2/' . ltrim($path, '/'));
    $headers = [
        'Authorization: Bearer ' . $secretKey,
        'Content-Type: application/json',
    ];
    $headers = array_merge($headers, $extraHeaders);
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
