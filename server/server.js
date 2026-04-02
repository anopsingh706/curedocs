import './config/env.js';

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import authRoutes      from './routes/auth.js';
import fileRoutes      from './routes/files.js';
import categoryRoutes  from './routes/categories.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

// ── Connect Database ──────────────────────────────────
connectDB();

// ── CORS ──────────────────────────────────────────────
// Allow requests from Vercel frontend, localhost dev, and any other
// origin set via CLIENT_URL env var. In production always set CLIENT_URL
// to your exact Vercel URL.
const allowedOrigins = [
  process.env.CLIENT_URL,                    // e.g. https://curedocs.vercel.app
  'http://localhost:5173',                   // local dev
  'http://localhost:4173',                   // vite preview
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // In development allow everything
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight OPTIONS requests
app.options('*', cors());

// ── Middleware ────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ── Routes ────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/files',      fileRoutes);
app.use('/api/categories', categoryRoutes);

// ── Health check ──────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', project: 'CureDocs', env: process.env.NODE_ENV });
});

// ── Error Handlers ────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────
// Use Render's injected PORT — never hardcode 5000 in production
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏥 CureDocs running on port ${PORT} [${process.env.NODE_ENV}]`);
});