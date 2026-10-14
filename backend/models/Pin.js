const mongoose = require("mongoose");

const pinSchema = new mongoose.Schema(
    {
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true,
            default: ""
        },

        type: {
            type: String,
            enum: ["study-group", "event"],
            required: true
        },

        visibility: {
            type: String,
            enum: ["public", "private"],
            default: "public"
        },

        sharedWith: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        mappedInLocationId: {
            type: String,
            default: null
        },

        building: {
            type: String,
            required: true,
            trim: true
        },

        room: {
            type: String,
            required: true,
            trim: true
        },

        startTime: {
            type: Date,
            required: true
        },

        endTime: {
            type: Date,
            required: true
        },
        recurring: {
            type: Boolean,
            default: false
        },

        recurrence: {
            type: String,
            enum: ["weekly"],
            default: null
        },

        recurrenceEnd: {
            type: Date,
            default: null
        },
        deleteAfter: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

pinSchema.index(
    { deleteAfter: 1 },
    { expireAfterSeconds: 0 }
);
module.exports = mongoose.model("Pin", pinSchema);