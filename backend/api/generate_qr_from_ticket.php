<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

if (!isset($_GET['ticket_id'])) {
    echo json_encode(['error' => 'Ticket ID is required']);
    exit;
}

$ticket_id = $_GET['ticket_id'];

$conn = new mysqli('localhost', 'root', '', 'faces');
if ($conn->connect_error) {
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Fetch face data from ticket_passengers
$stmt = $conn->prepare("SELECT face_data FROM ticket_passengers WHERE ticket_id = ? LIMIT 1");
$stmt->bind_param('i', $ticket_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    $face_data = $row['face_data'];

    // Include QR Code library (e.g., phpqrcode)
    require_once 'phpqrcode/qrlib.php';

    // Generate QR code using face data
    $qrCodeFile = tempnam(sys_get_temp_dir(), 'qr_') . '.png';
    QRcode::png($face_data, $qrCodeFile, QR_ECLEVEL_L, 5);

    // Convert QR code to base64
    $qrCodeData = base64_encode(file_get_contents($qrCodeFile));
    unlink($qrCodeFile); // Clean up

    echo json_encode(['qr_code' => $qrCodeData]);
} else {
    echo json_encode(['error' => 'No face data found for this ticket']);
}

$stmt->close();
$conn->close();
?>