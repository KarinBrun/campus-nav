const express = require("express");
const Schedule = require("../models/Schedule");
const Class = require("../models/Class");
const authMiddleware = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

// Get the logged-in user's schedule
router.get("/", authMiddleware, async (req, res) => {
    try {
        let schedule = await Schedule.findOne({
            user: req.userId
        }).populate({
            path: "classes",
            populate: {
                path: "room"
            }
        })

        // Create an empty schedule if the user doesn't have one yet
        if (!schedule) {
            schedule = await Schedule.create({
                user: req.userId,
                classes: []
            });
        }

        res.status(200).json(schedule);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error."
        });
    }
});


// Add a class to the logged-in user's schedule
router.post(
    "/classes/:classId",
    authMiddleware,
    validateObjectId("classId"),
    async (req, res) => {
    try {
        const classToAdd = await Class.findById(req.params.classId);

        if (!classToAdd) {
            return res.status(404).json({
                message: "Class not found."
            });
        }

        let schedule = await Schedule.findOne({
            user: req.userId
        });

        // Create schedule if one doesn't exist
        if (!schedule) {
            schedule = await Schedule.create({
                user: req.userId,
                classes: []
            });
        }

        // Prevent duplicate classes
        const classAlreadyExists = schedule.classes.some(
            (classId) => classId.toString() === classToAdd._id.toString()
        );

        if (classAlreadyExists) {
            return res.status(400).json({
                message: "Class is already in your schedule."
            });
        }

        schedule.classes.push(classToAdd._id);

        await schedule.save();

        await schedule.populate({
            path: "classes",
            populate: {
                path: "room"
            }
        })

        res.status(200).json({
            message: "Class added to schedule.",
            schedule
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error."
        });
    }
});


// Remove a class from the logged-in user's schedule
router.delete(
    "/classes/:classId",
    authMiddleware,
    validateObjectId("classId"),
    async (req, res) => {
    try {
        const schedule = await Schedule.findOne({
            user: req.userId
        });

        if (!schedule) {
            return res.status(404).json({
                message: "Schedule not found."
            });
        }

        const classExists = schedule.classes.some(
            (classId) =>
                classId.toString() === req.params.classId
        );

        if (!classExists) {
            return res.status(404).json({
                message: "Class is not in your schedule."
            });
        }

        schedule.classes.pull(req.params.classId);

        await schedule.save();
        await schedule.populate({
            path: "classes",
            populate: {
                path: "room"
            }
        })

        res.status(200).json({
            message: "Class removed from schedule.",
            schedule
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error."
        });
    }
});

module.exports = router;