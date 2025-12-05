import express from "express";
import cookieParser from "cookie-parser";

const app = express();
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

export default app;
