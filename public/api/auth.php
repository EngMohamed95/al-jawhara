<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth-common.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET' && $action === 'me') {
    $user = authUser();
    if (!$user) authDeny();
    echo json_encode($user, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST' && $action === 'login') {
    $body = json_decode(file_get_contents('php://input'), true) ?: [];
    $username = trim((string)($body['username'] ?? ''));
    $password = (string)($body['password'] ?? '');
    if ($username === '' || $password === '') authDeny();

    $stmt = $pdo->prepare('SELECT * FROM users WHERE username = :username LIMIT 1');
    $stmt->execute(['username' => $username]);
    $user = $stmt->fetch();
    $stored = (string)($user['password'] ?? '');
    $passwordInfo = password_get_info($stored);
    $isHash = !empty($passwordInfo['algo']);
    $valid = $user && (
        ($isHash && password_verify($password, $stored))
        || (!$isHash && hash_equals($stored, $password))
    );
    if (!$valid || (($user['status'] ?? 'active') !== 'active')) authDeny();

    if (!$isHash || password_needs_rehash($stored, PASSWORD_DEFAULT)) {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $update = $pdo->prepare('UPDATE users SET password = :password WHERE id = :id');
        $update->execute(['password' => $hash, 'id' => $user['id']]);
    }

    session_regenerate_id(true);
    $_SESSION['user'] = authPublicUser($user);
    echo json_encode($_SESSION['user'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST' && $action === 'logout') {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], '', $params['secure'], $params['httponly']);
    }
    session_destroy();
    echo json_encode(['success' => true]);
    exit;
}

if ($method === 'POST' && $action === 'change-password') {
    $sessionUser = authUser();
    if (!$sessionUser) authDeny();
    $body = json_decode(file_get_contents('php://input'), true) ?: [];
    $currentPassword = (string)($body['currentPassword'] ?? '');
    $newPassword = (string)($body['newPassword'] ?? '');
    if (strlen($newPassword) < 8) {
        http_response_code(400);
        echo json_encode(['error' => 'Password must be at least 8 characters']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT password FROM users WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $sessionUser['id']]);
    $stored = (string)$stmt->fetchColumn();
    $info = password_get_info($stored);
    $valid = !empty($info['algo']) ? password_verify($currentPassword, $stored) : hash_equals($stored, $currentPassword);
    if (!$valid) authDeny();

    $update = $pdo->prepare('UPDATE users SET password = :password WHERE id = :id');
    $update->execute(['password' => password_hash($newPassword, PASSWORD_DEFAULT), 'id' => $sessionUser['id']]);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
