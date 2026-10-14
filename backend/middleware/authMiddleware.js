
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    // Get authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Access denied. No token provided."
        });
    }

    // Get token from "Bearer TOKEN"
    const token = authHeader.split(" ")[1];

    let decoded;

    try {
        // Verify token
        decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token."
        });
    }

    // Validate token payload
    if (
        !decoded.userId ||
        !mongoose.isValidObjectId(decoded.userId) ||
        !["user", "admin"].includes(decoded.role)
    ) {
        return res.status(401).json({
            message: "Invalid token."
        });
    }

    try {
        // Verify that the account still exists
        const user = await User.findById(decoded.userId)
            .select("_id role");

        if (!user) {
            return res.status(401).json({
                message: "User account no longer exists."
            });
        }

        // Use current account information from MongoDB
        req.userId = user._id.toString();
        req.userRole = user.role;

        next();

    } catch (error) {
        console.error("Authentication database error:", error);

        return res.status(500).json({
            message: "Unable to verify user account."
        });
    }
};

module.exports = authMiddleware;
