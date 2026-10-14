const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
    {
        building: {
            type: String,
            required: true,
            trim: true
        },

        roomNumber: {
            type: String,
            required: true,
            trim: true
        },

        roomName: {
            type: String,
            trim: true,
            default: ""
        },

        mappedInLocationId: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

roomSchema.index(
    {
        building: 1,
        roomNumber: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model("Room", roomSchema);