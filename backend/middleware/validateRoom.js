const validateRoom = (requireAllFields = true) => {
    return (req, res, next) => {
        const {
            building,
            roomNumber
        } = req.body;

        if (requireAllFields) {
            if (!building || !roomNumber) {
                return res.status(400).json({
                    message: "Please provide a building and room number."
                });
            }
        }

        if (
            building !== undefined &&
            typeof building !== "string"
        ) {
            return res.status(400).json({
                message: "Building must be text."
            });
        }

        if (
            roomNumber !== undefined &&
            typeof roomNumber !== "string"
        ) {
            return res.status(400).json({
                message: "Room number must be text."
            });
        }

        next();
    };
};

module.exports = validateRoom;