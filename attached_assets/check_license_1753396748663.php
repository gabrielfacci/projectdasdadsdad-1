<?php
include 'db_config.php';

function check_license($email, $product_code) {
    global $conn;
    $stmt = $conn->prepare("
        SELECT l.license_status
        FROM licenses l
        JOIN products p ON l.product_id = p.id
        JOIN users u ON l.user_id = u.id
        WHERE u.email = ? AND p.product_code = ?
    ");
    $stmt->bind_param("ss", $email, $product_code);
    $stmt->execute();
    $stmt->bind_result($license_status);
    $stmt->fetch();
    $stmt->close();

    return $license_status ? $license_status : 'inactive';
}
?>
