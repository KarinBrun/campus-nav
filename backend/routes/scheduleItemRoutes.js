const express = require("express");
const router = express.Router();

const ScheduleItem = require("../models/ScheduleItem");
const authMiddleware = require("../middleware/authMiddleware");


// GET all personal schedule items for logged-in user
router.get("/", authMiddleware, async (req, res) => {
    try {
        const items = await ScheduleItem.find({
            user: req.userId
        })
            .populate("room")
            .sort({ startTime: 1 });

        res.status(200).json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error."
        });
    }
});


// POST create a personal schedule item
router.post("/", authMiddleware, async (req, res) => {
    try {
        const {
            title,
            description,
            days,
            startTime,
            endTime,
            room
        } = req.body;

        if (
            !title ||
            !Array.isArray(days) ||
            days.length === 0 ||
            !startTime ||
            !endTime
        ) {
            return res.status(400).json({
                message:
                    "Title, days, start time, and end time are required."
            });
        }

        if (endTime <= startTime) {
            return res.status(400).json({
                message:
                    "End time must be after start time."
            });
        }

        const newItem = await ScheduleItem.create({
            user: req.userId,
            title,
            description: description || "",
            days,
            startTime,
            endTime,
            room: room || null
        });

        await newItem.populate("room");

        res.status(201).json(newItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error."
        });
    }
});


// PUT update a personal schedule item
router.put("/:itemId", authMiddleware, async (req, res) => {
    try {
        const item = await ScheduleItem.findOne({
            _id: req.params.itemId,
            user: req.userId
        });

        if (!item) {
            return res.status(404).json({
                message: "Schedule item not found."
            });
        }

        const {
            title,
            description,
            days,
            startTime,
            endTime,
            room
        } = req.body;

        if (title !== undefined) {
            item.title = title;
        }

        if (description !== undefined) {
            item.description = description;
        }

        if (days !== undefined) {
            if (!Array.isArray(days) || days.length === 0) {
                return res.status(400).json({
                    message:
                        "At least one day is required."
                });
            }

            item.days = days;
        }

        if (startTime !== undefined) {
            item.startTime = startTime;
        }

        if (endTime !== undefined) {
            item.endTime = endTime;
        }

        if (room !== undefined) {
            item.room = room || null;
        }

        if (item.endTime <= item.startTime) {
            return res.status(400).json({
                message:
                    "End time must be after start time."
            });
        }

        await item.save();
        await item.populate("room");

        res.status(200).json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error."
        });
    }
});


// DELETE a personal schedule item
router.delete("/:itemId", authMiddleware, async (req, res) => {
    try {
        const item = await ScheduleItem.findOneAndDelete({
            _id: req.params.itemId,
            user: req.userId
        });

        if (!item) {
            return res.status(404).json({
                message: "Schedule item not found."
            });
        }

        res.status(200).json({
            message: "Schedule item deleted successfully."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error."
        });
    }
});


module.exports = router;