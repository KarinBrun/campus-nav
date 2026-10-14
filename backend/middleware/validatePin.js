const validatePin = (requireAllFields = true) => {
    return (req, res, next) => {
        const {
            title,
            type,
            building,
            room,
            startTime,
            endTime,
            recurring,
            recurrence,
            recurrenceEnd
        } = req.body;

        // POST requires all basic pin fields
        if (requireAllFields) {
            if (
                !title ||
                !type ||
                !building ||
                !room ||
                !startTime ||
                !endTime
            ) {
                return res.status(400).json({
                    message: "Please provide all required pin information."
                });
            }
        }

        const validTypes = [
            "study-group",
            "event"
        ];

        if (
            type !== undefined &&
            !validTypes.includes(type)
        ) {
            return res.status(400).json({
                message: "Pin type must be study-group or event."
            });
        }

        if (
            startTime !== undefined &&
            Number.isNaN(Date.parse(startTime))
        ) {
            return res.status(400).json({
                message: "Please provide a valid start time."
            });
        }

        if (
            endTime !== undefined &&
            Number.isNaN(Date.parse(endTime))
        ) {
            return res.status(400).json({
                message: "Please provide a valid end time."
            });
        }

        if (
            recurring !== undefined &&
            typeof recurring !== "boolean"
        ) {
            return res.status(400).json({
                message: "Recurring must be true or false."
            });
        }

        if (
            recurrence !== undefined &&
            recurrence !== null &&
            recurrence !== "weekly"
        ) {
            return res.status(400).json({
                message: "Recurrence must be weekly."
            });
        }

        if (
            recurrenceEnd !== undefined &&
            recurrenceEnd !== null &&
            Number.isNaN(Date.parse(recurrenceEnd))
        ) {
            return res.status(400).json({
                message: "Please provide a valid recurrence end date."
            });
        }

        // Creating a recurring pin requires recurrence information
        if (
            requireAllFields &&
            recurring === true &&
            (
                recurrence !== "weekly" ||
                !recurrenceEnd
            )
        ) {
            return res.status(400).json({
                message: "Weekly recurring pins require a recurrence end date."
            });
        }

        next();
    };
};

module.exports = validatePin;