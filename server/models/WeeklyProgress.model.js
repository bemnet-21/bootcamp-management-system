import mongoose, { Schema } from "mongoose";

const weeklyProgressSchema = new Schema({
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    weekNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true, minlength: 50 },
    linkOrFile: { type: String },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

weeklyProgressSchema.index({ group: 1, weekNumber: 1 }, { unique: true });

export default mongoose.model('WeeklyProgress', weeklyProgressSchema);