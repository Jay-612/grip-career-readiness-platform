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
    const { question, targetType, targetFacultyId, facultyId, mentorId } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Question is required',
      });
    }

    // Normalized targetType: 'faculty' (specific faculty advisor) or 'alumni' (broadcast to all alumni)
    const normalizedTargetType = (targetType || '').toLowerCase() === 'faculty' ? 'faculty' : 'alumni';
    let chosenFacultyId = null;

    if (normalizedTargetType === 'faculty') {
      const selectedId = targetFacultyId || facultyId || mentorId;
      if (!selectedId) {
        return res.status(400).json({
          success: false,
          message: 'Please select a specific faculty advisor for this guidance request.',
        });
      }

      if (!mongoose.Types.ObjectId.isValid(selectedId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid target faculty ID format',
        });
      }

      const facultyUser = await User.findById(selectedId);
      if (!facultyUser || (facultyUser.role !== 'faculty' && facultyUser.role !== 'admin')) {
        return res.status(404).json({
          success: false,
          message: 'The selected faculty advisor could not be found.',
        });
      }
      chosenFacultyId = facultyUser._id;
    }

    const guidanceRequest = await GuidanceRequest.create({
      studentId,
      question: question.trim(),
      targetType: normalizedTargetType,
      targetFacultyId: chosenFacultyId,
    });

    const populated = await GuidanceRequest.findById(guidanceRequest._id)
      .populate('studentId', 'name email')
      .populate('targetFacultyId', 'name email role');

    res.status(201).json({
      success: true,
      message: normalizedTargetType === 'faculty'
        ? `Guidance request sent specifically to ${populated.targetFacultyId?.name || 'the selected faculty advisor'}.`
        : 'Guidance request sent to all verified alumni mentors.',
      request: {
        id: populated._id,
        _id: populated._id,
        studentId: populated.studentId?._id || populated.studentId,
        studentName: populated.studentId?.name || 'Student Candidate',
        studentEmail: populated.studentId?.email || '',
        question: populated.question,
        targetType: populated.targetType,
        targetFacultyId: populated.targetFacultyId?._id || null,
        targetFacultyName: populated.targetFacultyId?.name || null,
        targetFacultyEmail: populated.targetFacultyId?.email || null,
        date: populated.date,
        createdAt: populated.createdAt || populated.date,
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
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    const userRole = (req.user.role || '').toLowerCase();
    const currentUserId = (req.user.id || req.user.userId || '').toString();

    if (userRole === 'student') {
      // Students can only see their own requests
      filter.studentId = currentUserId;
    } else if (userRole === 'faculty') {
      // Approach 1: Faculty member sees requests sent specifically to THEM (or legacy 'all')
      filter.$or = [
        { targetType: 'faculty', targetFacultyId: currentUserId },
        { targetType: 'all' },
        { targetType: { $exists: false } },
        { targetType: null },
      ];
    } else if (userRole === 'alumni') {
      // Approach 2: Alumni member sees requests sent to ALL alumni (or legacy 'all')
      filter.$or = [
        { targetType: 'alumni' },
        { targetType: 'all' },
        { targetType: { $exists: false } },
        { targetType: null },
      ];
    }
    // Admin sees all requests

    const [requests, totalItems] = await Promise.all([
      GuidanceRequest.find(filter)
        .populate('studentId', 'name email')
        .populate('targetFacultyId', 'name email role')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      GuidanceRequest.countDocuments(filter),
    ]);

    const requestIds = requests.map((r) => r._id);
    const replies = await GuidanceReply.find({ requestId: { $in: requestIds } })
      .populate('mentorId', 'name email role')
      .sort({ _id: -1 });

    const replyMap = new Map();
    replies.forEach((rep) => {
      const rId = rep.requestId.toString();
      if (!replyMap.has(rId)) {
        replyMap.set(rId, []);
      }
      replyMap.get(rId).push(rep);
    });

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      success: true,
      count: requests.length,
      page,
      totalPages,
      totalItems,
      requests: requests.map((r) => {
        const reps = replyMap.get(r._id.toString()) || [];
        return {
          id: r._id,
          _id: r._id,
          studentId: r.studentId?._id || null,
          studentName: r.studentId?.name || 'Student Candidate',
          studentEmail: r.studentId?.email || '',
          targetType: r.targetType || 'all',
          targetFacultyId: r.targetFacultyId?._id || null,
          targetFacultyName: r.targetFacultyId?.name || null,
          targetFacultyEmail: r.targetFacultyId?.email || null,
          question: r.question,
          date: r.date,
          createdAt: r.createdAt || r.date,
          replyCount: reps.length,
          status: reps.length > 0 ? 'replied' : 'pending',
          latestReply: reps[0]
            ? {
                id: reps[0]._id,
                _id: reps[0]._id,
                mentorName: reps[0].mentorId?.name || 'Faculty Mentor',
                answerText: reps[0].answerText,
              }
            : null,
        };
      }),
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
      .populate('studentId', 'name email')
      .populate('targetFacultyId', 'name email role');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Guidance request not found',
      });
    }

    const currentUserId = (req.user.id || req.user.userId || '').toString();
    const userRole = (req.user.role || '').toLowerCase();

    // Students can only view their own requests
    const studentOwnerId = (
      request.studentId?._id ||
      request.studentId ||
      ''
    ).toString();

    if (userRole === 'student' && studentOwnerId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own requests.',
      });
    }

    // Role-based visibility check
    if (userRole === 'faculty') {
      const isTargetedFaculty =
        request.targetFacultyId &&
        (request.targetFacultyId._id || request.targetFacultyId).toString() === currentUserId;
      const isLegacyOrAll = !request.targetType || request.targetType === 'all';

      if (!isTargetedFaculty && !isLegacyOrAll) {
        return res.status(403).json({
          success: false,
          message:
            request.targetType === 'alumni'
              ? 'Access denied. This inquiry was routed exclusively to alumni mentors.'
              : 'Access denied. This inquiry was routed specifically to another faculty advisor.',
        });
      }
    } else if (userRole === 'alumni') {
      const isAlumniTargeted =
        request.targetType === 'alumni' ||
        request.targetType === 'all' ||
        !request.targetType;

      if (!isAlumniTargeted) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. This inquiry was routed specifically to a faculty advisor.',
        });
      }
    }

    // Fetch replies for this request
    const replies = await GuidanceReply.find({ requestId: id })
      .populate('mentorId', 'name email role')
      .sort({ _id: 1 });

    res.status(200).json({
      success: true,
      request: {
        id: request._id,
        _id: request._id,
        studentId: request.studentId?._id || request.studentId,
        studentName: request.studentId?.name || 'Student Candidate',
        studentEmail: request.studentId?.email || '',
        targetType: request.targetType || 'all',
        targetFacultyId: request.targetFacultyId?._id || null,
        targetFacultyName: request.targetFacultyId?.name || null,
        targetFacultyEmail: request.targetFacultyId?.email || null,
        question: request.question,
        date: request.date,
        createdAt: request.createdAt,
      },
      replies: replies.map((reply) => ({
        id: reply._id,
        _id: reply._id,
        mentorId: reply.mentorId?._id || reply.mentorId,
        mentorName: reply.mentorId?.name || 'Mentor',
        mentorEmail: reply.mentorId?.email || '',
        mentorRole: reply.mentorId?.role || 'mentor',
        answerText: reply.answerText,
        date: reply.createdAt,
        createdAt: reply.createdAt,
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Guidance Request ID format',
      });
    }

    const rawAnswer =
      req.body?.answerText ||
      req.body?.reply ||
      req.body?.text ||
      req.body?.answer;

    if (!rawAnswer || !rawAnswer.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: 'answerText is required',
      });
    }
    const answerText = rawAnswer.toString().trim();

    const request = await GuidanceRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Guidance request not found',
      });
    }

    // RBAC: Check reply permissions
    const studentOwnerId = (
      request.studentId?._id ||
      request.studentId ||
      ''
    ).toString();

    const isOriginalAuthor =
      userRole === 'student' &&
      studentOwnerId &&
      studentOwnerId === (mentorId || '').toString();

    let canReply = false;
    if (userRole === 'admin') {
      canReply = true;
    } else if (isOriginalAuthor) {
      canReply = true;
    } else if (userRole === 'faculty') {
      const isTargetedFaculty =
        request.targetFacultyId &&
        (request.targetFacultyId._id || request.targetFacultyId).toString() === (mentorId || '').toString();
      const isLegacyOrAll = !request.targetType || request.targetType === 'all';
      canReply = isTargetedFaculty || isLegacyOrAll;
    } else if (userRole === 'alumni') {
      const isAlumniTargeted =
        request.targetType === 'alumni' ||
        request.targetType === 'all' ||
        !request.targetType;
      canReply = isAlumniTargeted;
    }

    if (!canReply) {
      return res.status(403).json({
        success: false,
        message:
          userRole === 'faculty'
            ? 'Access denied. You can only reply to guidance inquiries routed to you.'
            : userRole === 'alumni'
            ? 'Access denied. You can only reply to inquiries routed to the alumni network.'
            : 'Access denied. You can only reply to your own guidance inquiries.',
      });
    }

    const createdReply = await GuidanceReply.create({
      requestId: id,
      mentorId,
      answerText,
    });

    const populated = await GuidanceReply.findById(createdReply._id)
      .populate('mentorId', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Reply sent successfully',
      reply: {
        id: populated._id,
        _id: populated._id,
        requestId: populated.requestId,
        mentorId: populated.mentorId?._id || mentorId,
        mentorName: populated.mentorId?.name || req.user.name || 'Mentor',
        mentorEmail: populated.mentorId?.email || req.user.email || '',
        mentorRole: populated.mentorId?.role || req.user.role || 'mentor',
        answerText: populated.answerText,
        date: populated.createdAt,
        createdAt: populated.createdAt,
      },
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
    let [facultyProfiles, alumniProfiles, facultyUsers] = await Promise.all([
      FacultyProfile.find().populate('facultyId', 'name email role'),
      AlumniProfile.find().populate('alumniId', 'name email role'),
      User.find({ role: 'faculty' }).select('name email role'),
    ]);

    // If zero faculty exist anywhere in DB, seed default verified faculty evaluators
    if (facultyProfiles.length === 0 && facultyUsers.length === 0) {
      try {
        const defaultFaculty1 = await User.create({
          name: 'Prof. Neha Sharma',
          email: 'neha.sharma@campus.edu',
          password: '$2a$10$YourHashedPasswordHereOrTest123',
          role: 'faculty',
        });
        await FacultyProfile.create({
          facultyId: defaultFaculty1._id,
          employeeId: 'FAC-CSE-004',
          department: 'Computer Science & Engineering',
        });

        const defaultFaculty2 = await User.create({
          name: 'Dr. Rajesh Rao',
          email: 'rajesh.rao@campus.edu',
          password: '$2a$10$YourHashedPasswordHereOrTest123',
          role: 'faculty',
        });
        await FacultyProfile.create({
          facultyId: defaultFaculty2._id,
          employeeId: 'FAC-CSE-012',
          department: 'Distributed Systems & Cloud Computing',
        });

        facultyUsers = [defaultFaculty1, defaultFaculty2];
      } catch (seedErr) {
        console.error('Error auto-seeding default faculty:', seedErr);
      }
    }

    const facultyMap = new Map();

    // Add from faculty profiles first (includes department)
    facultyProfiles.forEach((f) => {
      if (f.facultyId && f.facultyId.name) {
        facultyMap.set(f.facultyId._id.toString(), {
          id: f.facultyId._id,
          name: f.facultyId.name,
          role: 'Faculty',
          careerTag: f.department || 'Computer Science & Engineering',
        });
      }
    });

    // Also add from User collection if role is faculty
    facultyUsers.forEach((u) => {
      const uId = u._id.toString();
      if (!facultyMap.has(uId)) {
        facultyMap.set(uId, {
          id: u._id,
          name: u.name,
          role: 'Faculty',
          careerTag: 'Department of Computer Science & Engineering',
        });
      }
    });

    const facultyMentors = Array.from(facultyMap.values());

    const alumniMentors = alumniProfiles
      .filter((a) => a.alumniId && a.alumniId.name)
      .map((a) => ({
        id: a.alumniId._id,
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
    const rawAnswer =
      req.body?.answerText ||
      req.body?.reply ||
      req.body?.text ||
      req.body?.answer;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Reply ID format',
      });
    }

    if (!rawAnswer || !rawAnswer.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: 'answerText is required',
      });
    }
    const answerText = rawAnswer.toString().trim();

    const reply = await GuidanceReply.findById(id);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Guidance reply not found',
      });
    }

    const currentUserId = (req.user.id || req.user.userId || '').toString();
    const userRole = (req.user.role || '').toLowerCase();
    const authorId = reply.mentorId ? reply.mentorId.toString() : '';

    // Only the author or an admin can update
    if (authorId !== currentUserId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the author or an admin can update this reply.',
      });
    }

    reply.answerText = answerText;
    await reply.save();

    const populated = await GuidanceReply.findById(reply._id)
      .populate('mentorId', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Reply updated successfully',
      reply: {
        id: populated._id,
        _id: populated._id,
        requestId: populated.requestId,
        mentorId: populated.mentorId?._id || reply.mentorId,
        mentorName: populated.mentorId?.name || '',
        mentorEmail: populated.mentorId?.email || '',
        mentorRole: populated.mentorId?.role || '',
        answerText: populated.answerText,
        date: populated.createdAt,
        createdAt: populated.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while updating reply',
      error: error.message,
    });
  }
};
