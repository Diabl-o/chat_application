import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./config/connectDb.js";
import router from "./routes/index.js";
import "./cron/cleanExpiredTokens.js";

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();
connectDb();
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.get("/", (req, res) => {
  res.json({
    message: "Server Running at port:" + port,
  });
});

app.use("", router);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
