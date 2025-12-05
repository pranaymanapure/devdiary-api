import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Blog } from "../modals/blog.model.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.service.js";

const createBlog = asyncHandler(async (req, res) => {
    const { title, subtitle, content, slug, visibility } = req.body;

    if (!title || !content || !slug) {
        throw new ApiError(400, "Title, content and slug are required");
    }

    // Check duplicate slug
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
        throw new ApiError(400, "Slug already exists, choose a different one");
    }

    const thumbnailLocalPath = req.file?.path;

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    const uploadResult = await uploadOnCloudinary(thumbnailLocalPath);

    if (!uploadResult) {
        throw new ApiError(500, "Thumbnail upload failed");
    }

    const blog = await Blog.create({
        title,
        subtitle,
        content,
        slug,
        visibility: visibility === "false" ? false : true,
        author: req.user._id,
        thumbnail: uploadResult.secure_url,
        thumbnailCloudinaryId: uploadResult.public_id,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, blog, "Blog created successfully"));
});

const updateBlog = asyncHandler(async (req, res) => {
    const { title, subtitle, content, slug, visibility } = req.body;
    const blogId = req.params.id;

    const blog = await Blog.findById(blogId);

    if (!blog) throw new ApiError(404, "Blog not found");

    if (blog.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized: Not your blog");
    }

    if (title) blog.title = title;
    if (subtitle) blog.subtitle = subtitle;
    if (content) blog.content = content;
    if (slug) blog.slug = slug;

    if (visibility !== undefined) {
        blog.visibility = visibility === "false" ? false : true;
    }

    // Update thumbnail
    if (req.file?.path) {
        const uploadResult = await uploadOnCloudinary(req.file.path);

        await deleteFromCloudinary(blog.thumbnailCloudinaryId);

        blog.thumbnail = uploadResult.secure_url;
        blog.thumbnailCloudinaryId = uploadResult.public_id;
    }

    await blog.save();

    return res.json(new ApiResponse(200, blog, "Blog updated successfully"));
});

const deleteBlog = asyncHandler(async (req, res) => {
    const blogId = req.params.id;

    const blog = await Blog.findById(blogId);

    if (!blog) throw new ApiError(404, "Blog not found");

    if (blog.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized: Not your blog");
    }

    await deleteFromCloudinary(blog.thumbnailCloudinaryId);

    await blog.deleteOne();

    return res.json(new ApiResponse(200, null, "Blog deleted successfully"));
});

const getBlogBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug }).populate(
        "author",
        "fullname email avatar"
    );

    if (!blog) throw new ApiError(404, "Blog not found");

    return res.json(new ApiResponse(200, blog, "Blog fetched"));
});

const getAllBlogs = asyncHandler(async (req, res) => {
    const blogs = await Blog.find({ visibility: true }).populate(
        "author",
        "fullname avatar"
    );

    return res.json(new ApiResponse(200, blogs, "Blogs fetched"));
});

const getMyBlogs = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const blogs = await Blog.find({ author: userId }).populate(
        "author",
        "fullname avatar"
    );

    return res.json(
        new ApiResponse(200, blogs, "User blogs fetched successfully")
    );
});

export {
    createBlog,
    updateBlog,
    deleteBlog,
    getAllBlogs,
    getBlogBySlug,
    getMyBlogs,
};
