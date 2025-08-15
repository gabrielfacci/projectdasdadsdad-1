<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'db_config.php';
include 'get_sales.php';

$sales_data = get_sales('2024-02-01', '2024-12-31');

// Log the sales data for debugging
file_put_contents('/home/api.ghostwallet.cloud/public_html/logs/update_licenses.log', print_r($sales_data, true), FILE_APPEND);

if (isset($sales_data['sales']['data']) && is_array($sales_data['sales']['data'])) {
    foreach ($sales_data['sales']['data'] as $sale) {
        $customer_email = $sale['customer'][0]['email'] ?? '';
        $product_code = $sale['product_code'] ?? '';
        $sale_status = $sale['sale_status'] ?? '';

        // Verificar se os campos necessários esto presentes
        if ($customer_email && $product_code && $sale_status) {
            // Buscar usuário pelo email
            $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->bind_param("s", $customer_email);
            $stmt->execute();
            $stmt->bind_result($user_id);
            $stmt->fetch();
            $stmt->close();

            // Buscar produto pelo código
            $stmt = $conn->prepare("SELECT id FROM products WHERE product_code = ?");
            $stmt->bind_param("s", $product_code);
            $stmt->execute();
            $stmt->bind_result($product_id);
            $stmt->fetch();
            $stmt->close();

            if ($user_id && $product_id) {
                if ($sale_status == 'approved') {
                    $stmt = $conn->prepare("
                        INSERT INTO licenses (user_id, product_id, license_status)
                        VALUES (?, ?, 'active')
                        ON DUPLICATE KEY UPDATE license_status='active'
                    ");
                } elseif ($sale_status == 'refunded') {
                    $stmt = $conn->prepare("
                        INSERT INTO licenses (user_id, product_id, license_status)
                        VALUES (?, ?, 'inactive')
                        ON DUPLICATE KEY UPDATE license_status='inactive'
                    ");
                }
                $stmt->bind_param("ii", $user_id, $product_id);
                $stmt->execute();
                $stmt->close();
            }
        } else {
            file_put_contents('/home/api.ghostwallet.cloud/public_html/logs/update_licenses.log', "Missing data in sale record: " . print_r($sale, true) . "\n", FILE_APPEND);
        }
    }
} else {
    // Log the issue for debugging
    file_put_contents('/home/api.ghostwallet.cloud/public_html/logs/update_licenses.log', "Sales data is not in the expected format or is empty.\n", FILE_APPEND);
}
?>
