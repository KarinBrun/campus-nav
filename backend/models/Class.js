const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
    {
        courseCode: {
            type: String,
            required: true,
            trim: true
        },

        courseName: {
            type: String,
            required: true,
            trim: true
        },

        instructor: {
            type: String,
            required: true,
            trim: true
        },

        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true
        },

        days: {
            type: [String],
            required: true
        },

        startTime: {
            type: String,
            required: true
        },

        endTime: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Class",
    classSchema
);