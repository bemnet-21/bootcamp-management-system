import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['SESSION_REMINDER', 'GRADE_POSTED', 'BOOTCAMP_INVITE', 'FEEDBACK_REQUEST'],
    required: true 
  },
  link: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: '90d' } 
});

export default mongoose.model('Notification', notificationSchema);