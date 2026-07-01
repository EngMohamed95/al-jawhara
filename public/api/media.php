<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$uploadsDir = __DIR__ . '/uploads/';
$productsImgDir = __DIR__ . '/../products-image/';

// 1. GET - List files
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $files = [];
    
    // Scan uploads/
    if (is_dir($uploadsDir)) {
        $uploadFiles = array_diff(scandir($uploadsDir), ['.', '..', '.gitkeep', 'index.php']);
        foreach ($uploadFiles as $file) {
            if (is_file($uploadsDir . $file)) {
                $files[] = [
                    'name' => $file,
                    'url' => '/api/uploads/' . $file,
                    'type' => 'upload',
                    'size' => filesize($uploadsDir . $file),
                    'mtime' => filemtime($uploadsDir . $file)
                ];
            }
        }
    }
    
    // Scan products-image/
    if (is_dir($productsImgDir)) {
        $prodFiles = array_diff(scandir($productsImgDir), ['.', '..', '.gitkeep', 'index.php']);
        foreach ($prodFiles as $file) {
            if (is_file($productsImgDir . $file)) {
                $files[] = [
                    'name' => $file,
                    'url' => '/products-image/' . $file,
                    'type' => 'product',
                    'size' => filesize($productsImgDir . $file),
                    'mtime' => filemtime($productsImgDir . $file)
                ];
            }
        }
    }
    
    // Sort by modified time descending (newest first)
    usort($files, function($a, $b) {
        return $b['mtime'] - $a['mtime'];
    });
    
    echo json_encode(['files' => $files], JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. DELETE - Delete a file
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Get file and type from query params or body
    $file = $_GET['file'] ?? '';
    $type = $_GET['type'] ?? 'upload';
    
    if (empty($file)) {
        // Fallback to JSON body if query params are empty
        $data = json_decode(file_get_contents('php://input'), true);
        if ($data) {
            $file = $data['file'] ?? '';
            $type = $data['type'] ?? 'upload';
        }
    }
    
    if (empty($file)) {
        http_response_code(400);
        echo json_encode(['error' => 'اسم الملف مطلوب / File parameter is required']);
        exit;
    }
    
    // Security check: prevent directory traversal
    $file = basename($file);
    
    if ($type === 'product') {
        $path = $productsImgDir . $file;
    } else {
        $path = $uploadsDir . $file;
    }
    
    if (file_exists($path)) {
        if (unlink($path)) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'فشل في حذف الملف / Failed to delete file']);
        }
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'الملف غير موجود / File not found']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
exit;
