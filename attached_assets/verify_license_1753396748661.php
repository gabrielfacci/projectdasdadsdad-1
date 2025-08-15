<?php
include 'check_license.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'];
    $product_code = $data['product_code'];

    $license_status = check_license($email, $product_code);
    echo json_encode(['license_status' => $license_status]);
}
?>
