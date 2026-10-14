const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const classRoutes = require("./routes/classRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const pinRoutes = require("./routes/pinRoutes");
const roomRoutes = require("./routes/roomRoutes");
const scheduleItemRoutes = require("./routes/scheduleItemRoutes");

const app = express();

// Middleware
app.use(helmet());

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins
}));

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/pins", pinRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/schedule-items", scheduleItemRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("Campus Nav API is running!");
});

// Handle unexpected server errors
app.use((err, req, res, next) => {
    console.error("Server error:", err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        message:
            err.status && err.status < 500
                ? err.message
                : "An unexpected server error occurred."
    });
});

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");

        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server running on port ${process.env.PORT || 5000}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });