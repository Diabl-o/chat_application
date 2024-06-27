import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { transporter, sendMail } from "../config/nodeMailer.js";
import dotenv from "dotenv";
import sessionModel from "../models/sessionModel.js";

dotenv.config();

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
//Register
async function registerUser(req, res) {
  const { name, username, email, password } = req.body;
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
    const otp_expiry = new Date(Date.now() + 3 * 60 * 1000);
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
      text: `Your OTP is ${otp}. It will expire in 3 minutes.`,
    };

    sendMail(mailOptions);

    await user.save();
    res.status(201).json({
      message: "User registered successfully",
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}
//VerifyOtp
async function checkOtp(req, res) {
  const { email, otp } = req.body;
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
        error: true,
      });
    }
    const jwtAccessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    const jwtRefreshToken = jwt.sign(
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
      success: true,
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
  const authHeader = req.headers["authorization"];
  const refreshToken = authHeader && authHeader.split(" ")[1];
  if (refreshToken == null) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  try {
    await sessionModel.findOneAndDelete({ jwtRefreshToken: refreshToken });
    return res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}
//send reset password email
const sendResetPasswordEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
      });
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_RESET_SECRET,
      { expiresIn: "10m" }
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `You requested a password reset. Please click the link below to reset your password:\n\n ${resetUrl}\n\nThis link will expire in 10 minutes.`;

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset",
      text: message,
    });

    res.status(200).json({
      message: "Password reset email sent",
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
//reset password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
        error: true,
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await sessionModel.deleteMany({ userId: user._id });

    res.status(200).json({
      message: "Password reset successfully",
      success: true,
    });
  } catch (error) {
    res.status(403).json({
      message: "Forbidden",
      error: error.message,
    });
  }
};
//resend otp
const resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
      });
    }
    const otp = generateOtp();
    const otp_expiry = new Date(Date.now() + 3 * 60 * 1000);
    user.otp = otp;
    user.otp_expiry = otp_expiry;
    user.save();
    const mailOptions = {
      from: process.env.Email,
      to: email,
      subject: "Verify your email",
      text: `Your OTP is ${otp}. It will expire in 3 minutes.`,
    };
    sendMail(mailOptions);
    return res.status(200).json({
      message: "OTP sent successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export {
  registerUser,
  checkOtp,
  loginUser,
  logout,
  sendResetPasswordEmail,
  resetPassword,
  resendOtp,
};
