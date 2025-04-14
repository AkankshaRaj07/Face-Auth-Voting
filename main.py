from flask_cors import CORS

import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppresses TensorFlow warnings

from flask import Flask, request, jsonify
from firebase_admin import credentials, firestore, initialize_app
import firebase_admin

import base64
import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim

# ✅ Initialize Firebase only if not already initialized
# Get the absolute path to serviceAccountKey.json
service_account_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "serviceAccountKey.json")

if not firebase_admin._apps:
    cred = credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()


app = Flask(__name__)
CORS(app, supports_credentials=True)
@app.route("/")
def home():
    """Default route to prevent 404 errors"""
    return jsonify({"message": "Face verification API is running!"})

def base64_to_image(base64_str):
    if base64_str.startswith("data:image"):
        base64_str = base64_str.split(",")[1]
    img_data = base64.b64decode(base64_str)
    np_arr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return img

def compare_images(img1, img2):
    img1 = cv2.resize(img1, (300, 300))
    img2 = cv2.resize(img2, (300, 300))
    gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)
    score, _ = ssim(gray1, gray2, full=True)
    return score

@app.route('/verify-face', methods=['POST'])
def verify_face():
    data = request.get_json()
    voter_id = data.get("voterId")

    if not voter_id:
        return jsonify({"error": "Voter ID is required"}), 400

    # Fetch documents
    selfie_doc = db.collection("face_verifications").document(voter_id).get()
    voter_doc = db.collection("voters").document(voter_id).get()

    if not selfie_doc.exists or not voter_doc.exists:
        return jsonify({"error": "Images not found for this voter ID"}), 404

    selfie_b64 = selfie_doc.to_dict().get("selfieBase64")
    voter_b64 = voter_doc.to_dict().get("voterIDImage")

    try:
        selfie_img = base64_to_image(selfie_b64)
        voter_img = base64_to_image(voter_b64)
        score = compare_images(selfie_img, voter_img)
        return jsonify({
            "similarity": round(score * 100, 2),
            "verified": bool(score > 0.25)  # ✅ You can tweak threshold
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
