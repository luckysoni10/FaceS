<?php
include "db.php";

header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        $ticket_id = $data["ticket_id"] ?? null;
        $passenger_id = $data["passenger_id"] ?? null;
        $name = trim($data["name"] ?? "");
        $age = $data["age"] ?? null;
        $gender = trim($data["gender"] ?? "");
        $face_data = $data["face_data"] ?? null;

        // Validate required fields
        if (!$ticket_id || !$name || !$age || !$gender || !$face_data) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields"]);
            exit;
        }

        // Validate ticket_id (check if ticket exists)
        $ticket_check_sql = "SELECT id FROM tickets WHERE id = ? AND status = 'booked'";
        $ticket_check_stmt = $conn->prepare($ticket_check_sql);
        $ticket_check_stmt->bind_param("i", $ticket_id);
        $ticket_check_stmt->execute();
        if ($ticket_check_stmt->get_result()->num_rows === 0) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid ticket ID"]);
            exit;
        }
        $ticket_check_stmt->close();

        // Validate passenger_id (if provided)
        if ($passenger_id !== null) {
            $user_check_sql = "SELECT id FROM users WHERE id = ? AND status = 'active'";
            $user_check_stmt = $conn->prepare($user_check_sql);
            $user_check_stmt->bind_param("i", $passenger_id);
            $user_check_stmt->execute();
            if ($user_check_stmt->get_result()->num_rows === 0) {
                http_response_code(400);
                echo json_encode(["error" => "Invalid passenger ID"]);
                exit;
            }
            $user_check_stmt->close();
        }

        // Validate age (should be positive)
        if (!is_numeric($age) || $age <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "Age must be a positive number"]);
            exit;
        }

        // Validate gender
        if (!in_array($gender, ['male', 'female', 'other'])) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid gender"]);
            exit;
        }

        // Validate face_data (basic check for base64 string)
        if (!preg_match('/^data:image\/[a-z]+;base64,/', $face_data)) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid face data format"]);
            exit;
        }

        $sql = "INSERT INTO ticket_passengers (ticket_id, passenger_id, name, age, gender, face_data) 
                VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iisiss", $ticket_id, $passenger_id, $name, $age, $gender, $face_data);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Passenger added successfully", "passenger_id" => $stmt->insert_id]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to add passenger: " . $conn->error]);
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