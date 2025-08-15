<?php
// Configurações do banco de dados
$servername = "localhost";
$username = "api_base";
$password = "P@sWord_02";
$dbname = "api_base";

// Conectar ao banco de dados
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexão
if ($conn->connect_error) {
    die("Conexão falhou: " . $conn->connect_error);
}

// Associar nomes de produtos aos códigos de produtos
$product_codes = [
    "Acelerador TURBO 10X" => "PPPBAHKJ",
    "Ghost Wallet - Diamond" => "PPPBC295",
    "Ghost Wallet - Black" => "PPPBC293",
    "Rug Tool Sniper" => "PPPBC07O",
    "Pump Coin Sniper" => "PPPBC07N",
    "Ghost Wallet" => "PPPBC229"
];

// Função para obter o ID do produto pelo código do produto
function getProductID($conn, $product_code) {
    $stmt = $conn->prepare("SELECT id FROM products WHERE product_code = ?");
    $stmt->bind_param("s", $product_code);
    $stmt->execute();
    $stmt->bind_result($product_id);
    $stmt->fetch();
    $stmt->close();
    return $product_id;
}

// Funço para obter o ID do usuário pelo email
function getUserID($conn, $email) {
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->bind_result($user_id);
    $stmt->fetch();
    $stmt->close();
    return $user_id;
}

// Processar os dados enviados pelo formulário
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $dados_excel = $_POST['dados_excel'];
    $linhas = explode("\n", $dados_excel);

    foreach ($linhas as $linha) {
        $colunas = explode("\t", $linha);
        if (count($colunas) < 3) continue; // Pular linhas inválidas

        $email = trim($colunas[0]);
        $full_name = trim($colunas[1]);
        $product_name = trim($colunas[2]);
        $product_code = $product_codes[$product_name] ?? null;

        if (!$product_code) continue; // Pular produtos inválidos

        // Verificar se o usuário já existe
        $user_id = getUserID($conn, $email);
        if (!$user_id) {
            // Inserir novo usurio
            $stmt = $conn->prepare("INSERT INTO users (email, full_name, identification_type, identification_number, created_at) VALUES (?, ?, ?, ?, NOW())");
            $stmt->bind_param("ssss", $email, $full_name, 'email', $email);
            $stmt->execute();
            $user_id = $stmt->insert_id;
            $stmt->close();
        }

        // Obter o ID do produto
        $product_id = getProductID($conn, $product_code);

        // Verificar se a licença já existe para este usuário e produto
        $stmt = $conn->prepare("SELECT id FROM licenses WHERE user_id = ? AND product_id = ?");
        $stmt->bind_param("ii", $user_id, $product_id);
        $stmt->execute();
        $stmt->bind_result($license_id);
        $stmt->fetch();
        $stmt->close();

        if (!$license_id) {
            // Inserir nova licença
            $stmt = $conn->prepare("INSERT INTO licenses (user_id, product_id, license_status, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())");
            $stmt->bind_param("iis", $user_id, $product_id, $license_status);
            $license_status = 'active';
            $stmt->execute();
            $stmt->close();
        }
    }

    echo "Importação concluída com sucesso.";
}

$conn->close();
?>
