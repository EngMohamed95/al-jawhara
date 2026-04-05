<?php
// PHP Proxy → forwards /api/* to Node.js on localhost:3001
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$path    = isset($_GET['path']) ? $_GET['path'] : '';
$query   = $_SERVER['QUERY_STRING'];
$query   = preg_replace('/path=[^&]*&?/', '', $query);
$url     = 'http://localhost:3001/' . ltrim($path, '/');
if ($query) $url .= '?' . $query;

$method  = $_SERVER['REQUEST_METHOD'];
$body    = file_get_contents('php://input');
$headers = ['Content-Type: application/json'];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST,  $method);
curl_setopt($ch, CURLOPT_HTTPHEADER,     $headers);
if ($body) curl_setopt($ch, CURLOPT_POSTFIELDS, $body);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($httpCode);
header('Content-Type: application/json; charset=utf-8');
echo $response;
