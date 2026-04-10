import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    division: { type: Schema.Types.ObjectId, ref: 'Division', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    location: { type: String, required: true },
    status: { 
        type: String, 
        enum: ["Scheduled", "Cancelled", "Completed"], 
        default: "Scheduled" 
    }
}, { timestamps: true });

sessionSchema.index({ division: 1, startTime: 1, endTime: 1 });

export default mongoose.model('Session', sessionSchema);