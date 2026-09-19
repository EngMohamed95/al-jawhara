<?php

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_name('jawhara_session');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function authUser() {
    return isset($_SESSION['user']) && is_array($_SESSION['user']) ? $_SESSION['user'] : null;
}

function authIsStaff($user = null) {
    $user = $user ?: authUser();
    return $user && ($user['role'] ?? 'customer') !== 'customer';
}

function authCanWrite($table, $user = null) {
    $user = $user ?: authUser();
    $role = $user['role'] ?? 'customer';
    if ($role === 'admin') return true;
    if ($role !== 'editor') return false;
    return in_array($table, [
        'products', 'orders', 'coupons', 'categories', 'clients',
        'client_sectors', 'gallery_images', 'site_content',
    ], true);
}

function authPublicUser($user) {
    if (!$user) return $user;
    unset($user['password']);
    return $user;
}

function authDeny() {
    http_response_code(401);
    echo json_encode(['error' => 'Authentication required'], JSON_UNESCAPED_UNICODE);
    exit;
}
