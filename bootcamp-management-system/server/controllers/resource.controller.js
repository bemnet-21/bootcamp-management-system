import mongoose from "mongoose";
import Resource from "../models/Resource.model.js";
import z from "zod";
import BootcampModel from "../models/Bootcamp.model.js";
import path, { parse } from "path";

const createResourceSchema = z.object({
    title: z.string().min(1, "Title is required."),
    type: z.enum(["PDF", "Image", "ZIP", "Link"], "Invalid resource type."),
    url: z.string().min(1, "URL or File is required."),
    bootcampId: z.string().min(1, "Bootcamp ID is required."),
    sessionId: z.string().optional(),
});


// handles upload of all allowed types

export async function createResource(req, res) {
    try {
        const { title, type } = req.body;
        const { bootcampId, sessionId } = req.params;
        
        let finalUrl = req.body.url;

        if (req.file) {
            finalUrl = req.file.path.startsWith('http') 
                ? req.file.path 
                : `/uploads/${req.file.filename}`;
        }

        const parseResult = createResourceSchema.safeParse({
            title,
            type,
            url: finalUrl,
            bootcampId,
            sessionId,
        });

        if (!parseResult.success) {
            return res.status(400).json({
                error: "Validation Error",
                message: parseResult.error.errors.map(e => e.message).join(" ")
            });
        }

        const bootcamp = await BootcampModel.findById(bootcampId);
        if (!bootcamp) {
            return res.status(404).json({ error: "Not Found", message: "Bootcamp not found." });
        }
        if (sessionId && bootcamp.sessions && !bootcamp.sessions.includes(sessionId)) {
             return res.status(400).json({ error: "Validation Error", message: "Session does not belong to this bootcamp." });
        }

        const resource = await Resource.create({
            title,
            type,
            division: bootcamp.division_id || bootcamp.division, 
            url: finalUrl,
            session: sessionId || null,
            uploadedBy: req.user.id,
            bootcamp: bootcampId
        });

        return res.status(201).json({
            message: "Resource created successfully.",
            resource
        });

    } catch (err) {
        console.error("Create Resource Error:", err);
        
        if (err.name === 'CastError') {
            return res.status(400).json({ error: "Invalid ID", message: `Invalid format for ${err.path}` });
        }

        res.status(500).json({
            error: "Internal Server Error",
            message: err.message || "An unexpected error occurred",
        });
    }
}

const getResourcesSchema = z.object({
    bootcampId: z.string().min(1, "Bootcamp ID is required."),
    sessionId: z.string().optional(),
})
export async function getResources(req, res) {
    const parseResult = getResourcesSchema.safeParse({
        bootcampId: req.params.bootcampId,
        sessionId: req.params.sessionId,
    });

    if (!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message);
        return res.status(400).json({
            error: "Validation Error",
            message: errors.join(" ")
        });
    }

    try {
        const { bootcampId, sessionId } = parseResult.data;
        const filter = { bootcamp: bootcampId };
        if (sessionId) filter.session = sessionId;
        const resources = await Resource.find(filter)
            .populate("division session uploadedBy")
            .sort({ createdAt: -1 });

        res.status(200).json({ 
            message: "Resources retrieved successfully.",
            resources
         });
    } catch (err) {
        return res.status(500).json({
            error: "Internal Server Error",
            message: err.message,
        });
    }
}

const getResourceByIdSchema = z.object({
    resourceId: z.string().min(1, "Resource ID is required."),
    bootcampId: z.string().min(1, "Bootcamp ID is required."),
    sessionId: z.string().optional(),
})
export async function getResourceById(req, res) {
    const parseResult = getResourceByIdSchema.safeParse({
        resourceId: req.params.resourceId,
        bootcampId: req.params.bootcampId,
        sessionId: req.params.sessionId,
    });

    if (!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message);
        return res.status(400).json({
            error: "Validation Error",
            message: errors.join(" ")
        });
    }

    try {
        const { resourceId, bootcampId, sessionId } = parseResult.data;
        const filter = { _id: resourceId, bootcamp: bootcampId };
        if (sessionId) filter.session = sessionId;
        const resource = await Resource.findOne(filter)
            .populate("division session uploadedBy");
        
        if (!resource) {
            return res.status(404).json({
                error: "Not Found",
                message: "Resource not found.",
            });
        }
        res.status(200).json({ 
            message: "Resource retrieved successfully.",
            resource
         });
    } catch (err) {
        return res.status(500).json({
            error: "Internal Server Error",
            message: err.message,
        });
    }
}

