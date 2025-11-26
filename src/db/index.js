import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
    try {
        const mongooseInstance = await mongoose.connect(
            `${process.env.MONGODB_URL}/${DB_NAME}`
        );
        if (process.env.NODE_ENV !== "production") {
            console.log(
                `\n MongoDB connected! ${mongooseInstance.connection.host}`
            );
        }
    } catch (error) {
        console.log("MongoDB Connection Error", error);
        process.exit(1);
    }
};
export default connectDB;
