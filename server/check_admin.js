import mongoose from 'mongoose';
import User from './models/User.js';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const manageAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Part 1: Migration Helper (Only checking, no deletion)
        console.log('\n--- Checking User table for old admins ---');
        const oldAdmins = await User.find({ role: 'admin' });
        if (oldAdmins.length > 0) {
            console.log(`⚠️ Found ${oldAdmins.length} admins in the User table.`);
            console.log('   (They should be moved to the Admin table or removed for security)');
        } else {
            console.log('✅ No admins found in User table.');
        }

        // Part 2: Checking the new Admin table
        console.log('\n--- Checking new Admin table ---');
        const admins = await Admin.find({});

        if (admins.length === 0) {
            console.log('❌ No admin users found in the new Admin collection.');
            console.log('   (Manually add an admin via MongoDB Atlas if needed)');
        } else {
            console.log(`✅ Total admins in Admin collection: ${admins.length}`);
            admins.forEach(admin => {
                console.log(`- Email: ${admin.email}`);
                console.log(`  ID: ${admin._id}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error during admin check:', error);
        process.exit(1);
    }
};

manageAdmins();
