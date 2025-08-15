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

// Função para obter o nome completo pelo email
function getUserName($conn, $email) {
    $stmt = $conn->prepare("SELECT full_name FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->bind_result($full_name);
    $stmt->fetch();
    $stmt->close();
    return $full_name;
}

// Verificar se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];
    if (empty($email)) {
        echo 'Email no fornecido.';
        exit;
    }

    $full_name = getUserName($conn, $email);
    if ($full_name) {
        echo $full_name;
    } else {
        echo 'Usuário não encontrado.';
    }
} else {
    echo 'Método de requisição inválido.';
}

$conn->close();
?>
