import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: { type: String, default: null },
    media_url: { type: String, default: null },
    media_type: { type: String, default: null },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const messageModel = mongoose.model("Message", messageSchema);

export default messageModel;
