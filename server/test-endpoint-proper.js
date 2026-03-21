import mongoose from "mongoose";
import { config } from "dotenv";
import User from "./models/User.js";
import Task from "./models/Task.js";
import StudyLog from "./models/StudyLog.js";
import jwt from "jsonwebtoken";
import axios from "axios";

config();

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findById("69a67bed4911fa7be57f97c9");
        if (!user) { console.error("User not found!"); process.exit(1); }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Test weekly
        try {
            const r = await axios.get('http://localhost:5001/api/analytics/weekly?days=all&localDate=2026-03-07', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("weekly OK, length:", r.data.length);
            console.log("Sample (last 3):", JSON.stringify(r.data.slice(-3), null, 2));
        } catch (e) {
            console.error("weekly ERROR:", e.response?.data || e.message);
        }

        // Test summary
        try {
            const r = await axios.get('http://localhost:5001/api/analytics/summary?days=all&localDate=2026-03-07', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("summary OK:", JSON.stringify(r.data, null, 2));
        } catch (e) {
            console.error("summary ERROR:", e.response?.data || e.message);
        }

    } catch (err) {
        console.error(err.message);
    } finally {
        process.exit(0);
    }
}
test();
