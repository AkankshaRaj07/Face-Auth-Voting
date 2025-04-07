import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react"; // ✅ Correct Import

const App = () => {
    const [voterId, setVoterId] = useState("");
    const [voterData, setVoterData] = useState(null);
    const [error, setError] = useState("");
    const [qrData, setQrData] = useState(null); // ✅ QR Code state

    // ✅ Function to Fetch Voter Data from Backend API
    const fetchVoter = async () => {
        if (!voterId.trim()) {
            alert("Please enter Voter ID!");
            return;
        }

        try {
            const response = await fetch("http://localhost:5178/api/getVoter", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ voterId }),
            });

            const data = await response.json();
            
            if (response.ok) {
                setVoterData(data);
                setError("");
                generateQR(data); // ✅ Generate QR Code only if voter found
            } else {
                setVoterData(null);
                setError(data.error);
                setQrData(null); // Reset QR code if no voter found
            }
        } catch (error) {
            setError("Error fetching voter data");
            setVoterData(null);
            setQrData(null);
        }
    };

    // ✅ Function to Generate QR Code with Voter Data
    const generateQR = (data) => {
        const qrContent = `Voter ID: ${voterId}\nName: ${data.name}\nAge: ${data.age}\nCity: ${data.city}`;
        setQrData(qrContent);
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Voter Lookup & QR Code Generator</h2>

            <input 
                type="text" 
                placeholder="Enter Voter ID" 
                value={voterId} 
                onChange={(e) => setVoterId(e.target.value)}
                style={{ padding: "10px", margin: "10px", fontSize: "16px" }}
            />

            <button 
                onClick={fetchVoter} 
                style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
            >
                Fetch Voter Data
            </button>

            {/* ✅ Display Voter Data */}
            {voterData && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Voter Details:</h3>
                    <p><strong>Name:</strong> {voterData.name}</p>
                    <p><strong>age:</strong> {voterData.dob}</p>
                    <p><strong>Gender:</strong> {voterData.gender || "Unknown"}</p>

                </div>
            )}

            {/* ❌ Display Error if Voter Not Found */}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* ✅ Display QR Code if Voter Data is Found */}
            {qrData && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Voter QR Code:</h3>
                    <QRCodeCanvas value={qrData} size={200} />
                    <p>{qrData}</p>
                </div>
            )}
        </div>
    );
};

export default App;
