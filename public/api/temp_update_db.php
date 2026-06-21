<?php
/**
 * Temporary script to update products in MySQL database from data.json
 */
require_once __DIR__ . '/db.php';

header('Content-Type: text/plain; charset=utf-8');

try {
    $dataFile = __DIR__ . '/data.json';
    if (!file_exists($dataFile)) {
        die("Error: data.json not found in " . __DIR__);
    }

    $data = json_decode(file_get_contents($dataFile), true);
    if (!$data || !isset($data['products'])) {
        die("Error: Invalid data.json structure");
    }

    echo "Updating database products...\n";

    $stmt = $pdo->prepare("UPDATE products SET name = :name, nameEn = :nameEn, status = :status WHERE id = :id");

    $updatedCount = 0;
    foreach ($data['products'] as $p) {
        $stmt->execute([
            'name' => $p['name'],
            'nameEn' => $p['nameEn'] ?? null,
            'status' => $p['status'] ?? 'active',
            'id' => $p['id']
        ]);
        $updatedCount++;
    }

    echo "Done! Updated {$updatedCount} products.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
