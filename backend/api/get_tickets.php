<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Allow CORS if needed

// Include database connection
require_once 'db.php';

try {
    // Get user_id and ticket_id from GET parameters
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    $ticket_id = isset($_GET['ticket_id']) ? $_GET['ticket_id'] : null;

    if (!$user_id && !$ticket_id) {
        echo json_encode(['error' => 'User ID or Ticket ID is required']);
        exit;
    }

    // Prepare the query based on parameters
    if ($ticket_id) {
        // Fetch specific ticket by ticket_id
        $query = "SELECT ticket_id, journey_date, source_station, destination_station, train_number, total_amount, payment_status 
                  FROM tickets 
                  WHERE ticket_id = :ticket_id AND status = 'booked'";
        $stmt = $conn->prepare($query);
        $stmt->execute(['ticket_id' => $ticket_id]);
        $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($tickets)) {
            echo json_encode(['error' => 'Ticket not found']);
            exit;
        }
    } else {
        // Fetch upcoming tickets by user_id
        $query = "SELECT ticket_id, journey_date, source_station, destination_station, train_number, total_amount, payment_status 
                  FROM tickets 
                  WHERE booked_by = :user_id AND journey_date >= CURDATE() AND status = 'booked'";
        $stmt = $conn->prepare($query);
        $stmt->execute(['user_id' => $user_id]);
        $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Return tickets as JSON
    echo json_encode($tickets);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>