<?php
include "db.php";

// JSON Data Fetch करो
$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $admin_id = $data["admin_id"] ?? null;
    $user_id = $data["user_id"] ?? null;
    $status = $data["status"] ?? null; // active, inactive, blocked

    if (!$admin_id || !$user_id || !$status) {
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }

    // User का Status Update करो
    $sql = "UPDATE users SET status = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $status, $user_id);

    if ($stmt->execute()) {
        echo json_encode(["message" => "User status updated"]);
    } else {
        echo json_encode(["error" => "Failed to update user status"]);
    }

    $stmt->close();
    $conn->close();
}
?>
