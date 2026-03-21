import mongoose from "mongoose";
import { config } from "dotenv";
import StudyLog from "./models/StudyLog.js";

config();

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    const userId = new mongoose.Types.ObjectId("69a67bed4911fa7be57f97c9");
    const logs = await StudyLog.find({ userId }).lean();
    logs.forEach((l, i) => {
        console.log(`Log ${i}:`, {
            date: l.date,
            studyHours: l.studyHours,
            codingHours: l.codingHours,
            watchingHours: l.watchingHours,
        });
    });

    // Simulate what the route does
    const total = logs.reduce((s, l) => s + ((l.studyHours || 0) + (l.codingHours || 0) + (l.watchingHours || 0)), 0);
    console.log("Total computed:", total);

    process.exit(0);
}
test().catch(console.error);
