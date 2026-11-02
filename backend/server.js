import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { connectDatabase } from './config/db.js';
import { uploadDirectory } from './config/storage.js';
import authRoutes from './routes/auth.routes.js';
import subjectRoutes from './routes/subject.routes.js';
import materialRoutes from './routes/material.routes.js';
import commentRoutes from './routes/comment.routes.js';
import adminRoutes from './routes/admin.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import profileRoutes from './routes/profile.routes.js';
import metaRoutes from './routes/meta.routes.js';
import directoryRoutes from './routes/directory.routes.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

const app = express();
const origins = (process.env.CLIENT_URL || 'http://localhost').split(',').map((item) => item.trim());
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin(origin, callback) { if (!origin || origins.includes(origin)) return callback(null, true); callback(new Error('Origin is not allowed by CORS.')); }, credentials: true }));
app.use(express.json({ limit: '1mb' })); app.use(express.urlencoded({ extended: true, limit: '1mb' })); app.use(cookieParser());
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-8', legacyHeaders: false }));
app.use('/uploads', express.static(uploadDirectory, { maxAge: '1h' }));
app.get('/api/health', (req, res) => res.json({ success: true, data: { status: 'ok', uptime: process.uptime(), dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' } }));
app.use('/api/auth', authRoutes);
app.use('/api', directoryRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', profileRoutes);
app.use('/api/meta', metaRoutes);
app.use(notFoundHandler); app.use(errorHandler);

const port = Number(process.env.PORT || 5000);
try {
  await connectDatabase();
  const server = app.listen(port, 'localhost', () => console.info(`UniRank API listening at http://localhost:${port}`));
  const shutdown = (signal) => { console.info(`${signal} received. Shutting down...`); server.close(async () => { await mongoose.connection.close(); process.exit(0); }); };
  process.on('SIGINT', () => shutdown('SIGINT')); process.on('SIGTERM', () => shutdown('SIGTERM'));
} catch (error) { console.error('Unable to start UniRank API:', error.message); process.exit(1); }
