<?php
/**
 * Jawhara REST API — PHP implementation
 * Stores data in data.json (same folder)
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$dataFile = __DIR__ . '/data.json';

// ── Load DB ──────────────────────────────────────────────
function loadDB($file) {
    if (!file_exists($file)) return ['products'=>[],'orders'=>[],'users'=>[],'siteContent'=>[]];
    return json_decode(file_get_contents($file), true) ?: [];
}
function saveDB($file, $db) {
    file_put_contents($file, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}
function nextId($arr) {
    if (empty($arr)) return 1;
    return max(array_column($arr, 'id')) + 1;
}
function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// ── Parse request ────────────────────────────────────────
$path   = isset($_GET['path']) ? trim($_GET['path'], '/') : '';
$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?: [];
$parts  = explode('/', $path);
$resource = $parts[0] ?? '';
$id       = isset($parts[1]) ? (int)$parts[1] : null;

// Query params (excluding 'path')
$query = $_GET;
unset($query['path']);

$db = loadDB($dataFile);

// ── Singleton: siteContent ───────────────────────────────
if ($resource === 'siteContent') {
    if ($method === 'GET') {
        respond($db['siteContent'][0] ?? new stdClass());
    }
    if ($method === 'PUT') {
        $db['siteContent'][0] = array_merge($db['siteContent'][0] ?? [], $body);
        saveDB($dataFile, $db);
        respond($db['siteContent'][0]);
    }
}

// ── Collections ──────────────────────────────────────────
if (!isset($db[$resource])) respond(['error' => 'Resource not found'], 404);

$col = &$db[$resource];

// GET all (with optional filter)
if ($method === 'GET' && $id === null) {
    $result = $col;
    foreach ($query as $k => $v) {
        $result = array_values(array_filter($result, fn($item) =>
            isset($item[$k]) && (string)$item[$k] === (string)$v
        ));
    }
    respond(array_values($result));
}

// GET by id
if ($method === 'GET' && $id !== null) {
    $item = current(array_filter($col, fn($x) => $x['id'] === $id));
    if (!$item) respond(['error' => 'Not found'], 404);
    respond($item);
}

// POST
if ($method === 'POST') {
    $body['id'] = nextId($col);
    $col[] = $body;
    saveDB($dataFile, $db);
    respond($body, 201);
}

// PUT
if ($method === 'PUT' && $id !== null) {
    foreach ($col as &$item) {
        if ($item['id'] === $id) {
            $item = array_merge($item, $body);
            $item['id'] = $id;
            saveDB($dataFile, $db);
            respond($item);
        }
    }
    respond(['error' => 'Not found'], 404);
}

// DELETE
if ($method === 'DELETE' && $id !== null) {
    $col = array_values(array_filter($col, fn($x) => $x['id'] !== $id));
    saveDB($dataFile, $db);
    respond(null, 200);
}

respond(['error' => 'Bad request'], 400);
