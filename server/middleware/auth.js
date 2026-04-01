import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// ── Protect: verify JWT ───────────────────────────────
export const protect = asyncHandler(async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorised — no token');
  }

  const token = auth.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id).select('-password');
  if (!req.user) {
    res.status(401);
    throw new Error('User not found');
  }
  next();
});

// ── Admin only ────────────────────────────────────────
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    res.status(403);
    throw new Error('Admin access required');
  }
  next();
};

// ── Generate JWT ──────────────────────────────────────
export const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
