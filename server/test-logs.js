import mongoose from "mongoose";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "./models/User.js";
import StudyLog from "./models/StudyLog.js";
import Activity from "./models/Activity.js";

config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const userId = new mongoose.Types.ObjectId("69a67bed4911fa7be57f97c9");

    const logs = await StudyLog.find({ userId }).sort({ date: -1 });
    console.log("All Study logs:", logs);

    process.exit(0);
}
run().catch(console.error);
