import express from "express";
import authRoute from "./authRoute.js";
import userRoute from "./userRoute.js";

const router = express.Router();

const path = "/api-v2/";

router.use(path + "auth", authRoute, userRoute); // /api-v2/auth/

export default router;
