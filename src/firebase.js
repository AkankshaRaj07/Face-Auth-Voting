import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    RecaptchaVerifier, 
    signInWithPhoneNumber, 
    GoogleAuthProvider, 
    signInWithPopup 
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc 
} from "firebase/firestore";

// ✅ Firebase Configuration (Replace with your own)
const firebaseConfig = {
    apiKey: "AIzaSyAfF1-zp4Qlt6uN3fxE1u10N4rN-Yi4tPQ",
    authDomain: "vote-160ee.firebaseapp.com",
    projectId: "vote-160ee",
    storageBucket: "vote-160ee.appspot.com",  // ✅ Fixed storage bucket URL
    messagingSenderId: "805265713155",
    appId: "1:805265713155:web:7fab62328cf721c2640636",
    measurementId: "G-5XNKKEG2NX"
};

// ✅ Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Function to check if user exists in Firestore
const checkUserExists = async (uid) => {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        return userSnap.exists();
    } catch (error) {
        console.error("Error checking user existence:", error);
        return false;
    }
};

// ✅ Function to save user profile in Firestore
const saveUserProfile = async (uid, data) => {
    try {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, data, { merge: true });
    } catch (error) {
        console.error("Error saving user profile:", error);
    }
};

// ✅ Google Sign-In Function (Fixed)
export const signInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" }); // ✅ Always show account chooser
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // ✅ Check if user exists in Firestore, then save details
        if (!(await checkUserExists(user.uid))) {
            await saveUserProfile(user.uid, {
                email: user.email,
                name: user.displayName,
                profilePic: user.photoURL,
            });
        }
        
        return user;
    } catch (error) {
        console.error("Google Sign-In Failed:", error);
        alert(`Google Sign-In Error: ${error.message}`); // ✅ Show error message
        return null;
    }
};

// ✅ Function to send OTP for phone authentication
export const sendOTP = async (phone) => {
    try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "invisible",
            callback: () => console.log("ReCAPTCHA Verified!"),
        });

        const confirmationResult = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
        window.confirmationResult = confirmationResult;
        return true;
    } catch (error) {
        console.error("Error sending OTP:", error);
        return false;
    }
};

// ✅ Function to verify OTP
export const verifyOTP = async (otp) => {
    try {
        const result = await window.confirmationResult.confirm(otp);
        const user = result.user;

        // ✅ Save user details in Firestore
        if (!(await checkUserExists(user.uid))) {
            await saveUserProfile(user.uid, { phone: user.phoneNumber });
        }

        return user;
    } catch (error) {
        console.error("OTP verification failed:", error);
        return null;
    }
};// ✅ Function to fetch voter details from Firestore
export const getVoterDetails = async (voterID) => {
    try {
        const voterRef = doc(db, "voters", voterID); // Reference to Firestore document
        const voterSnap = await getDoc(voterRef);

        if (voterSnap.exists()) {
            return voterSnap.data();  // Return voter details
        } else {
            console.log("❌ No voter found with the provided ID");
            return null;
        }
    } catch (error) {
        console.error("❌ Error fetching voter details:", error);
        return null;
    }
};


// ✅ Export Firebase Modules
export { auth, db, doc, getDoc,storage, ref, uploadBytes, getDownloadURL,setDoc,};