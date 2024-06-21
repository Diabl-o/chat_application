import express from "express";
import { changePassword, profile } from "../controller/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const userRoute = express.Router();

userRoute.get("/profile", authenticateToken, profile);
userRoute.post("/changePassword", authenticateToken, changePassword);

export default userRoute;
