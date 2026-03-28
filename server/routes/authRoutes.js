const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { register, login, logout, refreshToken, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Validation error handler middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['student', 'admin', 'alumni']).withMessage('Valid role is required'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').notEmpty().withMessage('Email or USN is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getMe);

module.exports = router;
