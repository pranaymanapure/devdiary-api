import { Router } from "express";
import { check } from "../controller/heathcheck.controller.js";

const router = Router();
router.route("/").get(check);

export default router;
