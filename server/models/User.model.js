import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: {
        type: String,
        enum: ["Admin", "Instructor", "Student"],
        required: true
    },
    divisions: [{ type: Schema.Types.ObjectId, ref: 'Division' }],
    status: { 
        type: String, 
        enum: ["Active", "Suspended", "Graduated"], 
        default: "Active" 
    },
    refreshToken: { type: String }
}, { timestamps: true });

export default mongoose.model('User', userSchema);