<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Include database connection
require_once 'db.php';

// Get JSON input
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['ticket_id'])) {
    echo json_encode(['error' => 'Ticket ID is required']);
    exit;
}

$ticket_id = $data['ticket_id'];

try {
    // Check if ticket exists and is not already cancelled
    $stmt = $conn->prepare("SELECT status FROM tickets WHERE ticket_id = :ticket_id");
    $stmt->execute(['ticket_id' => $ticket_id]);
    $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$ticket) {
        echo json_encode(['error' => 'Ticket not found']);
        exit;
    }

    if ($ticket['status'] === 'cancelled') {
        echo json_encode(['error' => 'Ticket is already cancelled']);
        exit;
    }

    // Update ticket status to 'cancelled'
    $stmt = $conn->prepare("UPDATE tickets SET status = 'cancelled' WHERE ticket_id = :ticket_id");
    $stmt->execute(['ticket_id' => $ticket_id]);

    echo json_encode(['message' => 'Ticket cancelled successfully']);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>