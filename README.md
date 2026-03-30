<h1 align="center">🚀 StudyHub – Smart Learning Productivity Platform</h1>

<p align="center">
  🎓 StudyHub | 📊 Productivity | 🧠 Learning Analytics
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20%7C%20Vite-blue"/>
  <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green"/>
  <img src="https://img.shields.io/badge/Database-MongoDB%20Atlas-orange"/>
  <img src="https://img.shields.io/badge/Status-Production%20Ready-success"/>
</p>


## 📘 About the Project

**StudyHub** is a modern **learning productivity platform** designed to help students
**plan, track, and improve their study performance** efficiently.

It combines **task management, analytics, study tracking, and smart insights**
into one powerful system to build **consistent and focused learning habits**.

---

## 🌍 Project Overview

📌 StudyHub enables users to:

* Plan daily study tasks
* Track study, coding, and watching hours
* Analyze performance using charts & insights
* Maintain consistency using streak tracking
* Manage study materials and resources
* Monitor progress with real-time analytics

💡 Built with a focus on **performance, scalability, and real-world usability**

---

## 🔧 Core Features

| Module              | Features                                       |
| ------------------- | ---------------------------------------------- |
| 👤 Authentication   | Email login, Google OAuth, JWT session         |
| 📊 Dashboard        | Real-time stats, streaks, performance overview |
| ✅ Task Management   | Create, update, track tasks                    |
| ⏱ Study Tracking    | Stopwatch, countdown, study logs               |
| 📈 Analytics        | Charts, trends, productivity score             |
| 📚 Study Materials  | Upload, manage PDFs & notes                    |
| 🧠 Smart Insights   | Study patterns & performance analysis          |
| 🔥 Streak System    | Daily consistency tracking                     |
| 🕓 History Tracking | Past activity logs                             |
| 👨‍💼 Admin Panel   | Users, tasks, analytics management             |
| 🔔 Notifications    | Feedback & activity alerts                     |

---

## 🧠 System Architecture

Frontend → React (Vite)
Backend → Node.js (Express)
Database → MongoDB Atlas

```text
Client (Frontend)
        ↓
REST API (Backend)
        ↓
Database (MongoDB)
```

---

## 📚 Technologies Used

| Category | Technology                   |
| -------- | ---------------------------- |
| Frontend | React.js, Vite, Tailwind CSS |
| Backend  | Node.js, Express.js          |
| Database | MongoDB Atlas                |
| Auth     | JWT, Google OAuth            |
| Charts   | Recharts / Chart.js          |

---

## 📊 Key Functional Modules

| Module      | Description                   |
| ----------- | ----------------------------- |
| Dashboard   | Overview of study performance |
| All Tasks   | Task tracking & completion    |
| Study Hours | Time tracking system          |
| Analytics   | Detailed charts & insights    |
| Materials   | Notes & resource manager      |
| Feedback    | User feedback system          |
| Admin Panel | System-wide monitoring        |

---

## 📂 Project Structure

```bash
StudyHub/
 ├── server/        # Backend (Node.js)
 ├── src/           # Frontend source
 ├── public/
 ├── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Project

```bash
git clone https://github.com/your-username/studyhub.git
cd studyhub
```

---

### 2️⃣ Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend (root folder madheच)
cd ..
npm install
```

---

### 3️⃣ Run Backend Server

```bash
cd server
npm run dev
```

---

### 4️⃣ Run Frontend

```bash
npm run dev
```

---

### 5️⃣ Open in Browser

```text
http://localhost:5173
```

---

## 🌐 Environment Variables

### Frontend (.env)

```env
VITE_API_URL=https://studyhub-backend-1ogz.onrender.com
```

### Backend (.env)

```env
PORT=5001
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 🔒 Security Features

* JWT Authentication
* Password hashing (bcrypt)
* Protected routes
* Input validation
* Secure API handling
