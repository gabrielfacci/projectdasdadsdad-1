<?php
include 'db_config.php';

function authenticate_user($email, $password) {
    global $conn;
    $stmt = $conn->prepare("SELECT id, password FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->bind_result($id, $hashed_pw);
    $stmt->fetch();
    $stmt->close();

    if (password_verify($password, $hashed_pw)) {
        return $id;
    } else {
        return null;
    }
}
?>
