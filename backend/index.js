import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });

import express from 'express';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import userRoutes from './routes/userRoutes.js';
import alumniRoutes from './routes/alumniRoutes.js';
import guidanceRoutes from './routes/guidanceRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────
app.use(express.json());


// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/guidance', guidanceRoutes);

// ─── Health check ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🚀 GRIP Career Readiness Platform API is running!' });
});

// ─── Start Server ─────────────────────────────────────────────
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Auth routes:     POST   /api/auth/register`);
    console.log(`                    POST   /api/auth/login`);
    console.log(`🏢 Company routes:  POST   /api/companies`);
    console.log(`📅 Event routes:    POST   /api/events`);
    console.log(`                    GET    /api/events`);
    console.log(`                    GET    /api/events/:id`);
    console.log(`                    PUT    /api/events/:id`);
    console.log(`                    DELETE /api/events/:id`);
    console.log(`👤 User routes:     GET    /api/users/profile`);
    console.log(`                    PUT    /api/users/profile`);
    console.log(`                    GET    /api/users/:id`);
    console.log(`                    GET    /api/users (admin)`);
    console.log(`🎓 Alumni routes:   GET    /api/alumni`);
    console.log(`                    GET    /api/alumni/:id`);
    console.log(`                    POST   /api/alumni/profile`);
    console.log(`🧭 Guidance routes: POST   /api/guidance/request`);
    console.log(`                    GET    /api/guidance/requests`);
    console.log(`                    GET    /api/guidance/requests/:id`);
    console.log(`                    POST   /api/guidance/requests/:id/reply`);
    console.log(`                    PUT    /api/guidance/reply/:id\n`);
  });
};

startServer();