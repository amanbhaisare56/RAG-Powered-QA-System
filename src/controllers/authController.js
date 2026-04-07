const { register, login } = require('../services/authService');

const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const user = await register(email, password);
    res.status(201).json({ 
      message: 'User registered successfully',
      user 
    });
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const result = await login(email, password);
    res.json({
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    if (error.message.includes('Invalid')) {
      return res.status(401).json({ error: error.message });
    }
    next(error);
  }
};

module.exports = { registerUser, loginUser };