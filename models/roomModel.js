import mongoose from "mongoose";

import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    room_name: {
      type: String,
      required: true,
    },
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const roomModule = mongoose.model("Room", roomSchema);

export default roomModule;
