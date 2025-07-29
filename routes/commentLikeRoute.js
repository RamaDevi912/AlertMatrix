// routes/commentLikeRoute.js
const express = require("express");
const router = express.Router();
const Incident = require("../models/postModel");

// Like or unlike
router.post("/:id/like", async (req, res) => {
  const { userEmail } = req.body;
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    const index = incident.likes.indexOf(userEmail);
    if (index > -1) {
      incident.likes.splice(index, 1);
    } else {
      incident.likes.push(userEmail);
    }
    await incident.save();
    res.json({ likes: incident.likes.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to like/unlike' });
  }
});

// Comment
router.post("/:id/comment", async (req, res) => {
  const { userEmail, comment } = req.body;
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    incident.comments.push({ userEmail, comment });
    await incident.save();
    res.json({ comments: incident.comments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to comment' });
  }
});

module.exports = router;