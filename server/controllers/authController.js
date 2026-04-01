import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

// @desc  Register new user
// @route POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error('Email already registered');
  }

  const user = await User.create({ name, email, password, role: role || 'viewer' });

  res.status(201).json({
    _id:   user._id,
    name:  user.name,
    email: user.email,
    role:  user.role,
    token: generateToken(user._id),
  });
});

// @desc  Login
// @route POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    _id:   user._id,
    name:  user.name,
    email: user.email,
    role:  user.role,
    token: generateToken(user._id),
  });
});

// @desc  Get current user
// @route GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user);
});
