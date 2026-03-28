const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, usn, department, cgpa, phone, company, jobRole, salary, batchYear, linkedin, github, employeeId } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Name, email, password, and role are required');
  }

  if (!['student', 'admin', 'alumni'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    isApproved: role !== 'alumni',
  });

  if (role === 'student') {
    if (!usn || !department || !cgpa) {
      await User.findByIdAndDelete(user._id);
      res.status(400);
      throw new Error('USN, department, and CGPA are required for students');
    }
    await StudentProfile.create({
      userId: user._id,
      usn,
      department,
      cgpa: parseFloat(cgpa),
      phone,
    });
  }

  if (role === 'alumni') {
    if (!company || !jobRole || !batchYear) {
      await User.findByIdAndDelete(user._id);
      res.status(400);
      throw new Error('Company, job role, and batch year are required for alumni');
    }
    await AlumniProfile.create({
      userId: user._id,
      department,
      batchYear: parseInt(batchYear),
      company,
      jobRole,
      salary: salary ? parseFloat(salary) : undefined,
      linkedin,
      github,
      email: email,
    });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await User.findByIdAndUpdate(user._id, { refreshToken });

  setCookies(res, accessToken, refreshToken);

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      accessToken,
      refreshToken,
    },
    message: role === 'alumni'
      ? 'Registration successful. Your account is pending admin approval.'
      : 'Registration successful',
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email/USN and password are required');
  }

  let user;

  // Check if input looks like a USN (not an email)
  const isEmail = email.includes('@');

  if (isEmail) {
    user = await User.findOne({ email }).select('+password');
  } else {
    // Treat as USN — look up the student profile first
    const profile = await StudentProfile.findOne({ usn: email.toUpperCase() });
    if (profile) {
      user = await User.findById(profile.userId).select('+password');
    }
  }

  if (!user) {
    res.status(401);
    throw new Error(isEmail ? 'Invalid email or password' : 'Invalid USN or password. Make sure your data has been loaded by admin.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  if (!user.isApproved) {
    res.status(403);
    throw new Error('Your account is pending admin approval');
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await User.findByIdAndUpdate(user._id, { refreshToken });

  setCookies(res, accessToken, refreshToken);

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      accessToken,
      refreshToken,
    },
    message: 'Login successful',
  });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  }

  res.cookie('accessToken', '', { httpOnly: true, expires: new Date(0) });
  res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });

  res.json({ success: true, message: 'Logged out successfully' });
});

// POST /api/auth/refresh-token
const refreshTokenHandler = asyncHandler(async (req, res) => {
  // Prioritize body over cookies (body has role-specific token for multi-role support)
  const token = req.body?.refreshToken || req.cookies?.refreshToken;

  if (!token) {
    res.status(401);
    throw new Error('Refresh token not found');
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== token) {
    res.status(401);
    throw new Error('Invalid refresh token');
  }

  const accessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });

  setCookies(res, accessToken, newRefreshToken);

  res.json({
    success: true,
    data: { accessToken, refreshToken: newRefreshToken },
    message: 'Token refreshed',
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  let profile = null;
  if (user.role === 'student') {
    profile = await StudentProfile.findOne({ userId: user._id });
  } else if (user.role === 'alumni') {
    profile = await AlumniProfile.findOne({ userId: user._id });
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      profile,
    },
  });
});

module.exports = { register, login, logout, refreshToken: refreshTokenHandler, getMe };
