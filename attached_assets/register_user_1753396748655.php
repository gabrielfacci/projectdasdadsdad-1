<?php
include 'db_config.php';

function register_user($name, $email, $password) {
    global $conn;
    $hashed_pw = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $name, $email, $hashed_pw);
    $stmt->execute();
    $stmt->close();
}
?>
