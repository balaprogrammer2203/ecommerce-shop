const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const getTokenFromRequest = (req) => {
  if (req.cookies && req.cookies.jwt) {
    return req.cookies.jwt;
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  return null;
};

const protect = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return next(new AppError('Not authorized, no token', 401, 'UNAUTHORIZED'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return next(new AppError('Not authorized, user not found', 401, 'UNAUTHORIZED'));
    }

    return next();
  } catch (error) {
    return next(new AppError('Not authorized, token failed', 401, 'UNAUTHORIZED'));
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return next(new AppError('Admin access only', 403, 'FORBIDDEN'));
};

module.exports = { protect, admin };

