const express = require("express");
const Pin = require("../models/Pin");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const validateObjectId = require("../middleware/validateObjectId");
const validatePin = require("../middleware/validatePin");

const calculateDeleteAfter = (startTime, endTime, recurring, recurrenceEnd) => {
    let finalEnd = new Date(endTime);

    if (recurring && recurrenceEnd) {
        const firstStart = new Date(startTime);
        const lastDate = new Date(recurrenceEnd);

        // Compare calendar dates, not times
        const startDay = Date.UTC(
            firstStart.getUTCFullYear(),
            firstStart.getUTCMonth(),
            firstStart.getUTCDate()
        );

        const lastDay = Date.UTC(
            lastDate.getUTCFullYear(),
            lastDate.getUTCMonth(),
            lastDate.getUTCDate()
        );

        const weeks = Math.max(
            0,
            Math.floor(
                (lastDay - startDay) / (7 * 24 * 60 * 60 * 1000)
            )
        );

        finalEnd = new Date(
            finalEnd.getTime() +
            weeks * 7 * 24 * 60 * 60 * 1000
        );
    }

    return new Date(
        finalEnd.getTime() + 30 * 24 * 60 * 60 * 1000
    );
};

const getNextOccurrence = (pin, currentTime) => {
    let occurrenceStart = new Date(pin.startTime);
    let occurrenceEnd = new Date(pin.endTime);

    if (!pin.recurring) {
        return {
            startTime: occurrenceStart,
            endTime: occurrenceEnd
        };
    }

    const recurrenceEnd = new Date(pin.recurrenceEnd);

    // Move forward one week at a time until the
    // occurrence has not already ended
    while (
        occurrenceEnd <= currentTime &&
        occurrenceStart <= recurrenceEnd
    ) {
        occurrenceStart.setDate(
            occurrenceStart.getDate() + 7
        );

        occurrenceEnd.setDate(
            occurrenceEnd.getDate() + 7
        );
    }

    if (occurrenceStart > recurrenceEnd) {
        return null;
    }

    return {
        startTime: occurrenceStart,
        endTime: occurrenceEnd
    };
};

const router = express.Router();

// Get all pins created by the logged-in user
router.get("/mine", authMiddleware, async (req, res) => {
    try {
        const pins = await Pin.find({
            creator: req.userId
        })
            .populate("creator", "firstName lastName")
            .populate("sharedWith", "firstName lastName email")
            .sort({ startTime: 1 });

        const currentTime = new Date();

        const activePins = pins.filter((pin) => {
            const occurrence = getNextOccurrence(pin, currentTime);

            return occurrence && occurrence.endTime > currentTime;
        });

        res.status(200).json(activePins);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error."
        });
    }
});

// Get all pins - admin only
router.get(
    "/all",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const pins = await Pin.find()
                .populate(
                    "creator",
                    "firstName lastName email"
                )
                .sort({ startTime: 1 });

            res.status(200).json(pins);

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Server error."
            });
        }
    }
);

// Get all pins
router.get("/", authMiddleware, async (req, res) => {
    try {
        const currentTime = new Date();

        const sevenDaysFromNow = new Date(currentTime);
        sevenDaysFromNow.setDate(
            sevenDaysFromNow.getDate() + 7
        );

        const pins = await Pin.find({
            $or: [
                { visibility: "public" },
                { visibility: { $exists: false } },
                { creator: req.userId },
                { sharedWith: req.userId }
            ]
        })
            .populate("creator", "firstName lastName")
            .populate("sharedWith", "firstName lastName email");

        const visiblePins = [];

        for (const pin of pins) {
            const occurrence = getNextOccurrence(
                pin,
                currentTime
            );

            if (!occurrence) {
                continue;
            }

            if (
                occurrence.startTime <= sevenDaysFromNow &&
                occurrence.endTime > currentTime
            ) {
                const pinObject = pin.toObject();

                pinObject.currentOccurrence = {
                    startTime: occurrence.startTime,
                    endTime: occurrence.endTime
                };

                visiblePins.push(pinObject);
            }
        }

        visiblePins.sort(
            (a, b) =>
                new Date(a.currentOccurrence.startTime) -
                new Date(b.currentOccurrence.startTime)
        );

        res.status(200).json(visiblePins);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error."
        });
    }
});

// Get a pin by ID
router.get("/:pinId", authMiddleware, async (req, res) => {
    try {
    const pin = await Pin.findById(req.params.pinId)
        .populate("creator", "firstName lastName")
        .populate("sharedWith", "firstName lastName email");

        if (!pin) {
            return res.status(404).json({
                message: "Pin not found."
            });
        }

        const isCreator =
            pin.creator._id.toString() === req.userId.toString();

        const isShared =
            pin.sharedWith.some(
                (user) => user._id.toString() === req.userId.toString()
            );

        const isPublic =
            !pin.visibility || pin.visibility === "public";

        if (!isPublic && !isCreator && !isShared) {
            return res.status(403).json({
                message: "You do not have permission to view this pin."
            });
        }

        res.status(200).json(pin);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error."
        });
    }
});


