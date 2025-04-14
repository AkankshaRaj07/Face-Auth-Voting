import cv2
import numpy as np
import base64
import tempfile
import os
from deepface import DeepFace

# Load Haarcascade for face detection
FACE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

def decode_image(base64_string):
    """Decode base64 image to OpenCV format."""
    try:
        image_data = base64.b64decode(base64_string.split(",")[1])
        np_arr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if img is None:
            print("❌ Decoded image is None")
        else:
            print(f"✅ Decoded image size: {img.shape}")

        return img
    except Exception as e:
        print(f"❌ Error decoding image: {e}")
        return None

def detect_and_crop_face(image_base64):
    """Detect face in image, crop it, and return in base64 format."""
    img = decode_image(image_base64)
    
    if img is None:
        return {"success": False, "message": "Image decoding failed."}

    try:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = FACE_CASCADE.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(50, 50))

        if len(faces) == 0:
            return {"success": False, "message": "No face detected."}

        # Crop the first detected face
        x, y, w, h = faces[0]
        cropped_face = img[y:y+h, x:x+w]

        # Encode cropped face as base64
        _, buffer = cv2.imencode(".jpg", cropped_face)
        face_base64 = base64.b64encode(buffer).decode("utf-8")

        return {"success": True, "croppedFace": f"data:image/jpeg;base64,{face_base64}"}

    except Exception as e:
        return {"success": False, "message": f"Face detection error: {e}"}

def save_temp_image(image, prefix="temp"):
    """Save image as a temporary file and return the file path."""
    try:
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg", prefix=prefix)
        cv2.imwrite(temp_file.name, image)
        return temp_file.name
    except Exception as e:
        print(f"❌ Error saving temporary image: {e}")
        return None

def verify_faces(voter_face_base64, selfie_base64):
    """Compare extracted voter ID face and selfie for verification."""
    voter_face = decode_image(voter_face_base64)
    selfie = decode_image(selfie_base64)

    if voter_face is None or selfie is None:
        return {"success": False, "message": "Image decoding failed."}

    # Save images as temporary files
    voter_face_path = save_temp_image(voter_face, "voter_face")
    selfie_path = save_temp_image(selfie, "selfie")

    if voter_face_path is None or selfie_path is None:
        return {"success": False, "message": "Error saving images."}

    try:
        print(f"✅ Running DeepFace verification on:\n  Voter Face: {voter_face_path}\n  Selfie: {selfie_path}")
        result = DeepFace.verify(img1_path=voter_face_path, img2_path=selfie_path, model_name="VGG-Face")

        # Clean up temp files
        os.remove(voter_face_path)
        os.remove(selfie_path)

        return {
            "success": result["verified"],
            "confidence": result["distance"],
            "message": "Face match successful!" if result["verified"] else "Faces do not match.",
        }
    except Exception as e:
        print(f"❌ DeepFace Error: {e}")
        return {"success": False, "message": "Face verification failed."}
