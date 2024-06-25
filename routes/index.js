import express from "express";
import authRoute from "./authRoute.js";
import userRoute from "./userRoute.js";

const router = express.Router();

const path = "/api-v2/";

router.use(path + "auth", authRoute); // /api-v2/auth/
router.use(path, userRoute); // /api-v2/users

export default router;
