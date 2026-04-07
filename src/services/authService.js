const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function register(email, password) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error('User already exists with this email');
  }
  
  const user = await User.create({ email, password });
  return { id: user._id, email: user.email };
}

async function login(email, password) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }
  
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  return { token, user: { id: user._id, email: user.email } };
}

module.exports = { register, login };