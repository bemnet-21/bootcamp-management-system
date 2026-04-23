import mongoose, { Schema } from "mongoose";

const attendanceSchema = new Schema({
    session: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
        type: String, 
        enum: ["Present", "Absent", "Late", "Excused"], 
        required: true 
    },
    note: { type: String }, 
    markedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

attendanceSchema.index({ session: 1, student: 1 }, { unique: true });
attendanceSchema.index({ session: 1 });

export default mongoose.model('Attendance', attendanceSchema);
