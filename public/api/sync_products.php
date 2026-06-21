<?php
/**
 * Script to sync products in MySQL database from data.json
 * Updates existing products and inserts missing ones.
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

    echo "Syncing products database table with data.json...\n";

    $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM products WHERE id = :id");
    $stmtInsert = $pdo->prepare("INSERT INTO products (id, icon, image, name, nameEn, category, price, `desc`, descEn, badge, specs, stock, status) VALUES (:id, :icon, :image, :name, :nameEn, :category, :price, :desc, :descEn, :badge, :specs, :stock, :status)");
    $stmtUpdate = $pdo->prepare("UPDATE products SET icon = :icon, image = :image, name = :name, nameEn = :nameEn, category = :category, price = :price, `desc` = :desc, descEn = :descEn, badge = :badge, specs = :specs, stock = :stock, status = :status WHERE id = :id");

    $insertedCount = 0;
    $updatedCount = 0;

    foreach ($data['products'] as $p) {
        $specsJson = isset($p['specs']) ? json_encode($p['specs'], JSON_UNESCAPED_UNICODE) : null;
        $params = [
            'id' => $p['id'],
            'icon' => $p['icon'] ?? null,
            'image' => $p['image'] ?? null,
            'name' => $p['name'],
            'nameEn' => $p['nameEn'] ?? null,
            'category' => $p['category'] ?? null,
            'price' => $p['price'] ?? 0.000,
            'desc' => $p['desc'] ?? null,
            'descEn' => $p['descEn'] ?? null,
            'badge' => $p['badge'] ?? null,
            'specs' => $specsJson,
            'stock' => $p['stock'] ?? 0,
            'status' => $p['status'] ?? 'active'
        ];

        $stmtCheck->execute(['id' => $p['id']]);
        if ($stmtCheck->fetchColumn() > 0) {
            $stmtUpdate->execute($params);
            $updatedCount++;
        } else {
            $stmtInsert->execute($params);
            $insertedCount++;
        }
    }

    echo "Sync complete! Inserted: {$insertedCount}, Updated: {$updatedCount} products.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
