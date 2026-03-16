import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import healthcheckRoutes from "./routes/healthcheck.routes.js";
import userRoutes from "./routes/user.routes.js";

app.use("/api/users", userRoutes);
app.use("/api/healthcheck", healthcheckRoutes);

import blogRoutes from "./routes/blog.routes.js";

app.use("/api/blogs", blogRoutes);

// Global error handler — converts ApiError to JSON response
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || [],
    });
});

export default app;
