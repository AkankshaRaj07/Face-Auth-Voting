import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // Import logo
import { auth, sendOTP, verifyOTP, signInWithGoogle } from "../firebase"; // Import Firebase functions
import { onAuthStateChanged } from "firebase/auth"; // Detect if user is logged in
import "../styles.css"; // Import styles

function Signup() {
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");

  const navigate = useNavigate();

  // ✅ Keep user logged in if authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/home"); // Redirect if user is logged in
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // ✅ Handle Phone OTP Sign-Up
  const handleSendOTP = async () => {
    const success = await sendOTP(phoneNumber);
    if (success) {
      setOtpSent(true);
    } else {
      alert("Failed to send OTP. Check the number and try again.");
    }
  };

  const handleVerifyOTP = async () => {
    const user = await verifyOTP(otp);
    if (user) {
      navigate("/home"); // Redirect on successful sign-up
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  // ✅ Handle Google Sign-Up
  const handleGoogleSignIn = async () => {
    const user = await signInWithGoogle();
    if (user) {
      navigate("/home"); // Redirect on success
    } else {
      alert("Google sign-in failed. Try again.");
    }
  };

  return (
    <div className="split-container">
      {/* Left Side - Logo and Info */}
      <div className="left-side">
        <img src={logo} alt="Website Logo" className="logo" />
        <h1 className="app-name">VOTIFY</h1>
        <p className="app-tagline">From Queues To Clicks..</p>
      </div>

      {/* Right Side - Form Section */}
      <div className="right-side">
        <div className="form-container">
          <h2 className="form-title">SIGN UP</h2>

          {/* Phone Sign-Up Flow */}
          {!otpSent ? (
            <>
              <input
                type="text"
                placeholder="Enter Phone Number"
                className="input-field"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <button className="btn" onClick={handleSendOTP}>
                Send OTP
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                className="input-field"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button className="btn" onClick={handleVerifyOTP}>
                Submit
              </button>
            </>
          )}

          {/* Divider */}
          <div className="signdivider"><span>OR</span></div>

          {/* Google Sign-Up */}
          <button className="btn google-btn" onClick={handleGoogleSignIn}>
            Sign up with Google
          </button>
        </div>
      </div>

      {/* ReCAPTCHA Container (needed for phone authentication) */}
      <div id="recaptcha-container"></div>
    </div>
  );
}

export default Signup;
