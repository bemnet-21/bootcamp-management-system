import mongoose, { Schema } from "mongoose";

const divisionSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: { type: String, trim: true },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active",
    },
}, { timestamps: true });

export default mongoose.model('Division', divisionSchema);
