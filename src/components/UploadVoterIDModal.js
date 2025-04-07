import React, { useState, useRef } from "react";
import { db } from "../firebase"; // Make sure the path is correct
import axios from "axios";
import Tesseract from "tesseract.js";
import { setDoc, doc } from "firebase/firestore";

const UploadVoterIDModal = ({ closeModal,onSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Open Camera
    const openCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error("Camera access error:", error);
            alert("Camera access denied. Please allow camera permissions.");
        }
    };

    // Capture Photo
    const capturePhoto = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        const context = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `voterID_${Date.now()}.png`, { type: "image/png" });
                setSelectedFile(file);
                setPreviewImage(URL.createObjectURL(file));
                closeCamera();
            }
        }, "image/png");
    };

    // Close Camera
    const closeCamera = () => {
        setIsCameraOpen(false);
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    // OCR using Tesseract
    const extractTextFromImage = async (imageFile) => {
        return new Promise((resolve, reject) => {
            Tesseract.recognize(imageFile, "eng", {
                logger: (m) => console.log(m),
            })
                .then(({ data: { text } }) => resolve(text))
                .catch((error) => reject(error));
        });
    };

    // OCR using OCR.space (Optional Backup)
    const extractTextFromOCRSpace = async (imageFile) => {
        const formData = new FormData();
        formData.append("apikey", "K89615291588957");
        formData.append("file", imageFile);
        formData.append("language", "eng");

        try {
            const response = await axios.post("https://api.ocr.space/parse/image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data.ParsedResults[0].ParsedText || "Text extraction failed.";
        } catch (error) {
            console.error("OCR API Error:", error);
            return "Error extracting text.";
        }
    };

    // Upload Handler
    const uploadVoterID = async (file) => {
        if (!file) {
            alert("Please select a file before uploading.");
            return;
        }

        setLoading(true);
        setError(null);
        setUploadSuccess(false);

        try {
            const toBase64 = (file) =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                });

            const base64Image = await toBase64(file);

            console.log("🔍 Extracting text from image...");
            const extractedText = await extractTextFromImage(file);
            console.log("📝 Extracted Text:", extractedText);

            const voterData = {
                voterID: extractedText.match(/[A-Z]{3}\d{7}/)?.[0] || "Unknown ID",
                name: extractedText.match(/(Name|नाम)[:\s]*([A-Z\s]+)/i)?.[2] || "Unknown Name",
                dob: extractedText.match(/\b\d{2}[-/]\d{2}[-/]\d{4}\b/)?.[0] || "Unknown DOB",
                gender: "Female",
                voterIDImage: base64Image,
                timestamp: new Date()
            };

            if (voterData.voterID === "Unknown ID") {
                alert("❌ Voter ID not detected in the image.");
                return;
            }

            console.log("📜 Parsed Voter Data:", voterData);

            await setDoc(doc(db, "voters", voterData.voterID), voterData);

            setUploadSuccess(true);
            alert(`✅ Voter ID Data for ${voterData.voterID} Uploaded Successfully!`);
            
if (onSuccess) {
    console.log("➡️ Calling onSuccess from parent");
    onSuccess(); // call parent to set box green
} else {
    console.warn("⚠️ onSuccess callback is undefined");
}
        } catch (err) {
            console.error("❌ Error extracting/saving voter data:", err);
            setError("❌ Error processing voter ID.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Upload Voter ID</h2>

                {previewImage && (
                    <div>
                        <img
                            src={previewImage}
                            alt="Preview"
                            style={{ maxWidth: "200px", maxHeight: "200px" }}
                        />
                    </div>
                )}

                <button onClick={() => document.getElementById("fileInput").click()}>
                    Choose from Device
                </button>

                <input
                    type="file"
                    id="fileInput"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            setSelectedFile(file);
                            setPreviewImage(URL.createObjectURL(file));
                            console.log("🗂️ File selected:", file);
                        }
                    }}
                />

                <button onClick={openCamera}>Click a Photo</button>
                <button onClick={() => uploadVoterID(selectedFile)}>Upload</button>

                {isCameraOpen && (
                    <div className="camera-container">
                        <video ref={videoRef} autoPlay playsInline />
                        <canvas ref={canvasRef} style={{ display: "none" }} />
                        <button onClick={capturePhoto}>Capture Photo</button>
                        <button onClick={closeCamera}>Close Camera</button>
                    </div>
                )}

                {loading && <p>Uploading...</p>}
                {uploadSuccess && <p>✅ Upload Successful!</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}

                <button className="close-btn" onClick={closeModal}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default UploadVoterIDModal;
