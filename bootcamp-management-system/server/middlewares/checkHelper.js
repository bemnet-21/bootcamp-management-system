export const checkInstructor = async (req, res, next) => {
    const { bootcampId } = req.params;
    const userId = req.user.id;

    try {
        const bootcamp = await Bootcamp.findById(bootcampId);
        if (!bootcamp) {
            return res.status(404).json({
                error: "Not Found",
                message: "Bootcamp not found.",
            });
        }
        if(!bootcamp.helpers.includes(userId)) return res.status(403).json({ 
            error: "Forbidden",
            message: "You do not have permission to perform this action.",
         })

        next()
    } catch(err) {
        return res.status(500).json({
            error: "Internal Server Error",
            message: err.message,
        });
    }
}