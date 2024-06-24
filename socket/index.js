import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { verifyJWT } from "../middleware/authMiddleware.js";

dotenv.config();
const app = express();

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

const onlineUsers = new Set();

io.on("connection", async (socket) => {
  console.log("Connected user:", socket.id);
  try {
    await verifyJWT(socket);

    socket.join(socket.userId);
    onlineUsers.add(socket.userId);

    io.emit("onlineUsers", Array.from(onlineUsers.values()));
  } catch (error) {
    console.error("JWT verification error:", error.message);
    socket.disconnect(true);
  }
  socket.on("disconnect", () => {
    onlineUsers.delete(socket.userId);
    console.log("Disconnected user:", socket.id);

    io.emit("onlineUsers", Array.from(onlineUsers.values()));
  });
});

export { app, server };
