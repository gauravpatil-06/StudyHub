import mongoose from "mongoose";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Task from "./models/Task.js";
import StudyLog from "./models/StudyLog.js";

config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const userId = new mongoose.Types.ObjectId("69a67bed4911fa7be57f97c9");

    const daysParam = 'all';

    const todayStart = new Date(Date.UTC(2026, 2, 7)); // 2026-03-07
    let numDays = 7;

    if (daysParam === 'all') {
        const [earliestTask, earliestLog] = await Promise.all([
            Task.findOne({ userId }).sort({ createdAt: 1 }).select('createdAt'),
            StudyLog.findOne({ userId }).sort({ date: 1 }).select('date')
        ]);
        console.log("earliestTask:", earliestTask);
        console.log("earliestLog:", earliestLog);

        let earliest = todayStart.getTime();
        if (earliestTask && new Date(earliestTask.createdAt).getTime() < earliest) earliest = new Date(earliestTask.createdAt).getTime();
        if (earliestLog && new Date(earliestLog.date).getTime() < earliest) earliest = new Date(earliestLog.date).getTime();

        const diffDays = Math.ceil((todayStart.getTime() - earliest) / (24 * 60 * 60 * 1000)) + 1;
        numDays = Math.max(7, Math.min(diffDays, 365)); // At least 7 days, max 365 days
    }

    console.log("NumDays calculated:", numDays);

    const days = [];
    for (let i = numDays - 1; i >= 0; i--) {
        days.push(new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000));
    }

    const since = days[0];
    const [tasks, logs] = await Promise.all([
        Task.find({ userId, createdAt: { $gte: since } }),
        StudyLog.find({ userId, date: { $gte: since } }),
    ]);

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
            shortLabel: day.toLocaleDateString(),
            totalTasks: dayTasks.length,
            studyHours,
        };
    });

    console.log(JSON.stringify(result));
    process.exit(0);
}
run().catch(console.error);
