import mongoose from "mongoose";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Task from "./models/Task.js";
import StudyLog from "./models/StudyLog.js";

config(); // load .env in the same dir

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const userId = new mongoose.Types.ObjectId("69a67bed4911fa7be57f97c9");

    const numDays = 7;
    const [y, m, d] = "2026-03-07".split('-').map(Number);
    const todayStart = new Date(Date.UTC(y, m - 1, d));

    const days = [];
    for (let i = numDays - 1; i >= 0; i--) {
        days.push(new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000));
    }

    const since = days[0];
    const [tasks, logs] = await Promise.all([
        Task.find({ userId, createdAt: { $gte: since } }),
        StudyLog.find({ userId, date: { $gte: since } }),
    ]);

    console.log("Tasks found:", tasks.length);
    console.log("Logs found:", logs.length);

    const result = days.map(day => {
        const dayEnd = new Date(day.getTime() + 24 * 60 * 60 * 1000);

        const dayTasks = tasks.filter(t => {
            const td = new Date(t.createdAt);
            return td >= day && td < dayEnd;
        });
        const completedDay = dayTasks.filter(t => t.status === 'completed').length;

        const log = logs.find(l => {
            const ld = new Date(l.date);
            return ld >= day && ld < dayEnd;
        });

        const studyHours = log ? parseFloat(((log.studyHours || 0) + (log.codingHours || 0) + (log.watchingHours || 0)).toFixed(2)) : 0;

        return {
            date: day.toISOString(),
            totalTasks: dayTasks.length,
            completedTasks: completedDay,
            studyHours,
        };
    });

    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
}
run().catch(console.error);
