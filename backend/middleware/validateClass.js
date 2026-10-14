const mongoose = require("mongoose");

const validateClass = (requireAllFields = true) => {
    return (req, res, next) => {
        const {
            courseCode,
            courseName,
            instructor,
            room,
            days,
            startTime,
            endTime
        } = req.body;

        if (requireAllFields) {
            if (
                !courseCode ||
                !courseName ||
                !instructor ||
                !room ||
                !days ||
                !startTime ||
                !endTime
            ) {
                return res.status(400).json({
                    message: "Please provide all required class information."
                });
            }
        }

        // Room must be a valid MongoDB ObjectId
        if (
            room !== undefined &&
            !mongoose.Types.ObjectId.isValid(room)
        ) {
            return res.status(400).json({
                message: "Please provide a valid room ID."
            });
        }

        const validDays = [
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun"
        ];

        if (
            days !== undefined &&
            (
                !Array.isArray(days) ||
                days.length === 0 ||
                !days.every((day) =>
                    validDays.includes(day)
                )
            )
        ) {
            return res.status(400).json({
                message: "Please provide valid class days."
            });
        }

        const timePattern =
            /^([01]\d|2[0-3]):[0-5]\d$/;

        if (
            startTime !== undefined &&
            !timePattern.test(startTime)
        ) {
            return res.status(400).json({
                message: "Class times must use HH:MM format."
            });
        }

        if (
            endTime !== undefined &&
            !timePattern.test(endTime)
        ) {
            return res.status(400).json({
                message: "Class times must use HH:MM format."
            });
        }

        next();
    };
};

module.exports = validateClass;