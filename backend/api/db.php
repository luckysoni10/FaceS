<?php
$host = "localhost";
$username = "root";
$password = "";
$database = "faces";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(["error" => "Database Connection Failed: " . $conn->connect_error]));
}

$conn->set_charset("utf8mb4");
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
?>