<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Include database connection
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['user_id']) || !isset($data['name']) || !isset($data['email'])) {
    echo json_encode(['error' => 'User ID, Name, and Email are required']);
    exit;
}

$user_id = $data['user_id'];
$name = $data['name'];
$email = $data['email'];
$phone = $data['phone'] ?? null;
$gender = $data['gender'] ?? null;
$dob = $data['dob'] ?? null;

try {
    $stmt = $conn->prepare("UPDATE users SET name = :name, email = :email, phone = :phone, gender = :gender, dob = :dob WHERE user_id = :user_id");
    $stmt->execute([
        'user_id' => $user_id,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'gender' => $gender,
        'dob' => $dob
    ]);

    echo json_encode(['message' => 'Profile updated successfully']);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>