// Create a pin
router.post(
    "/",
    authMiddleware,
    validatePin(true),
    async (req, res) => {
    try {
        const {
            title,
            description,
            type,
            visibility,
            sharedWith,
            mappedInLocationId,
            building,
            room,
            startTime,
            endTime,
            recurring,
            recurrence,
            recurrenceEnd
        } = req.body;

        if (new Date(startTime) >= new Date(endTime)) {
            return res.status(400).json({
                message: "Pin end time must be after the start time."
            });
        }

        if (
            recurring === true &&
            new Date(recurrenceEnd) < new Date(endTime)
        ) {
            return res.status(400).json({
                message: "Recurrence end must be after the first event."
            });
        }

        const currentTime = new Date();

        if (new Date(endTime) <= currentTime) {
            return res.status(400).json({
                message: "Cannot create a pin for an event that has already ended."
            });
        }

        const newPin = await Pin.create({
            creator: req.userId,
            title,
            description,
            type,
            visibility: visibility || "public",
            sharedWith:
                visibility === "private" && Array.isArray(sharedWith)
                    ? sharedWith
                    : [],
            mappedInLocationId,
            building,
            room,
            startTime,
            endTime,
            recurring: recurring || false,
            recurrence: recurring ? recurrence : null,
            recurrenceEnd: recurring ? recurrenceEnd : null,
            deleteAfter: calculateDeleteAfter(
                startTime,
                endTime,
                recurring,
                recurrenceEnd
            )
        });

        await newPin.populate(
            "creator",
            "firstName lastName"
        );

        await newPin.populate(
            "sharedWith",
            "firstName lastName email"
        );

        res.status(201).json({
            message: "Pin created successfully.",
            pin: newPin
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error."
        });
    }
});

// Update a pin
router.put(
    "/:pinId",
    authMiddleware,
    validateObjectId("pinId"),
    validatePin(false),
    async (req, res) => {
        try {
            const pin = await Pin.findById(req.params.pinId);

            if (!pin) {
                return res.status(404).json({
                    message: "Pin not found."
                });
            }

            // Only the creator can edit the pin
            if (pin.creator.toString() !== req.userId.toString()) {
                return res.status(403).json({
                    message: "You can only edit your own pins."
                });
            }

            const {
                title,
                description,
                type,
                visibility,
                sharedWith,
                mappedInLocationId,
                building,
                room,
                startTime,
                endTime,
                recurring,
                recurrence,
                recurrenceEnd
            } = req.body;

            // Determine final start and end times
            const newStartTime =
                startTime !== undefined
                    ? new Date(startTime)
                    : new Date(pin.startTime);

            const newEndTime =
                endTime !== undefined
                    ? new Date(endTime)
                    : new Date(pin.endTime);

            // End must be after start
            if (newStartTime >= newEndTime) {
                return res.status(400).json({
                    message: "Pin end time must be after the start time."
                });
            }

            // Event cannot already be over
            const currentTime = new Date();

            const willBeRecurring =
                recurring !== undefined
                    ? recurring
                    : pin.recurring;

            if (!willBeRecurring && newEndTime <= currentTime) {
                return res.status(400).json({
                    message: "Pin end time cannot be in the past."
                });
            }

            // Update basic fields
            if (title !== undefined) {
                pin.title = title;
            }

            if (description !== undefined) {
                pin.description = description;
            }

            if (type !== undefined) {
                pin.type = type;
            }

            if (visibility !== undefined) {
                pin.visibility = visibility;

                if (visibility === "public") {
                    pin.sharedWith = [];
                }
            }

            if (
                sharedWith !== undefined &&
                pin.visibility === "private"
            ) {
                pin.sharedWith = Array.isArray(sharedWith)
                    ? sharedWith
                    : [];
            }

            if (mappedInLocationId !== undefined) {
                pin.mappedInLocationId = mappedInLocationId;
            }

            if (building !== undefined) {
                pin.building = building;
            }

            if (room !== undefined) {
                pin.room = room;
            }

            if (startTime !== undefined) {
                pin.startTime = startTime;
            }

            if (endTime !== undefined) {
                pin.endTime = endTime;
            }

            // Update recurrence fields
            if (recurring !== undefined) {
                pin.recurring = recurring;
            }

            if (recurrence !== undefined) {
                pin.recurrence = recurrence;
            }

            if (recurrenceEnd !== undefined) {
                pin.recurrenceEnd = recurrenceEnd;
            }

            // Validate final recurrence settings
            if (pin.recurring) {
                if (
                    pin.recurrence !== "weekly" ||
                    !pin.recurrenceEnd
                ) {
                    return res.status(400).json({
                        message: "Weekly recurring pins require a recurrence end date."
                    });
                }

                if (new Date(pin.recurrenceEnd) < newEndTime) {
                    return res.status(400).json({
                        message: "Recurrence end must be after the first event."
                    });
                }
            } else {
                pin.recurrence = null;
                pin.recurrenceEnd = null;
            }

            pin.deleteAfter = calculateDeleteAfter(
                pin.startTime,
                pin.endTime,
                pin.recurring,
                pin.recurrenceEnd
            );

            await pin.save();

            await pin.populate(
                "creator",
                "firstName lastName"
            );

            await pin.populate(
                "sharedWith",
                "firstName lastName email"
            );

            res.status(200).json({
                message: "Pin updated successfully.",
                pin
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Server error."
            });
        }
    }
);

// Delete a pin
router.delete(
    "/:pinId",
    authMiddleware,
    validateObjectId("pinId"),
    async (req, res) => {
    try {
        const pin = await Pin.findById(req.params.pinId);

        if (!pin) {
            return res.status(404).json({
                message: "Pin not found."
            });
        }

        const isCreator =
            pin.creator.toString() === req.userId.toString();

        const isAdmin =
            req.userRole === "admin";

        // Creator or admin can delete the pin
        if (!isCreator && !isAdmin) {
            return res.status(403).json({
                message: "You do not have permission to delete this pin."
            });
        }

        await Pin.findByIdAndDelete(req.params.pinId);

        res.status(200).json({
            message: "Pin deleted successfully."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error."
        });
    }
});

module.exports = router;