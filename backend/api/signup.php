<?php
include "db.php";

header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = trim($data["name"] ?? "");
    $email = trim($data["email"] ?? "");
    $password = isset($data["password"]) ? password_hash($data["password"], PASSWORD_BCRYPT) : null;
    $face_data = $data["face_data"] ?? null;

    if (empty($name) || empty($email) || empty($password) || empty($face_data)) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }

    $check_sql = "SELECT id FROM users WHERE email = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("s", $email);
    $check_stmt->execute();
    if ($check_stmt->get_result()->num_rows > 0) {
        http_response_code(409);
        echo json_encode(["error" => "Email already registered"]);
        exit;
    }
    $check_stmt->close();

    $sql = "INSERT INTO users (name, email, password, face_data) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $name, $email, $password, $face_data);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["message" => "User registered successfully", "user_id" => $stmt->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Signup failed: " . $conn->error]);
    }

    $stmt->close();
    $conn->close();
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>