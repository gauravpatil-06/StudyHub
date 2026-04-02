# 🚀 StudyHub — Smarter Way to Learn, Track, and Stay Consistent

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20%7C%20Vite-blue?style=for-the-badge&logo=react"/>
  <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green?style=for-the-badge&logo=node.js"/>
  <img src="https://img.shields.io/badge/Database-MongoDB%20Atlas-orange?style=for-the-badge&logo=mongodb"/>
  <img src="https://img.shields.io/badge/Styling-Tailwind%20%7C%20MUI-38B2AC?style=for-the-badge&logo=tailwind-css"/>
</p>

---

## 🌟 Introduction

While building **StudyHub**, my goal was simple: *Students shouldn’t have to use multiple apps to manage their learning.* I wanted to create a unified, high-performance ecosystem where every second of focus is tracked, visualized, and rewarded.

This isn't just a UI project; it's a system designed to help students stay focused and consistent. From task orchestration to automated streak tracking, StudyHub is built to help you master your time.

---

## 🚀 How It Works: The Flow

1.  **Seamless Access**: Log in via **Email** or **Google OAuth** for a secure, frictionless experience.
2.  **Strategic Planning**: Rapidly add and organize your daily learning objectives.
3.  **Deep Focus**: Launch an integrated focus session. The system monitors your study, coding, and research hours in real-time.
4.  **Instant Feedback**: Your dashboard updates dynamically, showing your productivity score and progress.
5.  **Momentum Building**: Consistency is rewarded through an automated **Streak System**.

---

## 🔥 Why StudyHub? (Core Features)

| Feature | Description |
| :--- | :--- |
| **📊 Intelligent Dashboard** | A glassmorphic command center showing study hours, trends, and real-time performance analytics. |
| **✅ Precision Task Engine** | Not just a list — a system to add, update, and manage granular learning tasks. |
| **⏱️ Hybrid Focus Timer** | Integrated stopwatch/countdown to eliminate distractions and track active sessions. |
| **🔥 Persistence Engine** | Daily streak tracking logic that builds healthy learning habits automatically. |
| **📂 Material Vault** | Centralized repository for all your notes, research, and PDFs. |
| **📈 Learning Analytics** | Clear and interactive charts (Recharts) to visualize your progress over days, weeks, and months. |
| **🛡️ Admin Panel** | Full-scale administrative panel for system-wide monitoring and user management. |

---

## 🛠️ Technologies Used

> **Tools and technologies used in this project**

*   **Frontend**: React (Vite) + Framer Motion for premium animations.
*   **Styling**: Tailwind CSS + Material UI (MUI) for professional design tokens.
*   **Backend**: Node.js & Express.js (RESTful API architecture).
*   **Database**: MongoDB Atlas with Mongoose modeling.
*   **Security**: JWT (Stateless Auth) + Bcrypt (Hashing) + Protected Middleware.
*   **Integration**: Socket.io for real-time updates (optional) & Axios for efficient data fetching.

---

## 📂 Architecture Overview

```text
StudyHub/
 ├── client/          # Frontend (Vite + React)
 │    ├── src/        # Feature-driven components & pages
 │    └── public/     # Static assets
 ├── server/          # Backend (Node.js + Express)
 │    ├── models/     # MongoDB Schemas
 │    ├── routes/     # API Endpoints
 │    └── middleware/ # Security & Auth logic
 └── package.json     # Orchestration
```

---

## ⚙️ Installation & Setup

### 1. Repository Setup
```bash
git clone https://github.com/gauravpatil-06/StudyHub.git
cd StudyHub
```

### 2. Dependency Management
```bash
# Backend Installation
cd server
npm install

# Frontend Installation
cd ..
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `server` directory and add your credentials:
```env
PORT=5001
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_hyper_secure_secret
GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
```

### 4. Launching the App
```bash
# In the root folder
npm run dev
```

---

## 🛡️ Security & Reliability

*   **Encrypted Communication**: All sensitive data is hashed using industry-standard Bcrypt.
*   **State Integrity**: Protected routes ensuring only authenticated users access the core platform.
*   **Input Sanitation**: Robust validation to prevent common API vulnerabilities.
*   **Live Deployment**: Optimized for Vercel (Frontend) and Render (Backend).

---

> "This project was built from scratch with a focus on solving real friction in a student's daily life. I didn't just want a UI; I wanted a working system that actually changes how we learn."

---

<div align="center">

**🌐 [Live Web App](https://studyhubx.vercel.app/)**

✨ **Making learning simple, focused, and consistent.**

</div>