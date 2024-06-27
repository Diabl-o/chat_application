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
  const updateFields = {};

  // Only include fields that are provided in the request body
  if (name) updateFields.name = name;
  if (profile_pic) updateFields.profile_pic = profile_pic;
  if (phone) updateFields.phone = phone;
  if (about) updateFields.about = about;

  try {
    const updatedUser = await userModel.findByIdAndUpdate(
      req.userId,
      { $set: updateFields },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
        error: true,
      });
    }

    return res.status(200).json({
      message: "User updated successfully",
      success: true,
      user: updatedUser,
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
const addUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
      });
    }
    const { roomId, roomUsers } = req.body;
    const roomUser = await roomUserModel.findOne({
      userId: req.userId,
      roomId: roomId,
      isAdmin: true,
    });

    if (!roomUser) {
      return res.status(403).json({
        message: "You are not an admin of this room",
        error: true,
      });
    }
    const newUsers = await userModel.find({ _id: { $in: roomUsers } });
    if (newUsers.length !== roomUsers.length) {
      return res.status(404).json({
        message: "One or more users not found",
        error: true,
      });
    }
    const roomUserEntries = roomUsers.map((userId) => ({
      userId,
      roomId,
      isAdmin: false,
    }));
    await roomUserModel.insertMany(roomUserEntries);
    return res.status(200).json({
      message: "Users added successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
const removeUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
      });
    }
    const { roomId, userId } = req.body;
    const adminCheck = await roomUserModel.findOne({
      userId: req.userId,
      roomId: roomId,
      isAdmin: true,
    });

    if (!adminCheck) {
      return res.status(403).json({
        message: "You are not an admin of this room",
        error: true,
      });
    }
    const roomUser = await roomUserModel.findOneAndDelete({ roomId, userId });
    if (!roomUser) {
      return res.status(404).json({
        message: "User not found in the room",
        error: true,
      });
    }
    return res.status(200).json({
      message: "User removed successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateRoom = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
      });
    }

    const { roomId, roomName, adminUser } = req.body;
    const adminCheck = await roomUserModel.findOne({
      userId: req.userId,
      roomId: roomId,
      isAdmin: true,
    });

    if (!adminCheck) {
      return res.status(403).json({
        message: "You are not an admin of this room",
        error: true,
      });
    }
    const room = await roomModule.find({ roomId });
    if (!room) {
      return res.status(404).json({
        message: "Room not found",
        error: true,
      });
    }
    const updateFields = {};
    if (roomName) updateFields.room_name = roomName;
    if (adminUser && mongoose.Types.ObjectId.isValid(adminUser))
      updateFields.admin_id = adminUser;

    const updatedRoom = await roomModule.findByIdAndUpdate(
      roomId,
      { $set: updateFields },
      { new: true }
    );

    return res.status(200).json({
      message: "Room updated successfully",
      success: true,
      room: updatedRoom,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export {
  profile,
  changePassword,
  updateUser,
  searchUser,
  createRoom,
  addUser,
  removeUser,
  updateRoom,
};
