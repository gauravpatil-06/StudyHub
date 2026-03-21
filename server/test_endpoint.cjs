
const mongoose = require('mongoose');
const http = require('http');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async ()=>{
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'gp949958@gmail.com' });
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET);
  console.log('Sending request...');
  
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/analytics/summary?days=7d',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  };
  
  const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Summary response:', data);
      
      const opt2 = { ...options, path: '/api/analytics/recent?days=7d' };
      http.request(opt2, res2 => {
        let d2 = '';
        res2.on('data', c2 => d2+=c2);
        res2.on('end', () => {
             console.log('Recent response:', d2);
             process.exit(0);
        });
      }).end();
    });
  });
  
  req.on('error', e => console.error(e));
  req.end();
});

