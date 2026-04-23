export function sendResponse(res, { status = 200, success = true, data = null, message = "" }) {
    return res.status(status).json({ success, data, message });
}

export function sendError(res, { status = 500, error = "Server Error", message = "Internal server error.", data = null }) {
    // Keep the app's standard envelope while allowing an `error` field for clients/devs.
    return res.status(status).json({ success: false, data, message, error });
}

