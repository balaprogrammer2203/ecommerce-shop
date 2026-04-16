const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      // Basic email validation; Mongoose will still enforce required/unique.
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // Keep compatible with existing frontend usage.
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    wishlist: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      default: [],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      line1: { type: String, trim: true, maxlength: 200, default: '' },
      line2: { type: String, trim: true, maxlength: 200, default: '' },
      city: { type: String, trim: true, maxlength: 100, default: '' },
      state: { type: String, trim: true, maxlength: 100, default: '' },
      postalCode: { type: String, trim: true, maxlength: 20, default: '' },
      country: { type: String, trim: true, maxlength: 100, default: '' },
    },
    profileImageUrl: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    lastLoginAt: {
      type: Date,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    activeSessions: {
      type: [
        {
          sessionId: { type: String, required: true, trim: true },
          userAgent: { type: String, trim: true, default: '' },
          ip: { type: String, trim: true, default: '' },
          createdAt: { type: Date, default: Date.now },
          lastSeenAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    // Avoid exposing internal fields in API responses.
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // Mongoose will wait on the returned promise because this middleware is async.
});

userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;

