import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import roomModule from "../models/roomModel.js";
import roomUserModel from "../models/roomUserModel.js";

dotenv.config();

async function profile(req, res) {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
      });
    }
    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

const changePassword = async (req, res) => {
  const { oldpassword, newpassword } = req.body;
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
      });
    }
    const isMatch = bcrypt.compare(oldpassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Old password is incorrect",
        error: true,
      });
    }
    const hashedPassword = await bcrypt.hash(newpassword, 10);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({
      message: "Password changed successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
const updateUser = async (req, res) => {
  const { name, phone, about, profile_pic } = req.body;
  try {
    const user = await userModel.findById(req.body.userId);
    user.name = name;
    user.profile_pic = profile_pic;
    user.phone = phone;
    user.about = about;
    user.save();
    return res.status(200).json({
      message: "User updated successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
const searchUser = async (req, res) => {
  try {
    const { search } = req.body;
    const query = new RegExp(search, "i", "g");
    const user = await userModel
      .find({
        $and: [
          {
            $or: [
              {
                name: query,
              },
              {
                email: query,
              },
              {
                username: query,
              },
            ],
          },
          { is_verified: true },
        ],
      })
      .select("-password");
    return res.status(200).json({
      message: "Searched user data",
      data: user,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server error",
      error: error.message,
      error: true,
    });
  }
};
const createRoom = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
      });
    }
    const { room_name, roomUsers } = req.body;
    const checkRoom = await roomModule.findOne({ room_name });
    if (checkRoom) {
      return res.status(400).json({
        message: "Room name already exists",
        error: true,
      });
    }
    const room = new roomModule({
      room_name,
      admin_id: req.userId,
    });
    await room.save();

    const roomUserEntries = [
      { userId: req.userId, roomId: room._id, isAdmin: true },
    ];

    roomUsers.forEach((userId) => {
      roomUserEntries.push({ userId, roomId: room._id });
    });

    await roomUserModel.insertMany(roomUserEntries);

    return res.status(200).json({
      message: "Room Created Successfully.",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
export { profile, changePassword, updateUser, searchUser, createRoom };
