import express from "express";
import {
  registerUser,
  checkOtp,
  loginUser,
  logout,
  sendResetPasswordEmail,
  resetPassword,
} from "../controller/authController.js";
import { refreshAccessToken } from "../middleware/authMiddleware.js";

const authRoute = express.Router();

authRoute.post("/register", registerUser);
authRoute.post("/otpVerify", checkOtp);
authRoute.post("/login", loginUser);
authRoute.post("/token", refreshAccessToken);
authRoute.post("/logout", logout);
authRoute.post("/sendResetPasswordEmail", sendResetPasswordEmail);
authRoute.post("/resetPassword", resetPassword);

export default authRoute;