const downloadResourceSchema = z.object({
    resourceId: z.string().min(1, "Resource ID is required."),
    bootcampId: z.string().min(1, "Bootcamp ID is required."),
    sessionId: z.string().optional(),
})
export async function downloadResource(req, res) {
    const parseResult = downloadResourceSchema.safeParse({
        resourceId: req.params.resourceId,
        bootcampId: req.params.bootcampId,
        sessionId: req.params.sessionId,
    });

    if (!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message);
        return res.status(400).json({
            error: "Validation Error",
            message: errors.join(" ")
        });
    }

    try {
        const { resourceId, bootcampId, sessionId } = parseResult.data;
        const filter = { _id: resourceId, bootcamp: bootcampId };
        if (sessionId) filter.session = sessionId;
        const resource = await Resource.findOne(filter);
        if (!resource) {
            return res.status(404).json({
                error: "Not Found",
                message: "Resource not found."
            });
        }

        resource.downloadCount = (resource.downloadCount || 0) + 1;
        await resource.save();

        if (/^https?:\/\//i.test(resource.url)) {
            return res.json({ url: resource.url, downloadCount: resource.downloadCount });
        }

        const filePath = path.join(process.cwd(), resource.url.replace(/^\//, ''));
        return res.download(filePath, err => {
            if (err) {
                return res.status(404).json({
                    error: "File Not Found",
                    message: "File could not be downloaded."
                });
            }
        });
    } catch (err) {
        return res.status(500).json({
            error: "Internal Server Error",
            message: err.message || 'Internal server error.'
        });
    }
}
   
const deleteResourceSchema = z.object({
    resourceId: z.string().min(1, "Resource ID is required."),
})
export async function deleteResource(req, res) {
    const parseResult = deleteResourceSchema.safeParse({
        resourceId: req.params.resourceId,
    });
    if(!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message);
        return res.status(400).json({
            error: "Validation Error",
            message: errors.join(" ")
        });
    }
    try {
        const { resourceId } = parseResult.data;

        const resource = await Resource.findByIdAndDelete(resourceId);

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
            error: "Internal Server Error",
            message: err.message,
        });
    }
}

const updateResourceMetaDataSchema = z.object({
    title: z.string().min(1, "Title is required.").optional(),
    resourceId: z.string().min(1, "Resource ID is required."),
    url: z.string().optional(),
    type: z.enum(["PDF", "Image", "ZIP", "Link"], "Invalid resource type.").optional(),
    bootcampId: z.string().min(1, "Bootcamp ID is required."),
    sessionId: z.string().optional(),
})

export async function updateResourceMetaData(req, res) {
    const parseResult = updateResourceMetaDataSchema.safeParse({
        ...req.body,
        ...req.params,
    })
    
    if(!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message)
        res.status(400).json({ 
            error: "Validation Error",
            message: errors.join(" ")
         })
    }

    try {
        const { title, url, bootcampId, resourceId, type, sessionId } = parseResult.data

        const filter = { _id: resourceId, bootcamp: bootcampId };
        if (sessionId) filter.session = sessionId;
        const resource = await Resource.findOne(filter);

        if (!resource) {
            return res.status(404).json({
                error: "Not Found",
                message: "Resource not found.",
            });
        }

        if (title) resource.title = title;
        if (url) resource.url = url;
        if (type) resource.type = type;
        if (sessionId !== undefined) resource.session = sessionId;
        
        await resource.save();

        return res.json({
            message: "Resource updated successfully.",
            resource
        });

    } catch (err) {
        res.status(500).json({
            error: "Internal Server Error",
            message: err.message,
         });
    }
}