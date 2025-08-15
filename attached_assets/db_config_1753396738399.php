<?php
$servername = "localhost";
$username = "api_base";
$password = "P@sWord_02";
$dbname = "api_base";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
