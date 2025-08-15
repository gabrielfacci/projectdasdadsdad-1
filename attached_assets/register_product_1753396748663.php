<?php
include 'db_config.php';

function register_product($product_code, $product_name) {
    global $conn;
    $stmt = $conn->prepare("INSERT INTO products (product_code, product_name) VALUES (?, ?)");
    $stmt->bind_param("ss", $product_code, $product_name);
    $stmt->execute();
    $stmt->close();
}
?>
