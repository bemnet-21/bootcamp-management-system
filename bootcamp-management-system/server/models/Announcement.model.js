import mongoose, { Schema } from "mongoose";

const announcementSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    targetDivision: { type: Schema.Types.ObjectId, ref: 'Division' }, 
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    priority: { type: String, enum: ["Normal", "Urgent"], default: "Normal" }
}, { timestamps: true });

export default mongoose.model('Announcement', announcementSchema);