import express from "express";
import dotenv from "dotenv";
import connectDB from "../src/db/index.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("<h1>hello world</h1>");
});

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.info(
                `Server is running on port ${PORT} in ${
                    process.env.NODE_ENV || "development"
                } mode`
            );
        });
    })
    .catch((error) => {
        console.error(`MongoDB Connection Error: ${error.message}`);
    });
