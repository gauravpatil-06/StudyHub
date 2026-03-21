import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { MaterialProvider } from './context/MaterialContext';
import { AppLayout } from './components/layout/AppLayout';
import { PageLoader } from './components/ui/PageLoader';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { Auth } from './pages/Auth.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { AllTasks } from './pages/AllTasks.jsx';
import { TodayTasks } from './pages/TodayTasks.jsx';
import { History } from './pages/History.jsx';
import { Settings } from './pages/Settings.jsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { AdminUsers } from './pages/admin/AdminUsers.jsx';
import { AdminLeaderboard } from './pages/admin/AdminLeaderboard.jsx';
import { AdminMaterials } from './pages/admin/AdminMaterials.jsx';
import { AdminTasks } from './pages/admin/AdminTasks.jsx';
import { AdminStudyHours } from './pages/admin/AdminStudyHours.jsx';
import { AdminFeedback } from './pages/admin/AdminFeedback.jsx';
import { AdminAnalytics } from './pages/admin/AdminAnalytics.jsx';
import { Profile } from './pages/Profile.jsx';
import { StudyMaterials } from './pages/StudyMaterials.jsx';
import { Analytics } from './pages/Analytics.jsx';
import { ActivityLog } from './pages/ActivityLog.jsx';
import { About } from './pages/About.jsx';
import { Feedback } from './pages/Feedback.jsx';

function AppRoutes() {
  const { isSessionValid, isLoading, user } = useAuth();

  const getHomeRoute = () => user?.role === 'admin' ? '/admin-dashboard' : '/dashboard';

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={isSessionValid ? <Navigate to={getHomeRoute()} /> : <Auth />} />
      <Route path="/register" element={isSessionValid ? <Navigate to={getHomeRoute()} /> : <Auth />} />
      <Route path="/" element={isSessionValid ? <Navigate to={getHomeRoute()} /> : <Navigate to="/login" />} />

      {/* Protected Routes wrapped in AppLayout */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/all-tasks" element={<AllTasks />} />
        <Route path="/today" element={<TodayTasks />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/study-materials" element={<StudyMaterials />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/activity-log" element={<ActivityLog />} />
        <Route path="/feedback" element={<Feedback />} />

        {/* Admin Routes */}
        {user?.role === 'admin' && (
          <>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/leaderboard" element={<AdminLeaderboard />} />
            <Route path="/admin/materials" element={<AdminMaterials />} />
            <Route path="/admin/tasks" element={<AdminTasks />} />
            <Route path="/admin/study-hours" element={<AdminStudyHours />} />
            <Route path="/admin/feedback" element={<AdminFeedback />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
          </>
        )}

        <Route path="/" element={<Navigate to={getHomeRoute()} replace />} />
        <Route path="*" element={<Navigate to={getHomeRoute()} replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
      <AuthProvider>
        <TaskProvider>
          <MaterialProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </MaterialProvider>
        </TaskProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
