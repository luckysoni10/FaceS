<?php
include "db.php";

header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        $face_image = $data["face_image"] ?? null;

        if (empty($face_image)) {
            http_response_code(400);
            echo json_encode(["error" => "Missing face image"]);
            exit;
        }

        // Save temporary captured image
        $temp_image = "temp_face_" . time() . ".png";
        if (!file_put_contents($temp_image, base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $face_image)))) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to save temporary face image"]);
            exit;
        }

        $sql = "SELECT id, name, face_data FROM users WHERE status = 'active' AND face_data IS NOT NULL";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->get_result();

        $matched = false;
        $user_data = null;

        while ($row = $result->fetch_assoc()) {
            $stored_image = "stored_face_" . $row["id"] . ".png";
            if (!file_put_contents($stored_image, base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $row["face_data"])))) {
                unlink($temp_image);
                http_response_code(500);
                echo json_encode(["error" => "Failed to save stored face image"]);
                exit;
            }

            $python_script = "python3 ../compare_faces.py '$temp_image' '$stored_image' 2>&1";
            $output = shell_exec($python_script);

            if ($output === null) {
                unlink($temp_image);
                unlink($stored_image);
                http_response_code(500);
                echo json_encode(["error" => "Face comparison script failed to execute"]);
                exit;
            }

            $output = trim($output);
            if ($output === "True") {
                $matched = true;
                $user_data = $row;
                unlink($stored_image);
                break;
            }
            unlink($stored_image);
        }

        unlink($temp_image);
        $stmt->close();

        if ($matched) {
            // Update last_login
            $update_sql = "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?";
            $update_stmt = $conn->prepare($update_sql);
            $update_stmt->bind_param("i", $user_data["id"]);
            $update_stmt->execute();
            $update_stmt->close();

            http_response_code(200);
            echo json_encode([
                "message" => "Login successful",
                "user_id" => $user_data["id"],
                "name" => $user_data["name"]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Face not recognized"]);
        }

        $conn->close();
    } catch (Exception $e) {
        if (isset($temp_image) && file_exists($temp_image)) {
            unlink($temp_image);
        }
        if (isset($stored_image) && file_exists($stored_image)) {
            unlink($stored_image);
        }
        http_response_code(500);
        echo json_encode(["error" => "Server error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>