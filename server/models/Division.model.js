import mongoose, { Schema } from "mongoose";

const divisionSchema = new Schema({
    name: { 
        type: String, 
        enum: ["Data Science", "Development", "CPD", "Cybersecurity"], 
        required: true,
        unique: true 
    },
    description: { type: String }
}, { timestamps: true });

export default mongoose.model('Division', divisionSchema);