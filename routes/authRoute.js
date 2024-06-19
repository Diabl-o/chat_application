import express from "express";
import {
  registerUser,
  checkOtp,
  loginUser,
  logout,
} from "../controller/authController.js";
import { refreshAccessToken } from "../middleware/authMiddleware.js";

const authRoute = express.Router();

authRoute.post("/register", registerUser);
authRoute.post("/otpVerify", checkOtp);
authRoute.post("/login", loginUser);
authRoute.post("/token", refreshAccessToken);
authRoute.post("/logout", logout);

export default authRoute;
