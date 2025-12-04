import dotenv from "dotenv";
import connectDB from "../src/db/index.js";
import app from "./app.js";

dotenv.config({
    path: "./.env",
});
const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.error(`Server Error: ${error.message}`);
        });
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
