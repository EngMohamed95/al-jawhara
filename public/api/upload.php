<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }

$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) { 
    if (!mkdir($uploadDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'فشل في إنشاء مجلد الرفع. يرجى التحقق من صلاحيات المجلدات على الخادم. / Failed to create upload directory. Check folder permissions.']);
        exit;
    }
}

if (!is_writable($uploadDir)) {
    http_response_code(500);
    echo json_encode(['error' => 'مجلد الرفع غير قابل للكتابة. يرجى تعديل الصلاحيات إلى 755 أو 777. / Upload directory is not writable. Check folder permissions.']);
    exit;
}

$allowed = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/bmp'
];
$maxSize = 10 * 1024 * 1024; // 10MB

$results = [];
$errors = [];

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

if (empty($files)) {
    // Check if POST was exceeded (e.g. post_max_size in php.ini)
    if (empty($_FILES) && $_SERVER['CONTENT_LENGTH'] > 0) {
        $postMax = ini_get('post_max_size');
        http_response_code(400);
        echo json_encode(['error' => "حجم الملفات المرفوعة يتجاوز الحد الأقصى المسموح به على الخادم ({$postMax}). / Total upload size exceeds post_max_size limit on the server (max: {$postMax})"]);
        exit;
    }
    http_response_code(400);
    echo json_encode(['error' => 'لم يتم إرسال أي ملفات للرفع. / No files were uploaded.']);
    exit;
}

foreach ($files as $f) {
    if ($f['error'] !== UPLOAD_ERR_OK) {
        switch ($f['error']) {
            case UPLOAD_ERR_INI_SIZE:
                $uploadMax = ini_get('upload_max_filesize');
                $errors[] = "الملف '{$f['name']}' يتجاوز الحد الأقصى المسموح به في إعدادات الخادم ({$uploadMax}). / File exceeds upload_max_filesize limit on the server (max: {$uploadMax})";
                break;
            case UPLOAD_ERR_FORM_SIZE:
                $errors[] = "الملف '{$f['name']}' يتجاوز الحد الأقصى المسموح به في النموذج. / File exceeds MAX_FILE_SIZE specified in the HTML form";
                break;
            case UPLOAD_ERR_PARTIAL:
                $errors[] = "تم رفع جزء من الملف فقط '{$f['name']}'. / File was only partially uploaded";
                break;
            case UPLOAD_ERR_NO_FILE:
                $errors[] = "لم يتم رفع أي ملف.";
                break;
            case UPLOAD_ERR_NO_TMP_DIR:
                $errors[] = "مجلد الملفات المؤقتة مفقود على الخادم. / Missing a temporary folder on the server";
                break;
            case UPLOAD_ERR_CANT_WRITE:
                $errors[] = "فشل كتابة الملف '{$f['name']}' على القرص. / Failed to write file to disk";
                break;
            case UPLOAD_ERR_EXTENSION:
                $errors[] = "تسبب إضافة PHP في إيقاف رفع الملف.";
                break;
            default:
                $errors[] = "خطأ غير معروف أثناء رفع الملف '{$f['name']}'.";
        }
        continue;
    }

    if ($f['size'] > $maxSize) {
        $errors[] = "الملف '{$f['name']}' كبير جداً. الحد الأقصى المسموح به هو 10 ميجابايت. / File is too large. Max allowed: 10MB";
        continue;
    }

    // Check mime type
    $mimeType = $f['type'];
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $detectedMime = finfo_file($finfo, $f['tmp_name']);
        finfo_close($finfo);
        if ($detectedMime) {
            $mimeType = $detectedMime;
        }
    }

    $ext  = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp'];
    
    if (!in_array($mimeType, $allowed) && !in_array($ext, $allowedExtensions)) {
        $errors[] = "نوع الملف غير مدعوم ({$mimeType}). الملفات المسموح بها هي الصور فقط. / Unsupported file type ({$mimeType})";
        continue;
    }

    // Default to extension from file name, or fallback to mime-based extension
    if (empty($ext)) {
        $mimeMap = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
            'image/gif'  => 'gif',
            'image/svg+xml' => 'svg',
            'image/bmp'  => 'bmp'
        ];
        $ext = $mimeMap[$mimeType] ?? 'jpg';
    }

    $name = uniqid('img_', true) . '.' . $ext;
    $dest = $uploadDir . $name;

    if (move_uploaded_file($f['tmp_name'], $dest)) {
        $results[] = '/api/uploads/' . $name;
    } else {
        $errors[] = "فشل نقل الملف المرفوع '{$f['name']}' إلى المجلد النهائي. يرجى التحقق من صلاحيات المجلد. / Failed to move uploaded file. Check directory permissions.";
    }
}

if (empty($results)) {
    http_response_code(400);
    echo json_encode([
        'error' => !empty($errors) ? implode(' | ', $errors) : 'فشل في رفع الصور / Failed to upload images',
        'details' => $errors
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$response = count($results) === 1 ? ['url' => $results[0]] : ['urls' => $results];
if (!empty($errors)) {
    $response['errors'] = $errors;
}
echo json_encode($response, JSON_UNESCAPED_UNICODE);
