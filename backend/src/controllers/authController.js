const User = require('../models/User');
const Progress = require('../models/Progress');
const jwt = require('jsonwebtoken');

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password, baseLanguage, targetLanguage } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    user = await User.create({
      username,
      email,
      password,
      baseLanguage: baseLanguage || 'en',
      targetLanguage: targetLanguage || 'es'
    });

    // Initialize Progress for user
    await Progress.create({ user: user._id });

    // Create token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        baseLanguage: user.baseLanguage,
        targetLanguage: user.targetLanguage
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Create token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        baseLanguage: user.baseLanguage,
        targetLanguage: user.targetLanguage
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { username, baseLanguage, targetLanguage } = req.body;
    
    // Explicitly fetch user with password so validation doesn't fail on missing required field
    const user = await User.findById(req.user.id).select('+password');

    if (username) user.username = username;
    if (baseLanguage) user.baseLanguage = baseLanguage;
    if (targetLanguage) user.targetLanguage = targetLanguage;

    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    
    // Handle duplicate key error (e.g., username taken)
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already taken' 
      });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};
