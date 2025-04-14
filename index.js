import express from "express";
import cors from "cors";
import { db, doc, getDoc } from "../src/firebase.js"; // Make sure the path is correct

const app = express();
app.use(express.json());
app.use(cors()); // Allows frontend to call this API

app.post("/getVoter", async (req, res) => {
  const { voterId } = req.body;

  try {
    const voterRef = doc(db, "voters", voterId);
    const voterSnap = await getDoc(voterRef);

    if (!voterSnap.exists()) {
      return res.status(404).json({ error: "Voter not found" });
    }

    res.status(200).json(voterSnap.data());
  } catch (error) {
    res.status(500).json({ error: "Error fetching voter data" });
  }
});

// Server Start
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

