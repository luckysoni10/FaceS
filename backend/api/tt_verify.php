<?php
include "db.php";

// JSON Data को सही से fetch करो
$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $tt_id = $data["tt_id"] ?? null;
    $ticket_id = $data["ticket_id"] ?? null;
    $passenger_id = $data["passenger_id"] ?? null;
    $station_code = $data["station_code"] ?? null;
    $verification_status = $data["verification_status"] ?? "invalid";
    $remarks = $data["remarks"] ?? "";

    // Validate Required Fields
    if (!$tt_id || !$ticket_id || !$passenger_id || !$station_code) {
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }

    // Check if ticket & passenger exist
    $check_sql = "SELECT id FROM ticket_passengers WHERE ticket_id = ? AND passenger_id = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("ii", $ticket_id, $passenger_id);
    $check_stmt->execute();
    $check_stmt->store_result();

    if ($check_stmt->num_rows == 0) {
        echo json_encode(["error" => "Invalid ticket or passenger ID"]);
        exit;
    }
    $check_stmt->close();

    // Insert Verification Record
    $sql = "INSERT INTO ticket_verifications (tt_id, ticket_id, passenger_id, station_code, verification_status, remarks) 
            VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iiisss", $tt_id, $ticket_id, $passenger_id, $station_code, $verification_status, $remarks);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Ticket verified successfully"]);
    } else {
        echo json_encode(["error" => "Verification failed"]);
    }

    $stmt->close();
    $conn->close();
}
?>
