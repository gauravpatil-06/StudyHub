import axios from "axios";
import { config } from "dotenv";
config();

async function test() {
    try {
        const res = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'your-gmail-here@gmail.com',
            password: 'password'
        });
        const token = res.data.token;
        console.log("Got token.");

        const r = await axios.get('http://localhost:5001/api/analytics/weekly?days=all&localDate=2026-03-07', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Weekly Data Length:", r.data.length);
        console.log(r.data.slice(0, 2));
        console.log(r.data.slice(-2));
    } catch (err) {
        console.error(err.response ? err.response.data : err.message);
    }
}
test();
