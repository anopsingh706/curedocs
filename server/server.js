import './config/env.js';

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import fileRoutes from './routes/files.js';
import categoryRoutes from './routes/categories.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

// ── Connect Database ──────────────────────────────────
connectDB();

// ── Middleware ────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ── Routes ────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/categories', categoryRoutes);

// ── Health check ──────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', project: 'CureDocs' }));

// ── Error Handlers ────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🏥 CureDocs server running on port ${PORT}`));