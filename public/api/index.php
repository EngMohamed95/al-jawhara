<?php
/**
 * Jawhara REST API — MySQL implementation
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

// Resource to Table Mapping
$tableMapping = [
    'products'     => 'products',
    'orders'       => 'orders',
    'users'        => 'users',
    'coupons'      => 'coupons',
    'categories'   => 'categories',
    'clients'      => 'clients',
    'clientSectors'=> 'client_sectors',
    'galleryImages'=> 'gallery_images',
    'siteContent'  => 'site_content',
    'site_content' => 'site_content'
];

function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Post-processes rows from MySQL to match expected client JSON structure
function postProcessRow($resource, $row) {
    if (!$row) return $row;
    
    // Cast numeric fields appropriately
    if (isset($row['id'])) {
        $row['id'] = (int)$row['id'];
    }
    if (isset($row['price'])) {
        $row['price'] = (float)$row['price'];
    }
    if (isset($row['stock'])) {
        $row['stock'] = (int)$row['stock'];
    }
    if (isset($row['qty'])) {
        $row['qty'] = (int)$row['qty'];
    }
    if (isset($row['sortOrder'])) {
        $row['sortOrder'] = (int)$row['sortOrder'];
    }
    if (isset($row['parentId'])) {
        $row['parentId'] = $row['parentId'] !== null ? (int)$row['parentId'] : null;
    }
    if (isset($row['value'])) {
        $row['value'] = (float)$row['value'];
    }
    if (isset($row['minOrder'])) {
        $row['minOrder'] = (float)$row['minOrder'];
    }
    if (isset($row['maxUses'])) {
        $row['maxUses'] = (int)$row['maxUses'];
    }
    if (isset($row['usedCount'])) {
        $row['usedCount'] = (int)$row['usedCount'];
    }

    // Decode JSON fields
    if ($resource === 'products' && isset($row['specs'])) {
        $row['specs'] = json_decode($row['specs'], true) ?: [];
    }
    if ($resource === 'products' && isset($row['gallery'])) {
        $row['gallery'] = json_decode($row['gallery'], true) ?: [];
    }
    if ($resource === 'products' && isset($row['variants'])) {
        $row['variants'] = json_decode($row['variants'], true) ?: [];
    }
    if (($resource === 'siteContent' || $resource === 'site_content')) {
        if (isset($row['paymentSettings'])) {
            $row['paymentSettings'] = json_decode($row['paymentSettings'], true) ?: new stdClass();
        }
        if (isset($row['shippingZones'])) {
            $row['shippingZones'] = json_decode($row['shippingZones'], true) ?: [];
        }
        if (isset($row['whatsappNumbers'])) {
            $row['whatsappNumbers'] = json_decode($row['whatsappNumbers'], true) ?: [];
        }
    }
    return $row;
}

// Pre-processes row fields before inserting/updating MySQL
function preProcessField($resource, $key, $value) {
    if ($resource === 'products' && in_array($key, ['specs', 'gallery', 'variants'])) {
        return json_encode($value, JSON_UNESCAPED_UNICODE);
    }
    if (($resource === 'siteContent' || $resource === 'site_content') && 
        in_array($key, ['paymentSettings', 'shippingZones', 'whatsappNumbers'])) {
        return json_encode($value, JSON_UNESCAPED_UNICODE);
    }
    return $value;
}

// ── Parse request ────────────────────────────────────────
$rawQuery = $_SERVER['QUERY_STRING'] ?? '';
$rawPath = '';

if (preg_match('/(?:^|&)path=([^&]*)/i', $rawQuery, $matches)) {
    $rawPath = rawurldecode($matches[1]);
} elseif (isset($_GET['path'])) {
    $rawPath = $_GET['path'];
}
$rawPath = trim($rawPath, '/');
$method  = $_SERVER['REQUEST_METHOD'];
$body    = json_decode(file_get_contents('php://input'), true) ?: [];

$uri = parse_url($rawPath);
$path = trim($uri['path'] ?? '', '/');
$pathQS = $uri['query'] ?? '';

$parts    = explode('/', $path);
$resource = $parts[0] ?? '';
$id       = isset($parts[1]) ? (int)$parts[1] : null;

// Query params
$query = $_GET;
unset($query['path']);
if ($pathQS !== '') {
    parse_str($pathQS, $pathQuery);
    $query = array_merge($pathQuery, $query);
}

// Method spoofing to bypass server limits on PUT/DELETE
if ($method === 'POST' && isset($query['_method'])) {
    $tunnel = strtoupper($query['_method']);
    if ($tunnel === 'PUT' || $tunnel === 'DELETE') {
        $method = $tunnel;
    }
}

if (!isset($tableMapping[$resource])) {
    respond(['error' => 'Resource not found'], 404);
}

$table = $tableMapping[$resource];

// ── Singleton: siteContent ───────────────────────────────
if ($table === 'site_content') {
    if ($method === 'GET') {
        $stmt = $pdo->prepare("SELECT * FROM site_content WHERE id = 1");
        $stmt->execute();
        $row = $stmt->fetch();
        if (!$row) {
            respond(new stdClass());
        }
        respond(postProcessRow($resource, $row));
    }
    if ($method === 'PUT') {
        // Find existing record to merge
        $stmt = $pdo->prepare("SELECT * FROM site_content WHERE id = 1");
        $stmt->execute();
        $existing = $stmt->fetch() ?: [];
        
        $merged = array_merge($existing, $body);
        $merged['id'] = 1;

        // Construct update query
        $fields = [];
        $params = [];
        foreach ($merged as $k => $v) {
            if ($k === 'id') continue;
            $fields[] = "`$k` = :$k";
            $params[$k] = preProcessField($resource, $k, $v);
        }
        
        if (!empty($fields)) {
            $sql = "UPDATE site_content SET " . implode(', ', $fields) . " WHERE id = 1";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        }
        
        $stmt = $pdo->prepare("SELECT * FROM site_content WHERE id = 1");
        $stmt->execute();
        respond(postProcessRow($resource, $stmt->fetch()));
    }
}

// ── Collections ──────────────────────────────────────────

// GET all (with optional filter)
if ($method === 'GET' && $id === null) {
    $sql = "SELECT * FROM `$table`";
    $where = [];
    $params = [];
    
    $columns = [];
    try {
        $columns = $pdo->query("DESCRIBE `$table`")->fetchAll(PDO::FETCH_COLUMN);
    } catch (\PDOException $e) {
    }
    
    foreach ($query as $k => $v) {
        // Only filter on columns that actually exist in the table to prevent SQL errors
        if (in_array($k, $columns)) {
            $where[] = "`$k` = :$k";
            $params[$k] = $v;
        }
    }
    
    if (!empty($where)) {
        $sql .= " WHERE " . implode(' AND ', $where);
    }
    
    // Sort categories or products if applicable
    if ($table === 'categories' || $table === 'clients' || $table === 'client_sectors' || $table === 'products' || $table === 'gallery_images') {
        $sql .= " ORDER BY sortOrder ASC";
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    
    $processed = [];
    foreach ($rows as $row) {
        $processed[] = postProcessRow($resource, $row);
    }
    respond($processed);
}

// GET by id
if ($method === 'GET' && $id !== null) {
    $stmt = $pdo->prepare("SELECT * FROM `$table` WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();
    if (!$row) respond(['error' => 'Not found'], 404);
    respond(postProcessRow($resource, $row));
}

// POST
if ($method === 'POST') {
    // For users, generate timestamp ID if not provided
    if ($table === 'users' && !isset($body['id'])) {
        $body['id'] = (int)round(microtime(true) * 1000);
    }
    
    $keys = [];
    $placeholders = [];
    $params = [];
    
    $columns = [];
    try {
        $columns = $pdo->query("DESCRIBE `$table`")->fetchAll(PDO::FETCH_COLUMN);
    } catch (\PDOException $e) {
    }
    
    foreach ($body as $k => $v) {
        // Check if column exists
        if (in_array($k, $columns)) {
            $keys[] = "`$k`";
            $placeholders[] = ":$k";
            $params[$k] = preProcessField($resource, $k, $v);
        }
    }
    
    if (empty($keys)) {
        respond(['error' => 'Invalid data fields'], 400);
    }
    
    $sql = "INSERT INTO `$table` (" . implode(', ', $keys) . ") VALUES (" . implode(', ', $placeholders) . ")";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    $newId = ($table === 'users') ? $body['id'] : $pdo->lastInsertId();
    
    $stmt = $pdo->prepare("SELECT * FROM `$table` WHERE id = :id");
    $stmt->execute(['id' => $newId]);
    respond(postProcessRow($resource, $stmt->fetch()), 201);
}

// PUT
if ($method === 'PUT' && $id !== null) {
    // Verify existence
    $stmt = $pdo->prepare("SELECT * FROM `$table` WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $existing = $stmt->fetch();
    if (!$existing) respond(['error' => 'Not found'], 404);
    
    $fields = [];
    $params = ['_id' => $id];
    
    $columns = [];
    try {
        $columns = $pdo->query("DESCRIBE `$table`")->fetchAll(PDO::FETCH_COLUMN);
    } catch (\PDOException $e) {
    }
    
    foreach ($body as $k => $v) {
        if ($k === 'id') continue;
        // Check if column exists
        if (in_array($k, $columns)) {
            $fields[] = "`$k` = :$k";
            $params[$k] = preProcessField($resource, $k, $v);
        }
    }
    
    if (!empty($fields)) {
        $sql = "UPDATE `$table` SET " . implode(', ', $fields) . " WHERE id = :_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }
    
    $stmt = $pdo->prepare("SELECT * FROM `$table` WHERE id = :id");
    $stmt->execute(['id' => $id]);
    respond(postProcessRow($resource, $stmt->fetch()));
}

// DELETE
if ($method === 'DELETE' && $id !== null) {
    $stmt = $pdo->prepare("DELETE FROM `$table` WHERE id = :id");
    $stmt->execute(['id' => $id]);
    respond(null, 200);
}

respond(['error' => 'Bad request'], 400);

