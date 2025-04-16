<?php
include "db.php";

// JSON Data Fetch करो
$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $admin_id = $data["admin_id"] ?? null;
    $name = $data["name"] ?? null;
    $email = $data["email"] ?? null;
    $password = isset($data["password"]) ? password_hash($data["password"], PASSWORD_BCRYPT) : null;

    if (!$admin_id || !$name || !$email || !$password) {
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }

    // TT को Users Table में Add करो
    $sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'tt')";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $name, $email, $password);

    if ($stmt->execute()) {
        echo json_encode(["message" => "TT added successfully"]);
    } else {
        echo json_encode(["error" => "Failed to add TT"]);
    }

    $stmt->close();
    $conn->close();
}
?>
