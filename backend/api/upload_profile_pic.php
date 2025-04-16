<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Include database connection
require_once 'db.php';

if (!isset($_FILES['profile_pic']) || !isset($_POST['user_id'])) {
    echo json_encode(['error' => 'Profile picture and User ID are required']);
    exit;
}

$user_id = $_POST['user_id'];
$file = $_FILES['profile_pic'];

if ($file['error'] === UPLOAD_ERR_OK) {
    $fileName = uniqid() . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
    $uploadDir = '../../assets/uploads/'; // Create this directory
    $uploadPath = $uploadDir . $fileName;

    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        $stmt = $conn->prepare("UPDATE users SET profile_pic = :profile_pic WHERE user_id = :user_id");
        $stmt->execute([
            'user_id' => $user_id,
            'profile_pic' => $uploadPath
        ]);

        echo json_encode(['message' => 'Profile picture uploaded successfully', 'profile_pic' => $uploadPath]);
    } else {
        echo json_encode(['error' => 'Failed to move uploaded file']);
    }
} else {
    echo json_encode(['error' => 'File upload error']);
}
?>