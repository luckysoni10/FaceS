<?php
include "db.php";

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    $sql = "SELECT v.id, tt.name AS tt_name, p.name AS passenger_name, v.station_code, 
            v.verification_status, v.verification_time, v.remarks 
            FROM ticket_verifications v
            JOIN users tt ON v.tt_id = tt.id
            JOIN users p ON v.passenger_id = p.id";
    
    $result = $conn->query($sql);
    $verifications = [];

    while ($row = $result->fetch_assoc()) {
        $verifications[] = $row;
    }

    echo json_encode($verifications);
    $conn->close();
}
?>
