const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        classes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Class"
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Schedule", scheduleSchema);