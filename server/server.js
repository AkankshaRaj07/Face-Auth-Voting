const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Firebase Admin SDK Initialize
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ✅ API to Fetch Voter Data from Firebase
app.post("/api/getVoter", async (req, res) => {
    const { voterId } = req.body;

    if (!voterId) {
        return res.status(400).json({ error: "Voter ID is required" });
    }

    try {
        const voterRef = db.collection("voters").doc(voterId);
        const voterSnap = await voterRef.get(); // ✅ Corrected variable name

        if (!voterSnap.exists) {
            return res.status(404).json({ error: "Voter not found" });
        }

        res.json(voterSnap.data());
    } catch (error) {
        console.error("Error fetching voter:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ Server Start
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
