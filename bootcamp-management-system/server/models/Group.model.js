import mongoose, { Schema } from "mongoose";

const groupSchema = new Schema({
    name: { type: String, required: true },
    division: { type: Schema.Types.ObjectId, ref: 'Division', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    mentor: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Group', groupSchema);