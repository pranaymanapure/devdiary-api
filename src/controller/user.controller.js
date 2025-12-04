import { User } from "../modals/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.service.js";

const generateAccessAndRefreshToken = async (userID) => {
    try {
        const user = await User.findById(userID);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Error while generating Access and Refresh Tokens"
        );
    }
};

const cookiesOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    // domain: process.env.FRONTEND_DOMAIN,
};

const registerUser = asyncHandler(async (req, res) => {
    const { email, password, fullname } = req.body;
    if (!email || !password || !fullname) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUserWithFullName = await User.findOne({ fullname });
    if (existingUserWithFullName) {
        throw new ApiError(400, "Full Name is already taken");
    }
    const existingUserWithEmail = await User.findOne({ email });
    if (existingUserWithEmail) {
        throw new ApiError(400, "Email is already registered");
    }

    // local file path
    let avatarLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.avatar) &&
        req.files.avatar.length > 0
    ) {
        avatarLocalPath = req?.files?.avatar[0].path;
    } else {
        throw new ApiError(400, "Avatar image is missing");
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    // check if email is valid
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
        throw new ApiError(400, "Please provide a valid Gmail address");
    }

    // upload image to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath, "Avatar");
    if (!avatar) {
        throw new ApiError(
            500,
            "Error while uploading avatar image on cloudinary"
        );
    }

    const user = await User.create({
        email,
        password,
        fullname,
        avatar: avatar.secure_url,
        avatarCloudinaryId: avatar.public_id,
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User registered successfully")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "Email and Password are required");
    }

    // check if email is valid
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
        throw new ApiError(400, "Please provide a valid Gmail address");
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.isPasswordCorrect(password))) {
        throw new ApiError(401, "Invalid Email or Password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookiesOptions)
        .cookie("refreshToken", refreshToken, cookiesOptions)
        .json(
            new ApiResponse(
                200,
                loggedInUser,
                accessToken,
                refreshToken,
                "User logged in successfully"
            )
        );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await req.user;
    console.log(user);

    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Current user fetched successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    return res
        .status(200)
        .clearCookie("accessToken", cookiesOptions)
        .clearCookie("refreshToken", cookiesOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, getCurrentUser, logoutUser };
