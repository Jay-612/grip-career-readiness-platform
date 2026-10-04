import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Notification from '../model/Notification.js';
import { runEventReminderScan } from '../services/eventReminderService.js';

const router = express.Router();

// Enforce authentication on all notification routes
router.use(protect);

// ─── GET /api/notifications — Get authenticated user's notifications ─────────
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('eventId', 'title date time venue eventType status'),
      Notification.countDocuments({ userId, read: false }),
    ]);

    res.status(200).json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
    });
  }
});

// ─── PUT /api/notifications/:id/read — Mark single notification as read ───────
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message,
    });
  }
});

// ─── PUT /api/notifications/read-all — Mark all notifications as read ─────────
router.put('/read-all', async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark all as read',
      error: error.message,
    });
  }
});

// ─── POST /api/notifications/trigger-reminders — Manual/cron trigger for reminder scanner ───
router.post('/trigger-reminders', async (req, res) => {
  try {
    const summary = await runEventReminderScan();
    res.status(200).json({
      success: true,
      message: 'Event reminder scan completed',
      summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error executing reminder scan',
      error: error.message,
    });
  }
});

export default router;
