import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['new_event', 'event_reminder', 'guidance_reply', 'interview_update', 'general'],
      default: 'new_event',
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DepartmentEvent',
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    actionPath: {
      type: String,
      default: '',
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying a student's unread / recent notifications quickly
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });
// Compound index to guarantee reminder idempotency: one reminder per event per user per type
notificationSchema.index({ userId: 1, eventId: 1, type: 1 });

const Notification = mongoose.model('Notification', notificationSchema, 'Notifications');
export default Notification;
