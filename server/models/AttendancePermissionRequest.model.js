import mongoose from 'mongoose';

const AttendancePermissionRequestSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bootcamp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
    index: true,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewNote: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Compound indexes for efficient queries
AttendancePermissionRequestSchema.index({ session: 1, student: 1 }, { unique: true });
AttendancePermissionRequestSchema.index({ bootcamp: 1, status: 1 });

const AttendancePermissionRequestModel = mongoose.model('AttendancePermissionRequest', AttendancePermissionRequestSchema);

export default AttendancePermissionRequestModel;
