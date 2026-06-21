<?php
/**
 * Database Migration Script
 * Automatically creates tables and migrates data from data.json
 */
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // 1. Create Tables
    
    // Categories Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        nameAr VARCHAR(255) NOT NULL,
        nameEn VARCHAR(255) NOT NULL,
        emoji VARCHAR(50),
        icon VARCHAR(100),
        sortOrder INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        `desc` TEXT,
        parentId INT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Products Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        icon VARCHAR(50),
        image TEXT,
        name VARCHAR(255) NOT NULL,
        nameEn VARCHAR(255),
        category VARCHAR(255),
        price DECIMAL(10,3) DEFAULT 0.000,
        `desc` TEXT,
        descEn TEXT,
        badge VARCHAR(100),
        specs TEXT, -- Stored as JSON string
        stock INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Orders Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ref VARCHAR(100),
        client VARCHAR(255),
        product VARCHAR(255),
        qty INT DEFAULT 0,
        total DECIMAL(10,3) DEFAULT 0.000,
        date VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Users Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id BIGINT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(100) DEFAULT 'customer',
        status VARCHAR(50) DEFAULT 'active',
        phone VARCHAR(100),
        email VARCHAR(255),
        governorate VARCHAR(100),
        createdAt VARCHAR(100)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Coupons Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(100) UNIQUE NOT NULL,
        type VARCHAR(50) NOT NULL,
        value DECIMAL(10,2) NOT NULL,
        minOrder DECIMAL(10,2) DEFAULT 0.00,
        maxUses INT DEFAULT 0,
        usedCount INT DEFAULT 0,
        expiry VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        `desc` TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Site Content Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS site_content (
        id INT PRIMARY KEY DEFAULT 1,
        heroBadge VARCHAR(255),
        heroTitle VARCHAR(255),
        heroSubtitle TEXT,
        ceoName VARCHAR(255),
        ceoTitle VARCHAR(255),
        ceoQuote TEXT,
        aboutStory TEXT,
        aboutHeaderImg TEXT,
        productsHeaderImg TEXT,
        clientsHeaderImg TEXT,
        contactHeaderImg TEXT,
        companyPhone VARCHAR(100),
        companyWhatsapp VARCHAR(100),
        companyEmail VARCHAR(255),
        companyAddress TEXT,
        workHours VARCHAR(255),
        founded VARCHAR(100),
        factoryArea VARCHAR(100),
        productionCapacity VARCHAR(100),
        statsYear VARCHAR(100),
        statsClients VARCHAR(100),
        paymentSettings TEXT, -- JSON string
        shippingZones TEXT, -- JSON string
        whatsappNumbers TEXT -- JSON string
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    echo "Tables checked/created successfully.\n";

    // 2. Import Data from data.json if empty
    $dataFile = __DIR__ . '/data.json';
    if (file_exists($dataFile)) {
        $data = json_decode(file_get_contents($dataFile), true);
        if ($data) {
            // Import Categories
            $stmt = $pdo->query("SELECT COUNT(*) FROM categories");
            if ($stmt->fetchColumn() == 0 && isset($data['categories'])) {
                $ins = $pdo->prepare("INSERT INTO categories (id, slug, nameAr, nameEn, emoji, icon, sortOrder, status, `desc`, parentId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                foreach ($data['categories'] as $c) {
                    $ins->execute([
                        $c['id'] ?? null,
                        $c['slug'] ?? '',
                        $c['nameAr'] ?? '',
                        $c['nameEn'] ?? '',
                        $c['emoji'] ?? null,
                        $c['icon'] ?? null,
                        $c['sortOrder'] ?? 0,
                        $c['status'] ?? 'active',
                        $c['desc'] ?? '',
                        $c['parentId'] ?? null
                    ]);
                }
                echo "Imported categories.\n";
            }

            // Import Products
            $stmt = $pdo->query("SELECT COUNT(*) FROM products");
            if ($stmt->fetchColumn() == 0 && isset($data['products'])) {
                $ins = $pdo->prepare("INSERT INTO products (id, icon, image, name, nameEn, category, price, `desc`, descEn, badge, specs, stock, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                foreach ($data['products'] as $p) {
                    $ins->execute([
                        $p['id'] ?? null,
                        $p['icon'] ?? null,
                        $p['image'] ?? null,
                        $p['name'] ?? '',
                        $p['nameEn'] ?? null,
                        $p['category'] ?? null,
                        $p['price'] ?? 0.000,
                        $p['desc'] ?? null,
                        $p['descEn'] ?? null,
                        $p['badge'] ?? null,
                        isset($p['specs']) ? json_encode($p['specs'], JSON_UNESCAPED_UNICODE) : null,
                        $p['stock'] ?? 0,
                        $p['status'] ?? 'active'
                    ]);
                }
                echo "Imported products.\n";
            }

            // Import Orders
            $stmt = $pdo->query("SELECT COUNT(*) FROM orders");
            if ($stmt->fetchColumn() == 0 && isset($data['orders'])) {
                $ins = $pdo->prepare("INSERT INTO orders (id, ref, client, product, qty, total, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                foreach ($data['orders'] as $o) {
                    $ins->execute([
                        $o['id'] ?? null,
                        $o['ref'] ?? null,
                        $o['client'] ?? null,
                        $o['product'] ?? null,
                        $o['qty'] ?? 0,
                        $o['total'] ?? 0.000,
                        $o['date'] ?? null,
                        $o['status'] ?? 'pending'
                    ]);
                }
                echo "Imported orders.\n";
            }

            // Import Users
            $stmt = $pdo->query("SELECT COUNT(*) FROM users");
            if ($stmt->fetchColumn() == 0 && isset($data['users'])) {
                $ins = $pdo->prepare("INSERT INTO users (id, username, password, name, role, status, phone, email, governorate, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                foreach ($data['users'] as $u) {
                    $ins->execute([
                        $u['id'],
                        $u['username'],
                        $u['password'],
                        $u['name'] ?? null,
                        $u['role'] ?? 'customer',
                        $u['status'] ?? 'active',
                        $u['phone'] ?? null,
                        $u['email'] ?? null,
                        $u['governorate'] ?? null,
                        $u['createdAt'] ?? null
                    ]);
                }
                echo "Imported users.\n";
            }

            // Import Coupons
            $stmt = $pdo->query("SELECT COUNT(*) FROM coupons");
            if ($stmt->fetchColumn() == 0 && isset($data['coupons'])) {
                $ins = $pdo->prepare("INSERT INTO coupons (id, code, type, value, minOrder, maxUses, usedCount, expiry, status, `desc`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                foreach ($data['coupons'] as $cp) {
                    $ins->execute([
                        $cp['id'] ?? null,
                        $cp['code'],
                        $cp['type'],
                        $cp['value'],
                        $cp['minOrder'] ?? 0.00,
                        $cp['maxUses'] ?? 0,
                        $cp['usedCount'] ?? 0,
                        $cp['expiry'] ?? null,
                        $cp['status'] ?? 'active',
                        $cp['desc'] ?? null
                    ]);
                }
                echo "Imported coupons.\n";
            }

            // Import Site Content
            $stmt = $pdo->query("SELECT COUNT(*) FROM site_content");
            if ($stmt->fetchColumn() == 0 && isset($data['siteContent'][0])) {
                $sc = $data['siteContent'][0];
                $ins = $pdo->prepare("INSERT INTO site_content (id, heroBadge, heroTitle, heroSubtitle, ceoName, ceoTitle, ceoQuote, aboutStory, aboutHeaderImg, productsHeaderImg, clientsHeaderImg, contactHeaderImg, companyPhone, companyWhatsapp, companyEmail, companyAddress, workHours, founded, factoryArea, productionCapacity, statsYear, statsClients, paymentSettings, shippingZones, whatsappNumbers) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $ins->execute([
                    $sc['heroBadge'] ?? null,
                    $sc['heroTitle'] ?? null,
                    $sc['heroSubtitle'] ?? null,
                    $sc['ceoName'] ?? null,
                    $sc['ceoTitle'] ?? null,
                    $sc['ceoQuote'] ?? null,
                    $sc['aboutStory'] ?? null,
                    $sc['aboutHeaderImg'] ?? null,
                    $sc['productsHeaderImg'] ?? null,
                    $sc['clientsHeaderImg'] ?? null,
                    $sc['contactHeaderImg'] ?? null,
                    $sc['companyPhone'] ?? null,
                    $sc['companyWhatsapp'] ?? null,
                    $sc['companyEmail'] ?? null,
                    $sc['companyAddress'] ?? null,
                    $sc['workHours'] ?? null,
                    $sc['founded'] ?? null,
                    $sc['factoryArea'] ?? null,
                    $sc['productionCapacity'] ?? null,
                    $sc['statsYear'] ?? null,
                    $sc['statsClients'] ?? null,
                    isset($sc['paymentSettings']) ? json_encode($sc['paymentSettings'], JSON_UNESCAPED_UNICODE) : null,
                    isset($sc['shippingZones']) ? json_encode($sc['shippingZones'], JSON_UNESCAPED_UNICODE) : null,
                    isset($sc['whatsappNumbers']) ? json_encode($sc['whatsappNumbers'], JSON_UNESCAPED_UNICODE) : null
                ]);
                echo "Imported site content.\n";
            }
        }
    }
    
    echo json_encode(["status" => "success", "message" => "Migration completed successfully."]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
