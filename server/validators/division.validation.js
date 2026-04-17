const DIVISION_STATUSES = ["Active", "Inactive"];

function isNonEmptyString(v) {
    return typeof v === "string" && v.trim().length > 0;
}

export function validateCreateDivision(body) {
    const payload = body ?? {};
    const name = payload.name;
    const description = payload.description;
    const status = payload.status;

    if (!isNonEmptyString(name)) {
        return { error: { status: 400, message: "name is required." } };
    }
    if (status !== undefined && !DIVISION_STATUSES.includes(status)) {
        return {
            error: {
                status: 400,
                message: `status must be one of: ${DIVISION_STATUSES.join(", ")}.`,
            },
        };
    }

    return {
        value: {
            name: String(name).trim(),
            ...(description !== undefined ? { description: String(description).trim() } : {}),
            ...(status !== undefined ? { status } : {}),
        },
    };
}

export function validateUpdateDivision(body) {
    const payload = body ?? {};
    const allowed = ["name", "description", "status"];
    const updates = {};

    for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(payload, key)) {
            updates[key] = payload[key];
        }
    }

    if (Object.keys(updates).length === 0) {
        return { error: { status: 400, message: "Provide at least one field to update." } };
    }

    if (updates.name !== undefined && !isNonEmptyString(updates.name)) {
        return { error: { status: 400, message: "name must be a non-empty string." } };
    }
    if (updates.description !== undefined && typeof updates.description !== "string") {
        return { error: { status: 400, message: "description must be a string." } };
    }
    if (updates.status !== undefined && !DIVISION_STATUSES.includes(updates.status)) {
        return {
            error: {
                status: 400,
                message: `status must be one of: ${DIVISION_STATUSES.join(", ")}.`,
            },
        };
    }

    return {
        value: {
            ...(updates.name !== undefined ? { name: String(updates.name).trim() } : {}),
            ...(updates.description !== undefined ? { description: String(updates.description).trim() } : {}),
            ...(updates.status !== undefined ? { status: updates.status } : {}),
        },
    };
}

