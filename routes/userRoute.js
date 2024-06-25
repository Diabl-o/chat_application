import express from "express";
import {
  changePassword,
  createRoom,
  profile,
  searchUser,
} from "../controller/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const userRoute = express.Router();

userRoute.get("/profile", authenticateToken, profile);
userRoute.post("/changePassword", authenticateToken, changePassword);
userRoute.post("/searchUser", authenticateToken, searchUser);
userRoute.post("/createRoom", authenticateToken, createRoom);
export default userRoute;
