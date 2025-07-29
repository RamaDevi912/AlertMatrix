const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true, trim: true },
  password: String,
  location: String,
  phone: String,
  profilePic: String,
});

module.exports = mongoose.model('User', userSchema);
