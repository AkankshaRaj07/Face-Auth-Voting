import cv2
import pytesseract
import numpy as np
import base64

def decode_image(base64_string):
    """Convert base64 string to OpenCV image."""
    try:
        image_data = base64.b64decode(base64_string.split(",")[1])
        np_arr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print(f"❌ Error decoding image: {e}")
        return None

def extract_text(base64_image):
    """Extract text from Voter ID image using OCR."""
    img = decode_image(base64_image)
    
    if img is None:
        return None

    # Convert image to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply thresholding
    processed = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                      cv2.THRESH_BINARY, 11, 2)

    # Extract text using pytesseract
    extracted_text = pytesseract.image_to_string(processed)

    # Parsing extracted text (modify based on actual voter ID format)
    text_lines = extracted_text.split("\n")
    voter_data = {
        "Voter ID": None,
        "Name": None,
        "Date of Birth": None,
        "Gender": None,
        "Address": None
    }

    for line in text_lines:
        if "Name" in line:
            voter_data["Name"] = line.split(":")[-1].strip()
        elif "DOB" in line or "Date of Birth" in line:
            voter_data["Date of Birth"] = line.split(":")[-1].strip()
        elif "Gender" in line:
            voter_data["Gender"] = line.split(":")[-1].strip()
        elif "Address" in line:
            voter_data["Address"] = line.split(":")[-1].strip()
        elif len(line.strip()) == 10 and line.strip().isalnum():
            voter_data["Voter ID"] = line.strip()

    return voter_data

