<?php
include "db.php";

header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        $ticket_id = $data["ticket_id"] ?? null;
        $payment_method = trim($data["payment_method"] ?? "");
        $payment_status = "completed"; // Default status on successful payment

        // Validate required fields
        if (!$ticket_id || !$payment_method) {
            http_response_code(400);
            echo json_encode(["error" => "Missing ticket ID or payment method"]);
            exit;
        }

        // Validate payment method
        if (!in_array($payment_method, ['card', 'upi', 'netbanking'])) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid payment method"]);
            exit;
        }

        // Check if ticket exists and payment is pending
        $ticket_check_sql = "SELECT id, payment_status FROM tickets WHERE id = ? AND payment_status = 'pending'";
        $ticket_check_stmt = $conn->prepare($ticket_check_sql);
        $ticket_check_stmt->bind_param("i", $ticket_id);
        $ticket_check_stmt->execute();
        $ticket_result = $ticket_check_stmt->get_result();

        if ($ticket_result->num_rows === 0) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid ticket ID or payment already processed"]);
            exit;
        }
        $ticket_check_stmt->close();

        // Update payment status
        $sql = "UPDATE tickets SET payment_status = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("si", $payment_status, $ticket_id);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["message" => "Payment processed successfully", "ticket_id" => $ticket_id]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Payment processing failed: " . $conn->error]);
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