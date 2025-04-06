# Face-Auth-Voting
 A secure AI-powered system that verifies voter identity by comparing their uploaded voter ID with a real-time selfie using Google AI.
 🔍 Overview
Votify streamlines the voter verification process by allowing users to upload their Voter ID and a real-time selfie. The system then compares both images using face recognition (DeepFace) and Structural Similarity Index (SSIM) to verify identity.

🚀 Features
📄 Voter ID image upload with OCR text extraction

🤳 Real-time selfie capture

🧠 Face matching using DeepFace and SSIM

🔐 Secure image storage via Firebase

🔍 Comparison logic handled in Python (Flask backend)

🧩 Tech Stack
Frontend: React.js

Backend: Flask (Python)

Database/Storage: Firebase

Face Verification: DeepFace + SSIM

OCR: Google Vision API

📁 Project Structure
bash
Copy
Edit
/votify
│
├── frontend/            # React frontend
│   └── ...
│
├── backend/             # Flask backend
│   └── app.py
│
├── firebase/            # Firebase setup & configs
│
└── README.md
⚙️ How it Works
User uploads their Voter ID and captures a selfie.

Images are stored in Firebase (voters and face_verifications collections).

Flask backend fetches the images and performs:

Text extraction from the Voter ID using Google Vision API.

Face similarity comparison using DeepFace and SSIM.

Verification result is returned to the frontend.

🧪 Future Improvements
Add liveness detection

Improve UI/UX and responsiveness

Role-based authorization for admin and user

Support for multiple document types

🛠️ Setup Instructions
1. Clone the Repo
bash
Copy
Edit
git clone https://github.com/yourusername/votify.git
cd votify
2. Frontend Setup
bash
Copy
Edit
cd frontend
npm install
npm start
3. Backend Setup
bash
Copy
Edit
cd backend
pip install -r requirements.txt
python app.py
4. Firebase & API Keys
Set up Firebase project and configure Firestore and Storage.

Add Firebase config to the frontend.

Enable Google Cloud Vision API and add the credentials file to backend.
