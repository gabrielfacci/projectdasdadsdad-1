<?php
$servername = "localhost";
$username = "api_base";
$password = "P@sWord_02";
$dbname = "api_base";

// Crie a conexão
$conn = new mysqli($servername, $username, $password, $dbname);

// Verifique a conexão
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = $_POST['data'];
    $rows = explode("\n", $data);

    foreach ($rows as $row) {
        $columns = explode("\t", $row);

        if (count($columns) === 7) { // Verifica se todas as colunas necessárias estão presentes
            $status = trim($columns[0]);
            $product_code = trim($columns[1]);
            $product_name = trim($columns[2]);
            $full_name = trim($columns[3]);
            $email = trim($columns[4]);
            $identification_type = trim($columns[5]);
            $identification_number = trim($columns[6]);

            if (strtolower($status) === 'aprovado') {
                // Verifica se o usuário já existe
                $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
                $stmt->bind_param("s", $email);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    $row = $result->fetch_assoc();
                    $user_id = $row['id'];
                } else {
                    // Insere o usuário se ele não existir
                    $stmt = $conn->prepare("INSERT INTO users (email, full_name, identification_type, identification_number, created_at) VALUES (?, ?, ?, ?, NOW())");
                    $stmt->bind_param("ssss", $email, $full_name, $identification_type, $identification_number);
                    $stmt->execute();
                    $user_id = $stmt->insert_id;
                }

                // Verifica se o produto já existe
                $stmt = $conn->prepare("SELECT id FROM products WHERE product_code = ?");
                $stmt->bind_param("s", $product_code);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    $row = $result->fetch_assoc();
                    $product_id = $row['id'];
                } else {
                    // Insere o produto se ele não existir
                    $stmt = $conn->prepare("INSERT INTO products (product_code, product_name, created_at) VALUES (?, ?, NOW())");
                    $stmt->bind_param("ss", $product_code, $product_name);
                    $stmt->execute();
                    $product_id = $stmt->insert_id;
                }

                // Verifica se a licença já existe
                $stmt = $conn->prepare("SELECT id FROM licenses WHERE user_id = ? AND product_id = ?");
                $stmt->bind_param("ii", $user_id, $product_id);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows === 0) {
                    // Insere a licença se não existir
                    $stmt = $conn->prepare("INSERT INTO licenses (user_id, product_id, license_status, created_at, updated_at) VALUES (?, ?, 'active', NOW(), NOW())");
                    $stmt->bind_param("ii", $user_id, $product_id);
                    $stmt->execute();
                }
            }
        }
    }

    echo "Usuários importados com sucesso!";
} else {
    echo "Método de requisição inválido.";
}

$conn->close();
?>
