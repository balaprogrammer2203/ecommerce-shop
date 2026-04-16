const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const mapUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || '',
  dateOfBirth: user.dateOfBirth || null,
  address: user.address || {},
  profileImageUrl: user.profileImageUrl || '',
  lastLoginAt: user.lastLoginAt || null,
  twoFactorEnabled: Boolean(user.twoFactorEnabled),
  activeSessionsCount: Array.isArray(user.activeSessions) ? user.activeSessions.length : 0,
  createdAt: user.createdAt,
});

const getAdminUsers = asyncHandler(async (_req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 });
  return res.json(users.map(mapUser));
});

const updateAdminUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

  if (req.body.name !== undefined) user.name = String(req.body.name || '').trim();
  if (req.body.email !== undefined) user.email = String(req.body.email || '').trim().toLowerCase();
  if (req.body.role !== undefined) {
    const role = String(req.body.role);
    if (!['customer', 'admin'].includes(role)) {
      throw new AppError('Invalid role', 400, 'VALIDATION_ERROR');
    }
    user.role = role;
  }
  if (req.body.phone !== undefined) user.phone = String(req.body.phone || '').trim();
  if (req.body.twoFactorEnabled !== undefined) user.twoFactorEnabled = Boolean(req.body.twoFactorEnabled);

  const updated = await user.save();
  return res.json(mapUser(updated));
});

const deleteAdminUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  await user.deleteOne();
  return res.json({ message: 'User removed' });
});

module.exports = {
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
};
