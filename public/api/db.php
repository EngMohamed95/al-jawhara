<?php
/**
 * Al-Jawhara Database Connection
 */
$privateConfig = __DIR__ . '/db-config.php';
if (file_exists($privateConfig)) require_once $privateConfig;

$dbEnv = [
    'DB_HOST' => getenv('DB_HOST'),
    'DB_NAME' => getenv('DB_NAME'),
    'DB_USER' => getenv('DB_USER'),
    'DB_PASS' => getenv('DB_PASS'),
    'DB_CHARSET' => getenv('DB_CHARSET') ?: 'utf8mb4',
];
foreach ($dbEnv as $name => $value) {
    if (!defined($name) && is_string($value) && $value !== '') define($name, $value);
}

foreach (['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS', 'DB_CHARSET'] as $required) {
    if (!defined($required)) {
        http_response_code(503);
        echo json_encode(['error' => 'Database configuration is incomplete']);
        exit;
    }
}

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (\PDOException $e) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}
