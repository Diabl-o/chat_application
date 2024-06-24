import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import sessionModel from "../models/sessionModel.js";
dotenv.config();

async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.userId = decoded.userId;

    next();
  });
}

const verifyJWT = async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    const err = new Error("Authentication error");
    err.data = { message: "No token provided" };
    return next(err);
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      const err = new Error("Authentication error");
      err.data = { message: "Failed to authenticate token" };
      return next(err);
    }
    socket.userId = decoded; // Store user id in socket object
    next();
  });
};

async function refreshAccessToken(req, res) {
  const authHeader = req.headers["authorization"];
  const refreshToken = authHeader && authHeader.split(" ")[1];
  if (refreshToken == null) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const { userId } = decoded;

    const session = await sessionModel.findOne({
      userId: userId,
      jwtRefreshToken: refreshToken,
    });
    if (!session || session.expires_at < new Date()) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token." });
    }

    const newAccessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.status(200).json({
      message: "New AccessToken Generated.",
      jwtAccessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(403).json({
      message: "Forbidden",
      error: error.message,
    });
  }
}

export { authenticateToken, refreshAccessToken, verifyJWT };
