<?php
include 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];
    $full_name = $_POST['full_name'];
    $identification_type = $_POST['identification_type'];
    $identification_number = $_POST['identification_number'];
    $status = $_POST['status'];
    $product_codes = $_POST['product_codes'];

    // Verificar se o usuário existe
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    if ($stmt) {
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $stmt->bind_result($user_id);
            $stmt->fetch();
            $stmt->close();
        } else {
            $stmt->close();
            // Se o usuário não existe, inseri-lo
            $stmt = $conn->prepare("INSERT INTO users (email, full_name, identification_type, identification_number) VALUES (?, ?, ?, ?)");
            if ($stmt) {
                $stmt->bind_param("ssss", $email, $full_name, $identification_type, $identification_number);
                $stmt->execute();
                $user_id = $stmt->insert_id;
                $stmt->close();
            }
        }
    }

    // Adicionar licenças para cada produto selecionado
    foreach ($product_codes as $product_code) {
        // Verificar se o produto existe
        $stmt = $conn->prepare("SELECT id FROM products WHERE product_code = ?");
        if ($stmt) {
            $stmt->bind_param("s", $product_code);
            $stmt->execute();
            $stmt->store_result();

            if ($stmt->num_rows > 0) {
                $stmt->bind_result($product_id);
                $stmt->fetch();
                $stmt->close();
            } else {
                $stmt->close();
                // Se o produto não existe, inseri-lo
                $stmt = $conn->prepare("INSERT INTO products (product_code, product_name) VALUES (?, ?)");
                if ($stmt) {
                    $stmt->bind_param("ss", $product_code, $product_code); // Usando product_code como nome temporário
                    $stmt->execute();
                    $product_id = $stmt->insert_id;
                    $stmt->close();
                }
            }
        }

        // Adicionar ou atualizar licença
        $stmt = $conn->prepare("INSERT INTO licenses (user_id, product_id, license_status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE license_status=?");
        if ($stmt) {
            $stmt->bind_param("iiss", $user_id, $product_id, $status, $status);
            $stmt->execute();
            $stmt->close();
        }
    }

    echo "Usuário adicionado com sucesso.";
} else {
    echo "Método de requisição inválido.";
}
?>
