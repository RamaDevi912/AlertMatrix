const mongoose = require('mongoose');

// Comment sub-schema
const commentSchema = new mongoose.Schema({
  email: { type: String, required: true },
  userName: { type: String },
  avatar: { type: String, default: '' },
  text: { type: String, required: true },
  time: { type: Date, default: Date.now },
});

// Main Incident Post schema
const postSchema = new mongoose.Schema({
  place: { type: String, required: true },
  location: { type: String, required: true }, // Place name or address
  picture: { type: String },
  date: { type: String },
  time: { type: String },
  timestamp: { type: Date, default: Date.now },
  description: { type: String, required: true },
  incidentType: { type: String, required: true },
  postedBy: { type: String, required: true }, // email
  userName: { type: String },
  userAvatar: { type: String, default: 'uploads/default-avatar.jpg' },

  likes: [{ type: String }],     // array of user emails
  dislikes: [{ type: String }],
  reports: [{ type: String }],
  comments: [commentSchema],
});

module.exports = mongoose.model('Incident', postSchema);
