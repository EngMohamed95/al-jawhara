<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }

$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) { mkdir($uploadDir, 0755, true); }

$allowed = ['image/jpeg','image/png','image/webp','image/gif'];
$maxSize = 5 * 1024 * 1024; // 5MB

// Single file: field "file"
// Multiple files: field "files[]"
$results = [];

$files = [];
if (!empty($_FILES['file']['name'])) {
    $files[] = $_FILES['file'];
}
if (!empty($_FILES['files']['name'])) {
    $count = count($_FILES['files']['name']);
    for ($i = 0; $i < $count; $i++) {
        $files[] = [
            'name'     => $_FILES['files']['name'][$i],
            'type'     => $_FILES['files']['type'][$i],
            'tmp_name' => $_FILES['files']['tmp_name'][$i],
            'error'    => $_FILES['files']['error'][$i],
            'size'     => $_FILES['files']['size'][$i],
        ];
    }
}

foreach ($files as $f) {
    if ($f['error'] !== UPLOAD_ERR_OK) continue;
    if ($f['size'] > $maxSize)         continue;
    if (!in_array($f['type'], $allowed)) continue;

    $ext  = pathinfo($f['name'], PATHINFO_EXTENSION);
    $name = uniqid('img_', true) . '.' . strtolower($ext);
    $dest = $uploadDir . $name;

    if (move_uploaded_file($f['tmp_name'], $dest)) {
        $results[] = '/api/uploads/' . $name;
    }
}

if (empty($results)) {
    http_response_code(400);
    echo json_encode(['error' => 'No valid files uploaded']);
    exit;
}

echo json_encode(count($results) === 1 ? ['url' => $results[0]] : ['urls' => $results]);
