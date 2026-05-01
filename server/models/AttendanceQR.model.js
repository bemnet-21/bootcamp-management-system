import mongoose from 'mongoose';

const AttendanceQRSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
  },
  bootcamp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  qrToken: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
AttendanceQRSchema.index({ session: 1, isActive: 1 });

// TTL index to automatically delete expired QR codes
AttendanceQRSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AttendanceQRModel = mongoose.model('AttendanceQR', AttendanceQRSchema);

export default AttendanceQRModel;
