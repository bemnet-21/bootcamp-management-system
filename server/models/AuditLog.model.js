import mongoose, { Schema } from "mongoose";

const auditLogSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String }
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model('AuditLog', auditLogSchema);