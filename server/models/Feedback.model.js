import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema({
    session: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String }
}, { timestamps: true });

feedbackSchema.index({ session: 1, student: 1 }, { unique: true });

export default mongoose.model('Feedback', feedbackSchema);