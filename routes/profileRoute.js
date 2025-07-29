// routes/profileRoute.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/userModel');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `profile-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// GET: /api/user-profile?email=...
router.get('/user-profile', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      firstName: user.name?.split(' ')[0] || '',
      lastName: user.name?.split(' ')[1] || '',
      email: user.email,
      profileImage: user.profilePic, // path like uploads/profile-xxxxx.jpg
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// POST: /api/upload-profile-pic
router.post('/upload-profile-pic', upload.single('profileImage'), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !req.file) return res.status(400).json({ message: 'Missing email or file' });

    const filePath = req.file.path.replace(/\\/g, '/');

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { profilePic: filePath },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile picture uploaded', profilePic: filePath });
  } catch (err) {
    res.status(500).json({ message: 'Image upload failed', error: err.message });
  }
});

module.exports = router;
