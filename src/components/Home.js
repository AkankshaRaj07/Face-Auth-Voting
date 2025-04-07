import React, { useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo2.png"; // Logo Image
import voterIdImg from "../assets/voter.png"; // Voter ID Image
import facePhotoImg from "../assets/face-photo.png"; // Face Photo Image
import verificationImg from "../assets/verification.png"; // Verification Status Image
import UploadVoterIDModal from "./UploadVoterIDModal";
import FaceRecognition from "./FaceRecognition";
import Verification from "./Verification";
import "../styles.css"; // Ensure styles are included

function Home() {
  const navigate = useNavigate();
  const [showSignOut, setShowSignOut] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [voterIDUploaded, setVoterIDUploaded] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [qrDownloaded, setQrDownloaded] = useState(false);

  const handleSignOut = async () => {
    await auth.signOut();
    navigate("/signup"); // Redirect to sign-up page
  };

  return (
    <div className="home-container">
      {/* Navbar */}
      <div className="navbar">
        <img src={logo} alt="Website Logo" className="navbar-logo" />
        <div className="account-section">
          <div className="account-section">
  <button className="btn signout-btn" onClick={handleSignOut}>
    Sign Out
  </button>
</div>

        </div>
      </div>

      {/* Welcome Heading */}
      <h1 className="welcome-text">Welcome to Votify!</h1>

      {/* Centered Three Rectangular Boxes */}
      <div className="boxes-container">
        {/* Voter ID Upload Box */}
        <div className={`box ${voterIDUploaded ? "box-success" : ""}`}>
          <img src={voterIdImg} alt="Voter ID" className="box-img" />
          {voterIDUploaded ? (
            <p className="success-message">Voter ID uploaded successfully</p>
          ) : (
            <button className="btn" onClick={() => setIsModalOpen(true)}>
              Upload Your Voter ID
            </button>
          )}
        </div>

        {/* Face Photo Upload Box */}
        <div className={`box ${faceVerified ? "box-success" : ""}`}>
          <img src={facePhotoImg} alt="Face Photo" className="box-img" />
          {faceVerified ? (
            <p className="success-message">Face Verified</p>
          ) : (
            <button className="btn" onClick={() => setPopupOpen(true)}>
              Upload Your Face Photo
            </button>
          )}
        </div>

        {/* Verification Status Box */}
        <div className={`box ${qrDownloaded ? "box-success" : ""}`}>
          <img
            src={verificationImg}
            alt="Verification Status"
            className="box-img"
          />
          {qrDownloaded ? (
            <p className="success-message">
              All details verified successfully <br />
              and QR code generated
            </p>
          ) : (
            <button className="btn" onClick={() => setShowVerification(true)}>
              Check Verification Status
            </button>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <footer className="footer-bar">Made by Techdrifters</footer>

      {/* Upload Voter ID Modal */}
      {isModalOpen && (
        <UploadVoterIDModal
          closeModal={() => setIsModalOpen(false)}
          onSuccess={() => setVoterIDUploaded(true)}
        />
      )}

      {/* Face Recognition Popup */}
      <FaceRecognition
        isOpen={isPopupOpen}
        onClose={() => setPopupOpen(false)}
        onSuccess={() => setFaceVerified(true)}
      />

      {/* Verification Popup */}
      {showVerification && (
        <Verification
          onClose={() => setShowVerification(false)}
          onDownload={() => setQrDownloaded(true)}
        />
      )}
    </div>
  );
}

export default Home;
