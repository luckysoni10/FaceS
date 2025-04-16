import sys
import face_recognition

def compare_faces(image1_path, image2_path):
    try:
        # Load images
        image1 = face_recognition.load_image_file(image1_path)
        image2 = face_recognition.load_image_file(image2_path)

        # Get face encodings
        encodings1 = face_recognition.face_encodings(image1)
        encodings2 = face_recognition.face_encodings(image2)

        # Check if faces are detected
        if len(encodings1) == 0 or len(encodings2) == 0:
            return "False"

        # Compare faces
        result = face_recognition.compare_faces([encodings1[0]], encodings2[0])
        return "True" if result[0] else "False"

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return "False"

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("False")
        sys.exit(1)
    
    image1_path = sys.argv[1]
    image2_path = sys.argv[2]
    result = compare_faces(image1_path, image2_path)
    print(result)