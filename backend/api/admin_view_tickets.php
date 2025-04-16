<?php
include "db.php";

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    $sql = "SELECT t.id, u.name AS booked_by, t.train_number, t.source_station, 
            t.destination_station, t.journey_date, t.total_amount, t.payment_status, t.status 
            FROM tickets t 
            JOIN users u ON t.booked_by = u.id";
    
    $result = $conn->query($sql);
    $tickets = [];

    while ($row = $result->fetch_assoc()) {
        $tickets[] = $row;
    }

    echo json_encode($tickets);
    $conn->close();
}
?>
