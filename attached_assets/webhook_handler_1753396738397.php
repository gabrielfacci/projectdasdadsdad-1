<?php
include 'db_config.php';

// 🔧 Ativar logs apenas para depuração (não em produção)
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('display_errors', 0); // 🔴 Melhor manter OFF em produção

// Receber a carga útil do webhook
$payload = file_get_contents('php://input');

// Verificar se a carga útil foi recebida
if ($payload) {
    // 📌 Log da carga recebida para depuração
    file_put_contents('/home/api.ghostwallet.cloud/public_html/logs/webhook_payload.log', $payload . "\n", FILE_APPEND);

    // Decodificar a carga útil
    $data = json_decode($payload, true);

    // 🔒 Verificar o token do webhook
    $public_token = '9525657e9edecb8be7b7398392a095be';
    if (!isset($data['token']) || $data['token'] !== $public_token) {
        file_put_contents('/home/api.ghostwallet.cloud/public_html/logs/webhook_errors.log', "⚠️ Token inválido: " . print_r($data, true) . "\n", FILE_APPEND);
        http_response_code(403);
        exit;
    }

    // 📌 Verificar se os dados necessários estão presentes
    if (isset($data['code'], $data['sale_status_enum'], $data['customer']['email'], $data['product']['code'])) {
        $transaction_token = $data['code'];
        $sale_status_enum = $data['sale_status_enum'];
        $customer_email = $data['customer']['email'];
        $product_code = $data['product']['code'];

        // 🔍 Buscar usuário pelo email
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param("s", $customer_email);
        $stmt->execute();
        $stmt->bind_result($user_id);
        $stmt->fetch();
        $stmt->close();

        // 🆕 Se o usuário não existe, inserir na tabela `users`
        if (empty($user_id)) {
            $stmt = $conn->prepare("INSERT INTO users (email, full_name, identification_type, identification_number) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssss", $customer_email, $data['customer']['full_name'], $data['customer']['identification_type'], $data['customer']['identification_number']);
            $stmt->execute();
            $user_id = $stmt->insert_id;
            $stmt->close();
        }

        // 🔍 Buscar produto pelo código
        $stmt = $conn->prepare("SELECT id FROM products WHERE product_code = ?");
        $stmt->bind_param("s", $product_code);
        $stmt->execute();
        $stmt->bind_result($product_id);
        $stmt->fetch();
        $stmt->close();

        // 🆕 Se o produto não existe, inserir na tabela `products`
        if (empty($product_id)) {
            $stmt = $conn->prepare("INSERT INTO products (product_code, product_name) VALUES (?, ?)");
            $stmt->bind_param("ss", $product_code, $data['product']['name']);
            $stmt->execute();
            $product_id = $stmt->insert_id;
            $stmt->close();
        }

        // 🔄 Atualizar ou inserir a licença
        if (!empty($user_id) && !empty($product_id)) {
            if ($sale_status_enum == 2) { // 🟢 Aprovado
                $license_status = 'active';
            } elseif ($sale_status_enum == 7) { // 🔴 Devolvido
                $license_status = 'inactive';
            } else {
                file_put_contents('/home/api.ghostwallet.cloud/public_html/logs/webhook_errors.log', "⚠️ Status de venda desconhecido: $sale_status_enum\n", FILE_APPEND);
                exit;
            }

            // 📌 Inserir ou atualizar na tabela `licenses`
            $stmt = $conn->prepare("
                INSERT INTO licenses (user_id, product_id, license_status)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE license_status = VALUES(license_status)
            ");
            $stmt->bind_param("iis", $user_id, $product_id, $license_status);
            $stmt->execute();
            $stmt->close();
        } else {
            file_put_contents('/home/api.ghostwallet.cloud/public_html/logs/webhook_errors.log', "⚠️ Usuário ou Produto não encontrados para email: $customer_email, código: $product_code\n", FILE_APPEND);
        }
    } else {
        file_put_contents('/home/api.ghostwallet.cloud/public_html/logs/webhook_errors.log', "⚠️ Payload inválido: " . print_r($data, true) . "\n", FILE_APPEND);
    }
} else {
    file_put_contents('/home/api.ghostwallet.cloud/public_html/logs/webhook_errors.log', "⚠️ Nenhum payload recebido\n", FILE_APPEND);
}

?>
