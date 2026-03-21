
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async ()=>{
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'gp949958@gmail.com' });
  const tasks = await db.collection('tasks').find({ userId: user._id }).toArray();
  const acts = await db.collection('activities').find({ userId: user._id }).toArray();
  console.log('Tasks:', tasks.map(t => t.createdAt));
  console.log('Activities:', acts.map(a => a.date));
  process.exit(0);
});

