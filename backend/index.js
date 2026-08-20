import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });

import express from 'express';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import companyRoutes from './routes/companyRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────
app.use(express.json());


// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);

// ─── Health check ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🚀 GRIP Career Readiness Platform API is running!' });
});

// ─── Start Server ─────────────────────────────────────────────
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Auth routes:  POST /api/auth/register`);
    console.log(`                 POST /api/auth/login\n`);
  });
};

startServer();