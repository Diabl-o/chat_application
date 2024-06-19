import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/nodeMailer.js";
import dotenv from "dotenv";
import sessionModel from "../models/sessionModel.js";

import {
  registerSchema,
  loginSchema,
  otpVerifySchema,
} from "../validation/joivalidation.js";

dotenv.config();

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
//Register
async function registerUser(req, res) {
  const { name, username, email, password } = req.body;
  const { error } = registerSchema.validate({
    name,
    username,
    email,
    password,
  });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const checkEmail = await userModel.findOne({ email });
    if (checkEmail) {
      return res.status(400).json({
        message: "Email already exists",
        error: true,
      });
    }
    const checkUsername = await userModel.findOne({ username });
    if (checkUsername) {
      return res.status(400).json({
        message: "Username already exists",
        error: true,
      });
    }
    const otp = generateOtp();
    const otp_expiry = new Date(Date.now() + 10 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({
      name,
      username,
      email,
      password: hashedPassword,
      otp,
      otp_expiry,
    });

    const mailOptions = {
      from: process.env.Email,
      to: email,
      subject: "Verify your email",
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Error sending email" });
      } else {
        console.log(info.response);
      }
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}
//VerifyOtp
async function checkOtp(req, res) {
  const { email, otp } = req.body;
  const { error } = otpVerifySchema.validate({ email, otp });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.otp !== otp || user.otp_expiry < Date.now()) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    } else {
      user.is_verified = true;
      user.otp = undefined;
      user.otp_expiry = undefined;
      await user.save();
      res.status(201).json({ message: "Email verified successfully" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}
//Login
async function loginUser(req, res) {
  const { email, password } = req.body;
  const { error } = loginSchema.validate({ email, password });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid Email",
        error: true,
      });
    }
    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(400).json({
        message: "Invalid Password",
        error: true,
      });
    }
    const verified = user.is_verified;
    if (!verified) {
      return res.status(400).json({
        message: "Email not verified.",
      });
    }
    const jwtAccessToken = await jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "2m",
      }
    );
    const jwtRefreshToken = await jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );
    const session = new sessionModel({
      userId: user._id,
      jwtRefreshToken: jwtRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
    });
    await session.save();
    res.status(200).json({
      message: "Logged in successfully.",
      jwtAccessToken,
      jwtRefreshToken,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}
//logout
async function logout(req, res) {
  const refreshToken = req.body.jwtRefreshToken;
  if (refreshToken == null) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  try {
    await sessionModel.findOneAndDelete({ jwtRefreshToken: refreshToken });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

export { registerUser, checkOtp, loginUser, logout };
