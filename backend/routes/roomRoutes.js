const express = require("express");
const Room = require("../models/Room");
const Class = require("../models/Class");
const authMiddleware = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");
const adminMiddleware = require("../middleware/adminMiddleware");
const validateRoom = require("../middleware/validateRoom");

const router = express.Router();


// Get all rooms
router.get("/", authMiddleware, async (req, res) => {
    try {
        const rooms = await Room.find().sort({
            building: 1,
            roomNumber: 1
        });

        res.status(200).json(rooms);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error."
        });
    }
});

// Create a room - admin only
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    validateRoom(true),
    async (req, res) => {
        try {
            const {
                building,
                roomNumber,
                roomName,
                mappedInLocationId
            } = req.body;

            // Check for an existing room
            const existingRoom = await Room.findOne({
                building,
                roomNumber
            });

            if (existingRoom) {
                return res.status(400).json({
                    message: "This room already exists."
                });
            }

            const newRoom = await Room.create({
                building,
                roomNumber,
                roomName,
                mappedInLocationId
            });

            res.status(201).json({
                message: "Room created successfully.",
                room: newRoom
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Server error."
            });
        }
    }
);

// Update a room - admin only
router.put(
    "/:roomId",
    authMiddleware,
    adminMiddleware,
    validateObjectId("roomId"),
    validateRoom(false),
    async (req, res) => {
        try {
            const room = await Room.findById(
                req.params.roomId
            );

            if (!room) {
                return res.status(404).json({
                    message: "Room not found."
                });
            }

            const {
                building,
                roomNumber,
                roomName,
                mappedInLocationId
            } = req.body;

            // Determine the final building and room number
            const newBuilding =
                building !== undefined
                    ? building
                    : room.building;

            const newRoomNumber =
                roomNumber !== undefined
                    ? roomNumber
                    : room.roomNumber;

            // Make sure the update won't create a duplicate room
            const existingRoom = await Room.findOne({
                building: newBuilding,
                roomNumber: newRoomNumber,
                _id: { $ne: room._id }
            });

            if (existingRoom) {
                return res.status(400).json({
                    message: "This room already exists."
                });
            }

            if (building !== undefined) {
                room.building = building;
            }

            if (roomNumber !== undefined) {
                room.roomNumber = roomNumber;
            }

            if (roomName !== undefined) {
                room.roomName = roomName;
            }

            if (mappedInLocationId !== undefined) {
                room.mappedInLocationId =
                    mappedInLocationId;
            }

            await room.save();

            res.status(200).json({
                message: "Room updated successfully.",
                room
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Server error."
            });
        }
    }
);

// Get one room
router.get(
    "/:roomId",
    authMiddleware,
    validateObjectId("roomId"),
    async (req, res) => {
        try {
            const room = await Room.findById(
                req.params.roomId
            );

            if (!room) {
                return res.status(404).json({
                    message: "Room not found."
                });
            }

            res.status(200).json(room);

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Server error."
            });
        }
    }
);

// Delete a room - admin only
router.delete(
    "/:roomId",
    authMiddleware,
    adminMiddleware,
    validateObjectId("roomId"),
    async (req, res) => {
        try {
            const room = await Room.findById(
                req.params.roomId
            );

            if (!room) {
                return res.status(404).json({
                    message: "Room not found."
                });
            }

            // Check whether any classes use this room
            const classUsingRoom = await Class.findOne({
                room: room._id
            });

            if (classUsingRoom) {
                return res.status(400).json({
                    message:
                        "This room cannot be deleted because it is being used by a class."
                });
            }

            await Room.findByIdAndDelete(
                req.params.roomId
            );

            res.status(200).json({
                message: "Room deleted successfully."
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Server error."
            });
        }
    }
);

module.exports = router;