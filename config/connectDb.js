import mongoose from "mongoose";

async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    mongoose.connection.on("Connected", () => {
      console.log("Connected to MongoDB");
    });
    mongoose.connection.on("error", (error) => {
      console.error("Error in MongoDB connection:", error);
    });
  } catch (error) {
    console.log("Something is wrong:", error);
    process.exit(1);
  }
}

export default connectDb;
