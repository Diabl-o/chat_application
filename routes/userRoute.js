import express from "express";
import { user } from "../controller/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const userRoute = express.Router();

userRoute.get("/dashboard", authenticateToken, user);

export default userRoute;
