import React, { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { getVoterDetails } from "../firebase";
import "../styles.css";

const Verification = ({ onClose,onDownload }) => {
    const [voterId, setVoterId] = useState("");
    const [voterData, setVoterData] = useState(null);
    const [error, setError] = useState("");
    const qrRef = useRef(null);

    const fetchVoter = async () => {
        if (!voterId.trim()) {
            alert("Please enter Voter ID!");
            return;
        }

        const data = await getVoterDetails(voterId);
        if (data) {
            setVoterData(data);
            setError("");
        } else {
            setVoterData(null);
            setError("Voter not found!");
        }
    };

    // ✅ Remove imageUrl/selfieBase64 from QR
    const getSanitizedQRData = (data) => {
        const { name, dob, voterId,gender } = data;
        return JSON.stringify({ name, dob, voterId,gender });
    };
    

    // ✅ Download QR Code
    const downloadQR = () => {
        const canvas = qrRef.current.querySelector("canvas");
        const imageURL = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imageURL;
        link.download = "VoterQR.png";
        link.click();
        if (onDownload) {
            onDownload();  // This will update the UI in Home.jsx
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Voter Verification</h2>
                <div className="verification-container">
                    {/* Left Section */}
                    <div className="left-section">
                        {!voterData ? (
                            <>
                                <input
                                    type="text"
                                    placeholder="Enter Voter ID"
                                    value={voterId}
                                    onChange={(e) => setVoterId(e.target.value)}
                                    className="input-field"
                                />
                                <button className="btn" onClick={fetchVoter}>
                                    Generate QR
                                </button>
                            </>
                        ) : (
                            <div className="voter-details">
                                <h3>Voter Details</h3>
                                <p><strong>Name:</strong> {voterData.name}</p>
                                <p><strong>DOB:</strong> {voterData.dob}</p>
                                <p><strong>Gender:</strong> {voterData.gender}</p>
                                {voterData.imageUrl && (
                                    <img src={voterData.imageUrl} alt="Voter" className="voter-image" />
                                )}
                            </div>
                        )}
                        {error && <p className="error">{error}</p>}
                    </div>

                    {/* Divider */}
                    <div className="divider"></div>

                    {/* Right Section: QR Code */}
                    {voterData && (
                        <div className="right-section">
                            <h3>QR Code</h3>
                            <div className="qr-container" ref={qrRef}>
                                <QRCodeCanvas
                                    value={getSanitizedQRData(voterData)}
                                    size={150}
                                />
                            </div>
                            <button className="btn" onClick={downloadQR} style={{ marginTop: "10px" }}>
                                Download QR
                            </button>
                        </div>
                    )}
                </div>

                {/* Close Button */}
                <button className="btn close-btn" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default Verification;
