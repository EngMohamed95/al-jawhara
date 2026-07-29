<?php
/**
 * Temporary script to clean up products on the live server
 */
require_once __DIR__ . '/db.php';

header('Content-Type: text/plain; charset=utf-8');

try {
    echo "Cleaning products from live database...\n";
    $allowedIds = [1, 8, 12, 13, 15, 17, 19, 21, 27, 28, 36, 39, 41];
    $inQuery = implode(',', array_map('intval', $allowedIds));
    
    // Delete products not in allowed list
    $stmt = $pdo->prepare("DELETE FROM products WHERE id NOT IN ($inQuery)");
    $stmt->execute();
    $deletedCount = $stmt->rowCount();
    
    echo "Done! Deleted {$deletedCount} products from live database.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
