const crypto = require('crypto');

const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const buildUserResponse = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || '',
  dateOfBirth: user.dateOfBirth || null,
  address: {
    line1: user.address?.line1 || '',
    line2: user.address?.line2 || '',
    city: user.address?.city || '',
    state: user.address?.state || '',
    postalCode: user.address?.postalCode || '',
    country: user.address?.country || '',
  },
  profileImageUrl: user.profileImageUrl || '',
  security: {
    twoFactorEnabled: Boolean(user.twoFactorEnabled),
    lastLoginAt: user.lastLoginAt || null,
    activeSessions: (user.activeSessions || []).map((session) => ({
      sessionId: session.sessionId,
      userAgent: session.userAgent || '',
      ip: session.ip || '',
      createdAt: session.createdAt || null,
      lastSeenAt: session.lastSeenAt || null,
    })),
  },
  ...(token ? { token } : {}),
});

const upsertSessionForUser = async (user, req) => {
  const sessionId = crypto.randomUUID();
  const now = new Date();
  const currentSessions = user.activeSessions || [];
  user.activeSessions = [
    ...currentSessions,
    {
      sessionId,
      userAgent: req.get('user-agent') || '',
      ip: req.ip || '',
      createdAt: now,
      lastSeenAt: now,
    },
  ].slice(-5);
  user.lastLoginAt = now;
  await user.save();
  return sessionId;
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Please provide name, email and password', 400, 'VALIDATION_ERROR');
  }

  const userExists = await User.findOne({ email });
  if (userExists) throw new AppError('User already exists', 400, 'USER_ALREADY_EXISTS');

  const user = await User.create({ name, email, password });
  const sessionId = await upsertSessionForUser(user, req);
  const token = generateToken(res, user._id, sessionId);

  return res.status(201).json(buildUserResponse(user, token));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw new AppError('Email and password are required', 400, 'VALIDATION_ERROR');

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email or password', 401, 'AUTH_INVALID');
  }

  const sessionId = await upsertSessionForUser(user, req);
  const token = generateToken(res, user._id, sessionId);
  return res.json(buildUserResponse(user, token));
});

const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({ message: 'Logged out successfully' });
};

const getProfile = (req, res) => {
  res.json(buildUserResponse(req.user));
};

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

  if (req.body.name !== undefined) {
    if (!String(req.body.name).trim()) throw new AppError('Name cannot be empty', 400, 'VALIDATION_ERROR');
    user.name = String(req.body.name).trim();
  }
  if (req.body.email !== undefined) user.email = String(req.body.email).trim().toLowerCase();
  if (req.body.phone !== undefined) user.phone = String(req.body.phone || '').trim();
  if (req.body.dateOfBirth !== undefined) {
    user.dateOfBirth = req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null;
  }
  if (req.body.address !== undefined && req.body.address && typeof req.body.address === 'object') {
    user.address = {
      line1: String(req.body.address.line1 || '').trim(),
      line2: String(req.body.address.line2 || '').trim(),
      city: String(req.body.address.city || '').trim(),
      state: String(req.body.address.state || '').trim(),
      postalCode: String(req.body.address.postalCode || '').trim(),
      country: String(req.body.address.country || '').trim(),
    };
  }
  if (req.body.profileImageUrl !== undefined) {
    user.profileImageUrl = String(req.body.profileImageUrl || '').trim();
  }

  if (req.body.password !== undefined) {
    const password = req.body.password;
    if (!password || String(password).length < 6) {
      throw new AppError('Password must be at least 6 characters', 400, 'VALIDATION_ERROR');
    }
    user.password = password;
  }

  const updatedUser = await user.save();
  return res.json(buildUserResponse(updatedUser));
});

const uploadProfileImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

  const { imageBase64 } = req.body;
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    throw new AppError('imageBase64 is required', 400, 'VALIDATION_ERROR');
  }
  if (!imageBase64.startsWith('data:image/')) {
    throw new AppError('Invalid image format. Use a data URL image payload.', 400, 'VALIDATION_ERROR');
  }
  const maxBytes = 2 * 1024 * 1024;
  const approxBytes = Math.ceil((imageBase64.length * 3) / 4);
  if (approxBytes > maxBytes) {
    throw new AppError('Profile image is too large. Maximum allowed size is 2MB.', 400, 'VALIDATION_ERROR');
  }

  user.profileImageUrl = imageBase64;
  await user.save();

  return res.json({ profileImageUrl: user.profileImageUrl });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  uploadProfileImage,
};

