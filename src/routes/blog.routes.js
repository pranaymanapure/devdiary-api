import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

import {
    createBlog,
    updateBlog,
    deleteBlog,
    getAllBlogs,
    getBlogBySlug,
    getMyBlogs,
} from "../controller/blog.controller.js";

const router = Router();

// Create blog
router.post(
    "/create",
    verifyJWT,
    upload.single("thumbnail"), // thumbnail field in form
    createBlog
);

// Update blog
router.put("/update/:id", verifyJWT, upload.single("thumbnail"), updateBlog);

// Delete blog
router.delete("/delete/:id", verifyJWT, deleteBlog);

// Get all PUBLIC blogs
router.get("/", getAllBlogs);

// Get the logged-in user's blogs
router.get("/my-blogs", verifyJWT, getMyBlogs);

// Get blog by slug
router.get("/:slug", getBlogBySlug);

export default router;
