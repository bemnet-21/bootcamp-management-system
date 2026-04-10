import mongoose, { Schema } from "mongoose";

const resourceSchema = new Schema({
    title: { type: String, required: true },
    type: { 
        type: String, 
        enum: ["PDF", "Video", "Image", "ZIP", "Link"], 
        required: true 
    },
    url: { type: String, required: true },
    division: { type: Schema.Types.ObjectId, ref: 'Division', required: true },
    session: { type: Schema.Types.ObjectId, ref: 'Session' },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    downloadCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Resource', resourceSchema);