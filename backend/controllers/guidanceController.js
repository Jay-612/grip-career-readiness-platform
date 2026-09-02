import mongoose from 'mongoose';
import GuidanceRequest from '../model/GuidanceRequest.js';
import GuidanceReply from '../model/GuidanceReply.js';
import User from '../model/User.js';
import FacultyProfile from '../model/FacultyProfile.js';
import AlumniProfile from '../model/AlumniProfile.js';

// ─── Create Guidance Request (Student Only) ───────────────────────
export const createGuidanceRequest = async (req, res) => {
  try {
    const studentId = req.user.id || req.user.userId;
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Question is required',
      });
    }

    const guidanceRequest = await GuidanceRequest.create({
      studentId,
      question: question.trim(),
    });

    const populated = await GuidanceRequest.findById(guidanceRequest._id)
      .populate('studentId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Guidance request created successfully',
      request: {
        id: populated._id,
        studentId: populated.studentId._id,
        studentName: populated.studentId.name,
        studentEmail: populated.studentId.email,
        question: populated.question,
        date: populated.date,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating guidance request',
      error: error.message,
    });
  }
};

// ─── Get Guidance Requests (Role-Based Filtering) ─────────────────
export const getGuidanceRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // Students can only see their own requests
    if (req.user.role === 'student') {
      filter.studentId = req.user.id || req.user.userId;
    }

    const [requests, totalItems] = await Promise.all([
      GuidanceRequest.find(filter)
        .populate('studentId', 'name email')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      GuidanceRequest.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      success: true,
      count: requests.length,
      page,
      totalPages,
      totalItems,
      requests: requests.map((r) => ({
        id: r._id,
        studentId: r.studentId._id,
        studentName: r.studentId.name,
        studentEmail: r.studentId.email,
        question: r.question,
        date: r.date,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching guidance requests',
      error: error.message,
    });
  }
};

// ─── Get Guidance Request by ID (with Replies) ────────────────────
export const getGuidanceRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Guidance Request ID format',
      });
    }

    const request = await GuidanceRequest.findById(id)
      .populate('studentId', 'name email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Guidance request not found',
      });
    }

    const currentUserId = (req.user.id || req.user.userId || '').toString();

    // Students can only view their own requests
    if (
      req.user.role === 'student' &&
      request.studentId._id.toString() !== currentUserId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own requests.',
      });
    }

    // Fetch replies for this request
    const replies = await GuidanceReply.find({ requestId: id })
      .populate('mentorId', 'name email role')
      .sort({ _id: 1 });

    res.status(200).json({
      success: true,
      request: {
        id: request._id,
        studentId: request.studentId._id,
        studentName: request.studentId.name,
        studentEmail: request.studentId.email,
        question: request.question,
        date: request.date,
      },
      replies: replies.map((reply) => ({
        id: reply._id,
        mentorId: reply.mentorId._id,
        mentorName: reply.mentorId.name,
        mentorEmail: reply.mentorId.email,
        mentorRole: reply.mentorId.role,
        answerText: reply.answerText,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching guidance request',
      error: error.message,
    });
  }
};

// ─── POST /api/guidance/:id/reply — Reply to Guidance Request ──────
export const replyGuidanceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const mentorId = req.user.id || req.user.userId;
    const userRole = (req.user.role || '').toLowerCase();

    // Restricted strictly to Faculty, Alumni, or Admin
    if (userRole !== 'faculty' && userRole !== 'alumni' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Faculty or Alumni can reply to guidance requests.',
      });
    }

    const answerText = req.body.reply || req.body.answerText;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Guidance Request ID format',
      });
    }

    if (!answerText || !answerText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'reply text is required',
      });
    }

    const request = await GuidanceRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Guidance request not found',
      });
    }

    await GuidanceReply.create({
      requestId: id,
      mentorId,
      answerText: answerText.trim(),
    });

    return res.status(201).json({
      message: 'Reply sent successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while posting reply',
      error: error.message,
    });
  }
};

// Alias for existing route compatibility
export const replyToGuidanceRequest = replyGuidanceRequest;

// ─── GET /api/mentors/recommendation — Get Mentor Recommendations ─
export const getMentorRecommendations = async (req, res) => {
  try {
    const [facultyProfiles, alumniProfiles] = await Promise.all([
      FacultyProfile.find().populate('facultyId', 'name email role'),
      AlumniProfile.find().populate('alumniId', 'name email role'),
    ]);

    const facultyMentors = facultyProfiles
      .filter((f) => f.facultyId && f.facultyId.name)
      .map((f) => ({
        name: f.facultyId.name,
        role: 'Faculty',
        careerTag: f.department || 'Faculty',
      }));

    const alumniMentors = alumniProfiles
      .filter((a) => a.alumniId && a.alumniId.name)
      .map((a) => ({
        name: a.alumniId.name,
        role: 'Alumni',
        careerTag: a.jobRole || a.currentCompany || 'Alumni',
      }));

    const recommendations = [...facultyMentors, ...alumniMentors];

    return res.status(200).json(recommendations);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching mentor recommendations',
      error: error.message,
    });
  }
};

// ─── Update Guidance Reply (Author or Admin) ──────────────────────
export const updateGuidanceReply = async (req, res) => {
  try {
    const { id } = req.params;
    const answerText = req.body.answerText || req.body.reply;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Reply ID format',
      });
    }

    if (!answerText || !answerText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'answerText is required',
      });
    }

    const reply = await GuidanceReply.findById(id);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Guidance reply not found',
      });
    }

    const currentUserId = (req.user.id || req.user.userId || '').toString();

    // Only the author or an admin can update
    if (
      reply.mentorId.toString() !== currentUserId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the author or an admin can update this reply.',
      });
    }

    reply.answerText = answerText.trim();
    await reply.save();

    const populated = await GuidanceReply.findById(reply._id)
      .populate('mentorId', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Reply updated successfully',
      reply: {
        id: populated._id,
        requestId: populated.requestId,
        mentorId: populated.mentorId._id,
        mentorName: populated.mentorId.name,
        mentorEmail: populated.mentorId.email,
        mentorRole: populated.mentorId.role,
        answerText: populated.answerText,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating reply',
      error: error.message,
    });
  }
};
