import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String , required: true },
    bootcamp: { type: Schema.Types.ObjectId, ref: 'Bootcamp', required: true },
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deadline: { type: Date, required: true },
    submissionType: {
        type: String,
        enum: ["File", "Link", "Both"],
        required: true
    },
    maxScore: { type: Number, default: 100 },
    markedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);