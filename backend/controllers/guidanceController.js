import mongoose from 'mongoose';
import GuidanceRequest from '../model/GuidanceRequest.js';
import GuidanceReply from '../model/GuidanceReply.js';
import User from '../model/User.js';
import Notification from '../model/Notification.js';
import FacultyProfile from '../model/FacultyProfile.js';
import AlumniProfile from '../model/AlumniProfile.js';

// ─── Create Guidance Request (Student Only) ───────────────────────
// ─── Create Guidance Request (Student Only) ───────────────────────
export const createGuidanceRequest = async (req, res) => {
  try {
    const studentId = req.user.id || req.user.userId;
    const studentName = req.user.name || 'Student Candidate';
    const {
      question,
      targetType,
      recipientType,
      targetFacultyId,
      targetAlumniId,
      recipientId,
      facultyId,
      mentorId,
      topic,
    } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Question is required',
      });
    }

    // Extract topic if encoded as [Topic] in question prefix or explicit body field
    let resolvedTopic = topic?.trim() || 'General Guidance';
    let cleanQuestion = question.trim();
    const topicMatch = cleanQuestion.match(/^\[(.*?)\]\s*([\s\S]*)$/);
    if (topicMatch) {
      if (!topic || topic.trim() === 'General Guidance') {
        resolvedTopic = topicMatch[1].trim();
      }
    }

    // Normalized targetType: 'faculty' or 'alumni'
    const requestedType = (recipientType || targetType || '').toLowerCase();
    const normalizedTargetType = requestedType === 'alumni' ? 'alumni' : 'faculty';
    let chosenFacultyId = null;
    let chosenAlumniId = null;

    if (normalizedTargetType === 'faculty') {
      const selectedId = targetFacultyId || recipientId || facultyId || mentorId;
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
        return res.status(400).json({
          success: false,
          message: 'The selected user is not a faculty member.',
        });
      }
      chosenFacultyId = facultyUser._id;
    } else {
      // Alumni guidance: target specific alumni mentor
      const selectedId = targetAlumniId || recipientId || mentorId;
      if (!selectedId) {
        return res.status(400).json({
          success: false,
          message: 'Please select a specific alumni mentor for this guidance request.',
        });
      }

      if (!mongoose.Types.ObjectId.isValid(selectedId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid target alumni mentor ID format',
        });
      }

      const alumniUser = await User.findById(selectedId);
      if (!alumniUser || alumniUser.role !== 'alumni') {
        return res.status(400).json({
          success: false,
          message: 'The selected user is not an alumni mentor.',
        });
      }
      chosenAlumniId = alumniUser._id;
    }

    const guidanceRequest = await GuidanceRequest.create({
      studentId,
      question: cleanQuestion,
      topic: resolvedTopic,
      status: 'pending',
      targetType: normalizedTargetType,
      targetFacultyId: chosenFacultyId,
      targetAlumniId: chosenAlumniId,
    });

    const populated = await GuidanceRequest.findById(guidanceRequest._id)
      .populate('studentId', 'name email')
      .populate('targetFacultyId', 'name email role')
      .populate('targetAlumniId', 'name email role');

    // Send in-app notification to the chosen recipient
    try {
      if (normalizedTargetType === 'faculty' && chosenFacultyId) {
        await Notification.create({
          userId: chosenFacultyId,
          type: 'guidance_reply',
          title: 'New Guidance Request',
          message: `${studentName} asked you for ${resolvedTopic}.`,
          actionPath: '/faculty/guidance',
        });
      } else if (normalizedTargetType === 'alumni' && chosenAlumniId) {
        await Notification.create({
          userId: chosenAlumniId,
          type: 'guidance_reply',
          title: 'New Guidance Request',
          message: `${studentName} asked you for ${resolvedTopic} guidance.`,
          actionPath: '/alumni/mentorship',
        });
      }
    } catch (notifErr) {
      console.warn('Guidance notification creation failed:', notifErr.message);
    }

    const recipientName =
      normalizedTargetType === 'faculty'
        ? populated.targetFacultyId?.name || 'the selected faculty advisor'
        : populated.targetAlumniId?.name || 'the selected alumni mentor';

    res.status(201).json({
      success: true,
      message: `Guidance request sent to ${recipientName}.`,
      request: {
        id: populated._id,
        _id: populated._id,
        studentId: populated.studentId?._id || populated.studentId,
        studentName: populated.studentId?.name || 'Student Candidate',
        studentEmail: populated.studentId?.email || '',
        question: populated.question,
        topic: populated.topic || resolvedTopic,
        status: populated.status || 'pending',
        targetType: populated.targetType,
        recipientType: populated.targetType,
        targetFacultyId: populated.targetFacultyId?._id || null,
        targetFacultyName: populated.targetFacultyId?.name || null,
        targetFacultyEmail: populated.targetFacultyId?.email || null,
        targetAlumniId: populated.targetAlumniId?._id || null,
        targetAlumniName: populated.targetAlumniId?.name || null,
        targetAlumniEmail: populated.targetAlumniId?.email || null,
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
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    const userRole = (req.user.role || '').toLowerCase();
    const currentUserId = (req.user.id || req.user.userId || '').toString();

    if (userRole === 'student') {
      // Students can only see their own requests
      filter.studentId = currentUserId;
      const typeFilter = req.query.targetType || req.query.recipientType;
      if (typeFilter && typeFilter !== 'all') {
        filter.targetType = typeFilter;
      }
      if (req.query.status && req.query.status !== 'all') {
        filter.status = req.query.status;
      }
    } else if (userRole === 'faculty') {
      // Faculty member sees requests sent specifically to THEM or general 'all'
      filter.$or = [
        { targetType: 'faculty', targetFacultyId: currentUserId },
        { targetType: 'all' },
      ];
      if (req.query.status && req.query.status !== 'all') {
        filter.status = req.query.status;
      }
    } else if (userRole === 'alumni') {
      // Alumni member sees requests sent specifically to THEM or broadcast 'all'
      filter.$or = [
        { targetType: 'alumni', targetAlumniId: currentUserId },
        { targetType: 'alumni', targetAlumniId: null },
        { targetType: 'all' },
        { targetType: { $exists: false } },
      ];
      if (req.query.status && req.query.status !== 'all') {
        filter.status = req.query.status;
      }
    }
    // Admin sees all requests

    const [requests, totalItems] = await Promise.all([
      GuidanceRequest.find(filter)
        .populate('studentId', 'name email')
        .populate('targetFacultyId', 'name email role')
        .populate('targetAlumniId', 'name email role')
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
        const isResolved = r.status === 'resolved';
        const isFaculty = r.targetType === 'faculty';
        const recipientName = isFaculty
          ? r.targetFacultyId?.name || 'Faculty Advisor'
          : r.targetAlumniId?.name || 'Alumni Mentor';
        const recipientRole = isFaculty ? 'faculty' : 'alumni';

        return {
          id: r._id,
          _id: r._id,
          studentId: r.studentId?._id || null,
          studentName: r.studentId?.name || 'Student Candidate',
          studentEmail: r.studentId?.email || '',
          targetType: r.targetType || 'faculty',
          recipientType: r.targetType || 'faculty',
          recipientName,
          recipientRole,
          targetFacultyId: r.targetFacultyId?._id || null,
          targetFacultyName: r.targetFacultyId?.name || null,
          targetFacultyEmail: r.targetFacultyId?.email || null,
          targetAlumniId: r.targetAlumniId?._id || null,
          targetAlumniName: r.targetAlumniId?.name || null,
          targetAlumniEmail: r.targetAlumniId?.email || null,
          topic: r.topic || 'General Guidance',
          question: r.question,
          date: r.date,
          createdAt: r.createdAt || r.date,
          replyCount: reps.length,
          status: isResolved ? 'resolved' : reps.length > 0 ? 'replied' : 'pending',
          latestReply: reps[0]
            ? {
                id: reps[0]._id,
                _id: reps[0]._id,
                mentorName: reps[0].mentorId?.name || recipientName,
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
      .populate('targetFacultyId', 'name email role')
      .populate('targetAlumniId', 'name email role');

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

    // Role-based visibility check for Faculty & Alumni
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
      const isTargetedAlumni =
        request.targetAlumniId &&
        (request.targetAlumniId._id || request.targetAlumniId).toString() === currentUserId;
      const isLegacyOrAll = !request.targetType || request.targetType === 'all';

      if (!isTargetedAlumni && !isLegacyOrAll) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view guidance inquiries addressed to you.',
        });
      }
    }

    // Fetch replies for this request
    const replies = await GuidanceReply.find({ requestId: id })
      .populate('mentorId', 'name email role')
      .sort({ _id: 1 });

    const isFaculty = request.targetType === 'faculty';
    const recipientName = isFaculty
      ? request.targetFacultyId?.name || 'Faculty Advisor'
      : request.targetAlumniId?.name || 'Alumni Mentor';

    res.status(200).json({
      success: true,
      request: {
        id: request._id,
        _id: request._id,
        studentId: request.studentId?._id || request.studentId,
        studentName: request.studentId?.name || 'Student Candidate',
        studentEmail: request.studentId?.email || '',
        targetType: request.targetType || 'faculty',
        recipientType: request.targetType || 'faculty',
        recipientName,
        targetFacultyId: request.targetFacultyId?._id || null,
        targetFacultyName: request.targetFacultyId?.name || null,
        targetFacultyEmail: request.targetFacultyId?.email || null,
        targetAlumniId: request.targetAlumniId?._id || null,
        targetAlumniName: request.targetAlumniId?.name || null,
        targetAlumniEmail: request.targetAlumniId?.email || null,
        topic: request.topic || 'General Guidance',
        status: request.status || (replies.length > 0 ? 'replied' : 'pending'),
        question: request.question,
        date: request.date,
        createdAt: request.createdAt,
        resolvedAt: request.resolvedAt,
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

    const request = await GuidanceRequest.findById(id)
      .populate('studentId', 'name email')
      .populate('targetFacultyId', 'name email role')
      .populate('targetAlumniId', 'name email role');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Guidance request not found',
      });
    }

    // Check if resolved - disable new replies if resolved
    if (request.status === 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'This guidance request has been marked as resolved. Further replies are disabled.',
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
      const isTargetedAlumni =
        request.targetAlumniId &&
        (request.targetAlumniId._id || request.targetAlumniId).toString() === (mentorId || '').toString();
      const isLegacyOrAll = !request.targetType || request.targetType === 'all';
      canReply = isTargetedAlumni || isLegacyOrAll;
    }

    if (!canReply) {
      return res.status(403).json({
        success: false,
        message:
          userRole === 'faculty'
            ? 'Access denied. You can only reply to guidance inquiries routed to you.'
            : userRole === 'alumni'
            ? 'Access denied. You can only reply to guidance inquiries routed to you.'
            : 'Access denied. You can only reply to your own guidance inquiries.',
      });
    }

    const createdReply = await GuidanceReply.create({
      requestId: id,
      mentorId,
      answerText,
    });

    // If request was pending, transition to 'replied'
    if (request.status === 'pending' || !request.status) {
      request.status = 'replied';
      await request.save();
    }

    const populated = await GuidanceReply.findById(createdReply._id)
      .populate('mentorId', 'name email role');

    // Notify the other participant
    try {
      const replierName = req.user.name || 'Mentor';
      if (isOriginalAuthor) {
        // Student followed up -> notify assigned faculty or alumni
        const recipientUserId =
          request.targetType === 'faculty'
            ? (request.targetFacultyId?._id || request.targetFacultyId)
            : (request.targetAlumniId?._id || request.targetAlumniId);

        if (recipientUserId) {
          const actionPath =
            request.targetType === 'faculty'
              ? '/faculty/guidance'
              : '/alumni/mentorship';

          await Notification.create({
            userId: recipientUserId,
            type: 'guidance_reply',
            title: 'New Student Follow-Up',
            message: `${replierName} posted a follow-up on: "${request.topic}".`,
            actionPath,
          });
        }
      } else {
        // Faculty or Alumni replied -> notify student
        if (studentOwnerId) {
          await Notification.create({
            userId: studentOwnerId,
            type: 'guidance_reply',
            title: 'Guidance Reply Received',
            message: `${replierName} replied to your guidance request: "${request.topic}".`,
            actionPath: '/student/guidance',
          });
        }
      }
    } catch (notifErr) {
      console.error('Error creating guidance reply notification:', notifErr.message);
    }

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

// ─── GET /api/guidance/mentors/faculty — Dynamic Faculty List ─────
export const getFacultyMentors = async (req, res) => {
  try {
    const [facultyUsers, facultyProfiles] = await Promise.all([
      User.find({ role: 'faculty' }).select('name email role department').lean(),
      FacultyProfile.find().populate('facultyId', 'name email role department').lean(),
    ]);

    const profileMap = new Map();
    facultyProfiles.forEach((fp) => {
      const uId = (fp.facultyId?._id || fp.facultyId || '').toString();
      if (uId) {
        profileMap.set(uId, fp);
      }
    });

    const list = facultyUsers.map((u) => {
      const uId = u._id.toString();
      const fp = profileMap.get(uId) || {};
      return {
        id: u._id,
        _id: u._id,
        name: u.name,
        email: u.email,
        role: 'faculty',
        department: fp.department || u.department || 'Computer Science & Engineering',
        designation: fp.designation || 'Faculty Member',
      };
    });

    return res.status(200).json({
      success: true,
      faculty: list,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching faculty mentors',
      error: error.message,
    });
  }
};

// ─── GET /api/guidance/mentors/alumni — Dynamic Alumni List ───────
export const getAlumniMentors = async (req, res) => {
  try {
    const [alumniUsers, alumniProfiles] = await Promise.all([
      User.find({ role: 'alumni' }).select('name email role').lean(),
      AlumniProfile.find().populate('alumniId', 'name email role').lean(),
    ]);

    const profileMap = new Map();
    alumniProfiles.forEach((ap) => {
      const uId = (ap.alumniId?._id || ap.alumniId || '').toString();
      if (uId) {
        profileMap.set(uId, ap);
      }
    });

    const list = alumniUsers.map((u) => {
      const uId = u._id.toString();
      const ap = profileMap.get(uId) || {};
      return {
        id: u._id,
        _id: u._id,
        name: u.name,
        email: u.email,
        role: 'alumni',
        graduationYear: ap.graduationYear || null,
        currentCompany: ap.currentCompany || ap.company || 'Tech Industry',
        currentRole: ap.currentRole || ap.jobRole || 'Industry Professional',
        department: ap.department || 'Computer Science & Engineering',
      };
    });

    return res.status(200).json({
      success: true,
      alumni: list,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching alumni mentors',
      error: error.message,
    });
  }
};

// ─── GET /api/mentors/recommendation — Get Mentor Recommendations ─
export const getMentorRecommendations = async (req, res) => {
  try {
    const [facultyProfiles, alumniProfiles, facultyUsers] = await Promise.all([
      FacultyProfile.find().populate('facultyId', 'name email role'),
      AlumniProfile.find().populate('alumniId', 'name email role'),
      User.find({ role: 'faculty' }).select('name email role'),
    ]);

    const facultyMap = new Map();

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

// ─── Mark Guidance Request as Resolved ────────────────────────────
export const resolveGuidanceRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Guidance Request ID format',
      });
    }

    const request = await GuidanceRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Guidance request not found',
      });
    }

    const currentUserId = (req.user.id || req.user.userId || '').toString();
    const userRole = (req.user.role || '').toLowerCase();
    const studentOwnerId = (request.studentId?._id || request.studentId || '').toString();
    const targetFacultyId = (request.targetFacultyId?._id || request.targetFacultyId || '').toString();
    const targetAlumniId = (request.targetAlumniId?._id || request.targetAlumniId || '').toString();

    // Student author, target faculty advisor, target alumni mentor, or admin can resolve
    const canResolve =
      userRole === 'admin' ||
      (userRole === 'student' && studentOwnerId === currentUserId) ||
      (userRole === 'faculty' && targetFacultyId === currentUserId) ||
      (userRole === 'alumni' && targetAlumniId === currentUserId);

    if (!canResolve) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the inquiry student, assigned faculty/alumni, or admin can resolve this request.',
      });
    }

    request.status = 'resolved';
    request.resolvedAt = new Date();
    request.resolvedBy = req.user.id || req.user.userId;
    await request.save();

    return res.status(200).json({
      success: true,
      message: 'Guidance inquiry marked as resolved',
      request: {
        id: request._id,
        _id: request._id,
        status: request.status,
        resolvedAt: request.resolvedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while resolving guidance request',
      error: error.message,
    });
  }
};
