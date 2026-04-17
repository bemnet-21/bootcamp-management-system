import mongoose from "mongoose";
import Resource from "../models/Resource.model.js";

export async function createResource(req, res) {
    try {
        const { title, type, url, division, session } = req.body;

        if (!title || !type || !url || !division) {
            return res.status(400).json({
                error: "Validation Error",
                message: "title, type, url, and division are required.",
            });
        }

        if (!mongoose.isValidObjectId(division)) {
            return res.status(400).json({
                error: "Validation Error",
                message: "Invalid division id.",
            });
        }

        const resource = await Resource.create({
            title,
            type,
            url,
            division,
            session,
            uploadedBy: req.user?._id 
        });

        return res.status(201).json({ resource });

    } catch (err) {
        return res.status(500).json({
            error: "Server Error",
            message: err.message,
        });
    }
}


export async function getResources(req, res) {
    try {
        const { division, session } = req.query;

        const filter = {};

        if (division) filter.division = division;
        if (session) filter.session = session;

        const resources = await Resource.find(filter)
            .populate("division session uploadedBy")
            .sort({ createdAt: -1 });

        return res.json({ resources });

    } catch (err) {
        return res.status(500).json({
            error: "Server Error",
            message: err.message,
        });
    }
}


export async function downloadResource(req, res) {
    try {
       const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                error: "Validation Error",
                message: "Invalid resource id.",
            });
        }

        const resource = await Resource.findById(id);

        if (!resource) {
            return res.status(404).json({
                error: "Not Found",
                message: "Resource not found.",
            });
        }

        
        resource.downloadCount += 1;
        await resource.save();

        return res.json({
            url: resource.url,
            downloadCount: resource.downloadCount
        });
    } catch (err) {
        return res.status(500).json({
            error: "Server Error",
            message: err.message,
        });
    }
}


export async function deleteResource(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                error: "Validation Error",
                message: "Invalid resource id.",
            });
        }

        const resource = await Resource.findByIdAndDelete(id);

        if (!resource) {
            return res.status(404).json({
                error: "Not Found",
                message: "Resource not found.",
            });
        }

        return res.json({
            message: "Resource deleted successfully."
        });

    } catch (err) {
        return res.status(500).json({
            error: "Server Error",
            message: err.message,
        });
    }
}