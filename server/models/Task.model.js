import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    division: { type: Schema.Types.ObjectId, ref: 'Division', required: true },
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deadline: { type: Date, required: true },
    submissionType: { 
        type: String, 
        enum: ["File", "GitHub", "Both"], 
        required: true 
    },
    maxScore: { type: Number, default: 100 }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);