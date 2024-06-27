import express from "express";
import {
  registerUser,
  checkOtp,
  loginUser,
  logout,
  sendResetPasswordEmail,
  resetPassword,
  resendOtp,
} from "../controller/authController.js";
import { refreshAccessToken } from "../middleware/authMiddleware.js";
import {
  registerSchema,
  loginSchema,
  otpVerifySchema,
} from "../validation/joivalidation.js";
import validate from "../middleware/validationMiddleware.js";
const authRoute = express.Router();

authRoute.post("/register", validate(registerSchema), registerUser);
authRoute.post("/otpVerify", validate(otpVerifySchema), checkOtp);
authRoute.post("/login", validate(loginSchema), loginUser);
authRoute.post("/token", refreshAccessToken);
authRoute.post("/logout", logout);
authRoute.post("/sendResetPasswordEmail", sendResetPasswordEmail);
authRoute.post("/resetPassword", resetPassword);
authRoute.post("/resendOtp", resendOtp);

export default authRoute;
