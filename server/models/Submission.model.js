import mongoose, { Schema } from "mongoose";

const submissionSchema = new Schema({
    task: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileUrl: { type: String },
    githubLink: { type: String },
    status: { 
        type: String, 
        enum: ["Pending", "Graded", "Returned"], 
        default: "Pending" 
    },
    score: { type: Number },
    instructorFeedback: { type: String },
    version: { type: Number, default: 1 }
}, { timestamps: true });

export default mongoose.model('Submission', submissionSchema);