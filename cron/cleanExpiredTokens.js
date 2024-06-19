import cron from "node-cron";
import sessionModel from "../models/sessionModel.js";

cron.schedule("0 0 * * *", async () => {
  try {
    const result = await sessionModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    console.log(`Deleted ${result.deletedCount} expired tokens`);
  } catch (error) {
    console.error("Error deleting expired tokens:", error);
  }
});
