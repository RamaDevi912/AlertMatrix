const express = require("express");
const router = express.Router();
const Incident = require("../models/postModel");

// Get all incidents
router.get("/", async (req, res) => {
  try {
    const incidents = await Incident.find();
    res.json(incidents);
  } catch (err) {
    console.error("Error fetching incidents:", err);
    res.status(500).send("Server error");
  }
});

// Post a new incident
router.post("/", upload.single("picture"), async (req, res) => {
  try {
    const {
      place,
      location,
      date,
      time,
      timestamp,
      description,
      incidentType,
      postedBy,
      userName,
      userAvatar,
    } = req.body;

    const picturePath = req.file
      ? `http://${req.headers.host}/uploads/${req.file.filename}`
      : "";

    if (
      !place || !location || !date || !time || !timestamp ||
      !description || !incidentType || !picturePath || !postedBy
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newIncident = new Incident({
      place,
      location,
      picture: picturePath,
      date,
      time,
      timestamp,
      description,
      incidentType,
      postedBy,
      userName,
      userAvatar, // ✅ Save avatar
    });

    const savedIncident = await newIncident.save();

    // Emit new post via socket
    req.app.get('io').emit('new-incident', savedIncident);

    res.status(201).json(savedIncident);
  } catch (err) {
    console.error("Error saving incident:", err);
    res.status(500).json({ message: "Failed to save incident." });
  }
});


module.exports = router;
