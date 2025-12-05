import { Router } from "express";
import {
    changeUserPassword,
    getCurrentUser,
    loginUser,
    logoutUser,
    registerUser,
    updateUserAvatar,
    updateUserDetails,
} from "../controller/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router
    .route("/register")
    .post(upload.fields([{ name: "avatar", maxCount: 1 }]), registerUser);
router.route("/login").post(loginUser);
router.route("/").get(verifyJWT, getCurrentUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/update-details").put(verifyJWT, updateUserDetails);
router.route("/change-password").put(verifyJWT, changeUserPassword);
router
    .route("/update-avatar")
    .put(verifyJWT, upload.single("avatar"), updateUserAvatar);

export default router;
