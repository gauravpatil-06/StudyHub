import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import User from './models/User.js';
import Task from './models/Task.js';
import Material from './models/Material.js';
import Note from './models/Note.js';

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const usersCount = await User.countDocuments();
        const tasksCount = await Task.countDocuments();
        const materialsCount = await Material.countDocuments();
        const notesCount = await Note.countDocuments();

        console.log('--- Data Statistics ---');
        console.log('Users:', usersCount);
        console.log('Tasks:', tasksCount);
        console.log('Materials:', materialsCount);
        console.log('Notes:', notesCount);

        if (usersCount > 0) {
            const users = await User.find({}, 'name email role');
            console.log('\nUsers List:');
            console.table(users.map(u => ({ name: u.name, email: u.email, role: u.role })));
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkData();
