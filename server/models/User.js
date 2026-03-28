const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'alumni'],
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role !== 'alumni';
      },
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
