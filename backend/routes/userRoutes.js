const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// Register a new user
router.post("/register", async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password
        } = req.body;

        // Check if all fields were provided
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                message: "Please provide all required fields."
            });
        }

        if (
            typeof firstName !== "string" ||
            typeof lastName !== "string" ||
            !firstName.trim() ||
            !lastName.trim()
        ) {
            return res.status(400).json({
                message: "Please provide valid first and last names."
            });
        }

        // Validate password length and type
        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters."
            });
        }

        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                message: "Please provide a valid email."
            });
        }

        // Check if email is already registered
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                message: "A user with this email already exists."
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email: normalizedEmail,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User created successfully.",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });


    } catch (error) {
        // Handle duplicate email errors from MongoDB
        if (error.code === 11000 && error.keyPattern?.email) {
            return res.status(400).json({
                message: "A user with this email already exists."
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Server error."
        });
    }
});


// Login user
router.post("/login", async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        // Make sure email and password were provided
        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide an email and password."
            });
        }

        if (typeof password !== "string") {
            return res.status(400).json({
                message: "Please provide a valid password."
            });
        }

        // Find user by email
        // Validate and normalize email
        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                message: "Please provide a valid email."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Compare password with stored hash
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        // Send token and user information
        res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error."
        });
    }
});


// Search users for private event sharing
router.get("/search", authMiddleware, async (req, res) => {
    try {
        
        const query = req.query.q;

        if (typeof query !== "string") {
            return res.status(200).json([]);
        }

        const search = query.trim();

        if (search.length > 100) {
            return res.status(400).json({
                message: "Search must be 100 characters or fewer."
            });
        }

        // Escape special regex characters
        const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


        if (!search) {
            return res.status(200).json([]);
        }

        const users = await User.find({
            _id: {
                $ne: req.userId
            },
            $or: [
                {
                    firstName: {
                        $regex: safeSearch,
                        $options: "i"
                    }
                },
                {
                    lastName: {
                        $regex: safeSearch,
                        $options: "i"
                    }
                },
                {
                    email: {
                        $regex: safeSearch,
                        $options: "i"
                    }
                }
            ]
        })
            .select("firstName lastName email")
            .limit(10);

        res.status(200).json(users);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error."
        });
    }
});


// Get currently logged-in user
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(
            req.userId
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        res.status(200).json(user);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error."
        });
    }
});


// Update current user's profile
router.put(
    "/me",
    authMiddleware,
    async (req, res) => {
        try {
            const {
                firstName,
                lastName,
                email
            } = req.body;
         
            if (
                (firstName !== undefined &&
                    (typeof firstName !== "string" || !firstName.trim())) ||
                (lastName !== undefined &&
                    (typeof lastName !== "string" || !lastName.trim()))
            ) {
                return res.status(400).json({
                    message: "Please provide valid first and last names."
                });
            }

            if (
                email !== undefined &&
                (typeof email !== "string" || !email.trim())
            ) {
                return res.status(400).json({
                    message: "Please provide a valid email."
                });
            }

            const user = await User.findById(
                req.userId
            );

            if (!user) {
                return res.status(404).json({
                    message: "User not found."
                });
            }

            // Normalize email before checking for duplicates
            const normalizedEmail =
                email !== undefined
                    ? email.trim().toLowerCase()
                    : undefined;

            // Check whether another user already uses
            // the requested email address
            if (
                normalizedEmail !== undefined &&
                normalizedEmail !== user.email
            ) {
                const existingUser = await User.findOne({
                    email: normalizedEmail,
                    _id: {
                        $ne: user._id
                    }
                });

                if (existingUser) {
                    return res.status(400).json({
                        message: "Email is already in use."
                    });
                }
            }

            if (firstName !== undefined) {
                user.firstName = firstName;
            }

            if (lastName !== undefined) {
                user.lastName = lastName;
            }

            if (normalizedEmail !== undefined) {
                user.email = normalizedEmail;
            }

            await user.save();

            const updatedUser = await User.findById(
                user._id
            ).select("-password");

            res.status(200).json({
                message: "Profile updated successfully.",
                user: updatedUser
            });


        } catch (error) {
            // Handle duplicate email errors from MongoDB
            if (error.code === 11000 && error.keyPattern?.email) {
                return res.status(400).json({
                    message: "Email is already in use."
                });
            }

            console.error(error);

            return res.status(500).json({
                message: "Server error."
            });
        }
    }
);


 // Change current user's password
router.put("/me/password", authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (
            typeof currentPassword !== "string" ||
            typeof newPassword !== "string" ||
            !currentPassword ||
            !newPassword
        ) {
            return res.status(400).json({
                message: "Please provide your current and new passwords."
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "New password must be at least 8 characters."
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        const passwordMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Current password is incorrect."
            });
        }

        if (await bcrypt.compare(newPassword, user.password)) {
            return res.status(400).json({
                message: "New password must be different from your current password."
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({
            message: "Password changed successfully."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error."
        });
    }
});



module.exports = router;