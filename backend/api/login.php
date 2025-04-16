<?php
include "db.php";

header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        $email = trim($data["email"] ?? "");
        $password = trim($data["password"] ?? "");

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(["error" => "Missing email or password"]);
            exit;
        }

        $sql = "SELECT id, password, name FROM users WHERE email = ? AND status = 'active'";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            if (password_verify($password, $row["password"])) {
                // Update last_login
                $update_sql = "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?";
                $update_stmt = $conn->prepare($update_sql);
                $update_stmt->bind_param("i", $row["id"]);
                $update_stmt->execute();
                $update_stmt->close();

                http_response_code(200);
                echo json_encode([
                    "message" => "Login successful",
                    "user_id" => $row["id"],
                    "name" => $row["name"]
                ]);
            } else {
                http_response_code(401);
                echo json_encode(["error" => "Invalid credentials"]);
            }
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Invalid credentials"]);
        }

        $stmt->close();
        $conn->close();
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Server error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>