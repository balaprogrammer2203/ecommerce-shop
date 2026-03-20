const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Please provide name, email and password', 400, 'VALIDATION_ERROR');
  }

  const userExists = await User.findOne({ email });
  if (userExists) throw new AppError('User already exists', 400, 'USER_ALREADY_EXISTS');

  const user = await User.create({ name, email, password });
  const token = generateToken(res, user._id);

  return res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw new AppError('Email and password are required', 400, 'VALIDATION_ERROR');

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email or password', 401, 'AUTH_INVALID');
  }

  const token = generateToken(res, user._id);
  return res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  });
});

const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({ message: 'Logged out successfully' });
};

const getProfile = (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
};

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

  if (req.body.name !== undefined) {
    if (!String(req.body.name).trim()) throw new AppError('Name cannot be empty', 400, 'VALIDATION_ERROR');
    user.name = req.body.name;
  }
  if (req.body.email !== undefined) user.email = req.body.email;

  if (req.body.password !== undefined) {
    const password = req.body.password;
    if (!password || String(password).length < 6) {
      throw new AppError('Password must be at least 6 characters', 400, 'VALIDATION_ERROR');
    }
    user.password = password;
  }

  const updatedUser = await user.save();
  return res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
  });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
};

