import mongoose, { Schema } from "mongoose";

const blogSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        subtitle: {
            type: String,
            trim: true,
        },

        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        content: {
            type: String,
            required: true,
        },

        thumbnail: {
            type: String, // Cloudinary URL
            required: true,
        },

        thumbnailCloudinaryId: {
            type: String, // Cloudinary ID
            required: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },

        visibility: {
            type: Boolean,
            default: true, // true = public, false = private
        },
    },
    { timestamps: true }
);

// Index for faster slug lookup
blogSchema.index({ slug: 1 });

export const Blog = mongoose.model("Blog", blogSchema);
