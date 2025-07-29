const User = require('../models/userModel');
const bcrypt = require('bcrypt');

exports.Signup = async (req, res) => {
  const { name, email, password, phone, location } = req.body;
  console.log('🔐 Signup request received:', req.body);

  try {
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      console.log('⚠️ Email already exists:', email);
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone,
      location,
    });

    await user.save();
    console.log('✅ User saved successfully:', user);
    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.Login = async (req, res) => {
  console.log("This is comming for login...")
  console.log(req.body)
  const { email, password } = req.body;
  console.log(email, password)
  console.log('🔐 Login attempt:', email);

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('❌ Incorrect password for:', email);
      return res.status(400).json({ message: 'Incorrect password' });
    }

    console.log('✅ Login successful for:', email);
    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
