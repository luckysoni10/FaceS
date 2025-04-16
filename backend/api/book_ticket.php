<?php
include "db.php";

header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        $booked_by = $data["booked_by"] ?? null;
        $train_number = trim($data["train_number"] ?? "");
        $source_station = trim($data["source_station"] ?? "");
        $destination_station = trim($data["destination_station"] ?? "");
        $journey_date = $data["journey_date"] ?? null;
        $total_amount = $data["total_amount"] ?? null;
        $payment_status = $data["payment_status"] ?? "pending";

        // Validate required fields
        if (!$booked_by || !$train_number || !$source_station || !$destination_station || !$journey_date || !$total_amount) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields"]);
            exit;
        }

        // Validate booked_by (check if user exists)
        $user_check_sql = "SELECT id FROM users WHERE id = ? AND status = 'active'";
        $user_check_stmt = $conn->prepare($user_check_sql);
        $user_check_stmt->bind_param("i", $booked_by);
        $user_check_stmt->execute();
        if ($user_check_stmt->get_result()->num_rows === 0) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid user ID"]);
            exit;
        }
        $user_check_stmt->close();

        // Validate journey_date (should not be in the past)
        $current_date = date("Y-m-d");
        if ($journey_date < $current_date) {
            http_response_code(400);
            echo json_encode(["error" => "Journey date cannot be in the past"]);
            exit;
        }

        // Validate total_amount (should be positive)
        if (!is_numeric($total_amount) || $total_amount <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "Total amount must be a positive number"]);
            exit;
        }

        // Validate payment_status
        if (!in_array($payment_status, ['pending', 'completed', 'failed'])) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid payment status"]);
            exit;
        }

        $sql = "INSERT INTO tickets (booked_by, train_number, source_station, destination_station, journey_date, total_amount, payment_status) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("issssss", $booked_by, $train_number, $source_station, $destination_station, $journey_date, $total_amount, $payment_status);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Ticket booked successfully", "ticket_id" => $stmt->insert_id]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Booking failed: " . $conn->error]);
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