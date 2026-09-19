import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import userRoutes from './routes/userRoutes.js';
import alumniRoutes from './routes/alumniRoutes.js';
import guidanceRoutes from './routes/guidanceRoutes.js';
import careerRoutes from './routes/careerRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import evaluationRoutes from './routes/evaluationRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import placementRoutes from './routes/placementRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/guidance', guidanceRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/skills', evaluationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/department', departmentRoutes);

// ─── Health check ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🚀 GRIP Career Readiness Platform API is running!' });
});

// ─── Start Server ─────────────────────────────────────────────
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Auth routes:         POST   /api/auth/register`);
    console.log(`                        POST   /api/auth/login`);
    console.log(`🏢 Company routes:      POST   /api/companies`);
    console.log(`📅 Event routes:        POST   /api/events`);
    console.log(`                        GET    /api/events`);
    console.log(`                        GET    /api/events/:id`);
    console.log(`                        PUT    /api/events/:id`);
    console.log(`                        DELETE /api/events/:id`);
    console.log(`👤 User routes:         GET    /api/users/profile`);
    console.log(`                        PUT    /api/users/profile`);
    console.log(`                        GET    /api/users/:id`);
    console.log(`                        GET    /api/users (admin)`);
    console.log(`🎓 Alumni routes:       GET    /api/alumni`);
    console.log(`                        GET    /api/alumni/:id`);
    console.log(`                        POST   /api/alumni/profile`);
    console.log(`🧭 Guidance routes:     POST   /api/guidance/request`);
    console.log(`                        GET    /api/guidance/requests`);
    console.log(`                        GET    /api/guidance/requests/:id`);
    console.log(`                        POST   /api/guidance/:id/reply`);
    console.log(`                        PUT    /api/guidance/reply/:id`);
    console.log(`🎯 Career routes:       POST   /api/career/quiz`);
    console.log(`                        GET    /api/career/roadmap/:careerId`);
    console.log(`📝 Goal routes:         POST   /api/goals`);
    console.log(`                        PUT    /api/goals/:goalId`);
    console.log(`👥 Mentor routes:       GET    /api/mentors/recommendation`);
    console.log(`🤝 Appointment routes:  POST   /api/appointments`);
    console.log(`                        GET    /api/appointments`);
    console.log(`⭐ Skills routes:       POST   /api/skills/evaluation`);
    console.log(`💬 Feedback routes:     POST   /api/feedback`);
    console.log(`📊 Placement routes:    GET    /api/placement/readiness/:studentId`);
    console.log(`                        GET    /api/placement/company-match/:studentId`);
    console.log(`                        GET    /api/placement/leaderboard`);
    console.log(`📈 Progress routes:     GET    /api/progress/dashboard/:studentId`);
    console.log(`                        GET    /api/progress/goals/:studentId`);
    console.log(`                        GET    /api/progress/interviews/:studentId`);
    console.log(`🏫 Department routes:   GET    /api/department/analytics`);
    console.log(`                        GET    /api/department/skill-gaps`);
    console.log(`                        GET    /api/department/placement-stats\n`);
  });
};

startServer();