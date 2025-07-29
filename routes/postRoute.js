const express = require("express");
const multer = require("multer");
const path = require("path");
const Incident = require("../models/postModel");
const UserModel = require("../models/userModel");
const router = express.Router();
const io = require("../server").io;

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// GET all incidents
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    const filter = email ? { postedBy: email } : {};
    const incidents = await Incident.find(filter).sort({ timestamp: -1 });
    res.json(incidents);
  } catch (err) {
    console.error("Error fetching incidents:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST new incident with socket events
router.post("/", upload.single("picture"), async (req, res) => {
  try {
    console.log("📦 Request Body:", req.body);
    console.log("📷 Uploaded File:", req.file);

    const {
      place, location, date, time, timestamp,
      description, incidentType, postedBy, userName,
    } = req.body;

    const picturePath = req.file ? req.file.filename : "";

    if (
      !place?.trim() || !location?.trim() || !date?.trim() || !time?.trim() ||
      !timestamp?.trim() || !description?.trim() || !incidentType?.trim() ||
      !picturePath?.trim() || !postedBy?.trim()
    ) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ message: "All fields are required." });
    }

    const user = await UserModel.findOne({ email: postedBy });
    if (!user) {
      console.log("❌ User not found:", postedBy);
      return res.status(404).json({ error: "User not found." });
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
      userAvatar: user.profilePic || "uploads/default-avatar.jpg",
    });

    const savedIncident = await newIncident.save();
    console.log("✅ Incident saved:", savedIncident);

    io.emit('new-incident', savedIncident);
    io.emit('new-notification', {
      message: `${userName} posted a new ${incidentType} incident`,
      location: place,
      userAvatar: user.profilePic || "uploads/default-avatar.jpg",
      timestamp: new Date(),
    });

    res.status(201).json(savedIncident);
  } catch (err) {
    console.error("❌ Error saving incident:", err);
    res.status(500).json({ message: "Failed to save incident." });
  }
});

// Like a post
router.put("/like/:id", async (req, res) => {
  const { id } = req.params;
  const { user } = req.body;

  try {
    const post = await Incident.findById(id);
    if (!post.likes.includes(user)) {
      post.likes.push(user);
      post.dislikes = post.dislikes.filter(u => u !== user);
    }
    await post.save();
    res.json(post);
  } catch (err) {
    console.error("Error liking post:", err);
    res.status(500).json({ message: "Failed to like post." });
  }
});

// Dislike a post
router.put("/dislike/:id", async (req, res) => {
  const { id } = req.params;
  const { user } = req.body;

  try {
    const post = await Incident.findById(id);
    if (!post.dislikes.includes(user)) {
      post.dislikes.push(user);
      post.likes = post.likes.filter(u => u !== user);
    }
    await post.save();
    res.json(post);
  } catch (err) {
    console.error("Error disliking post:", err);
    res.status(500).json({ message: "Failed to dislike post." });
  }
});

// Comment on post
router.post("/comment/:id", async (req, res) => {
  const { id } = req.params;
  const { user, userName, comment } = req.body;

  try {
    const userDoc = await UserModel.findOne({ email: user });
    const avatar = userDoc?.profilePic || "";

    const post = await Incident.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      email: user,
      userName,
      text: comment,
      avatar,
      time: new Date(),
    });

    await post.save();
    res.json(post);
  } catch (err) {
    console.error("Error commenting:", err);
    res.status(500).json({ message: "Failed to add comment." });
  }
});


// Report a post
router.put("/report/:id", async (req, res) => {
  const { id } = req.params;
  const { user } = req.body;

  try {
    const post = await Incident.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    if (post.reports.includes(user)) {
      return res.status(400).json({ message: "You already reported this post." });
    }

    post.reports.push(user);

    if (post.reports.length >= 3) {
      await Incident.findByIdAndDelete(id);
      return res.status(200).json({ message: "Post deleted due to multiple reports." });
    } else {
      await post.save();
      return res.status(200).json({ message: "Reported successfully." });
    }
  } catch (err) {
    console.error("Error reporting post:", err);
    res.status(500).json({ message: "Failed to report post." });
  }
});

module.exports = router;
