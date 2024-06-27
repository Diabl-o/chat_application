import express from "express";
import {
  addUser,
  changePassword,
  createRoom,
  profile,
  searchUser,
} from "../controller/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  profileSchema,
  changePasswordSchema,
  updateUserSchema,
  searchUserSchema,
  createRoomSchema,
  addUserSchema,
  removeUserSchema,
  updateRoomSchema,
} from "../validation/joivalidation.js";
import validate from "../middleware/validationMiddleware.js";
const userRoute = express.Router();

userRoute.get("/profile", authenticateToken, validate(profileSchema), profile);
userRoute.post(
  "/changePassword",
  authenticateToken,
  validate(changePasswordSchema),
  changePassword
);
userRoute.post(
  "/searchUser",
  authenticateToken,
  validate(searchUserSchema),
  searchUser
);
userRoute.post(
  "/createRoom",
  authenticateToken,
  validate(createRoomSchema),
  createRoom
);
userRoute.post("/addUser", authenticateToken, validate(addUserSchema), addUser);
export default userRoute;
