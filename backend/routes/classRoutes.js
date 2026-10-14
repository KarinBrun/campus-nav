const express = require("express");
const Class = require("../models/Class");
const Schedule = require("../models/Schedule");
const Room = require("../models/Room");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const validateObjectId = require("../middleware/validateObjectId");
const validateClass = require("../middleware/validateClass");

const router = express.Router();

// Get all classes
router.get("/", authMiddleware, async (req, res) => {
    try {
        const classes = await Class.find()
        .populate("room")
        .sort({
            courseCode: 1
        });

        res.status(200).json(classes);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error."
        });
    }
});

// Get a class by ID
router.get(
    "/:classId",
    authMiddleware,
    validateObjectId("classId"),
    async (req, res) => {
    try {
        const classItem = await Class.findById(
            req.params.classId
        ).populate("room");

        if (!classItem) {
            return res.status(404).json({
                message: "Class not found."
            });
        }

        res.status(200).json(classItem);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error."
        });
    }
});

// Create a class - admin only
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    validateClass(true),
    async (req, res) => {
        try {
            const {
                courseCode,
                courseName,
                instructor,
                room,
                days,
                startTime,
                endTime
            } = req.body;

            // Make sure the room exists
            const roomExists = await Room.findById(room);

            if (!roomExists) {
                return res.status(404).json({
                    message: "Room not found."
                });
            }

            // End time must be after start time
            if (startTime >= endTime) {
                return res.status(400).json({
                    message: "Class end time must be after the start time."
                });
            }

            // Prevent duplicate classes
            const existingClass = await Class.findOne({
                courseCode,
                days,
                startTime
            });

            if (existingClass) {
                return res.status(400).json({
                    message: "This class already exists."
                });
            }

            const newClass = await Class.create({
                courseCode,
                courseName,
                instructor,
                room,
                days,
                startTime,
                endTime
            });

            await newClass.populate("room");

            res.status(201).json({
                message: "Class created successfully.",
                class: newClass
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Server error."
            });
        }
    }
);

// Update a class - admin only
router.put(
    "/:classId",
    authMiddleware,
    adminMiddleware,
    validateObjectId("classId"),
    validateClass(false),
    async (req, res) => {
        try {
            const classToUpdate = await Class.findById(
                req.params.classId
            );

            if (!classToUpdate) {
                return res.status(404).json({
                    message: "Class not found."
                });
            }

            const {
                courseCode,
                courseName,
                instructor,
                room,
                days,
                startTime,
                endTime
            } = req.body;

            // If the room is being changed,
            // make sure the new room exists
            if (room !== undefined) {
                const roomExists = await Room.findById(room);

                if (!roomExists) {
                    return res.status(404).json({
                        message: "Room not found."
                    });
                }
            }

            // Determine final class times
            const newStartTime =
                startTime !== undefined
                    ? startTime
                    : classToUpdate.startTime;

            const newEndTime =
                endTime !== undefined
                    ? endTime
                    : classToUpdate.endTime;

            if (newStartTime >= newEndTime) {
                return res.status(400).json({
                    message: "Class end time must be after the start time."
                });
            }

            // Update only fields that were provided
            if (courseCode !== undefined) {
                classToUpdate.courseCode = courseCode;
            }

            if (courseName !== undefined) {
                classToUpdate.courseName = courseName;
            }

            if (instructor !== undefined) {
                classToUpdate.instructor = instructor;
            }

            if (room !== undefined) {
                classToUpdate.room = room;
            }

            if (days !== undefined) {
                classToUpdate.days = days;
            }

            if (startTime !== undefined) {
                classToUpdate.startTime = startTime;
            }

            if (endTime !== undefined) {
                classToUpdate.endTime = endTime;
            }

            await classToUpdate.save();

            await classToUpdate.populate("room");

            res.status(200).json({
                message: "Class updated successfully.",
                class: classToUpdate
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Server error."
            });
        }
    }
);

// Delete a class
router.delete(
    "/:classId",
    authMiddleware,
    adminMiddleware,
    validateObjectId("classId"),
    async (req, res) => {
    try {
        const classToDelete = await Class.findById(req.params.classId);

        if (!classToDelete) {
            return res.status(404).json({
                message: "Class not found."
            });
        }

        // Remove the class from all schedules
        await Schedule.updateMany(
            {},
            { $pull: { classes: classToDelete._id } }
        );

        // Delete the class
        await Class.findByIdAndDelete(req.params.classId);

        res.status(200).json({
            message: "Class deleted successfully."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error."
        });
    }
});

module.exports = router;