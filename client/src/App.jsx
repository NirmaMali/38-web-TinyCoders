import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './features/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentJobs from './pages/student/Jobs';
import StudentApplications from './pages/student/Applications';
import StudentResumeBuilder from './pages/student/ResumeBuilder';
import StudentAlumni from './pages/student/Alumni';
import StudentMentorship from './pages/student/Mentorship';
import StudentExternalJobs from './pages/student/ExternalJobs';
import StudentCareerInsights from './pages/student/CareerInsights';
import StudentMessages from './pages/student/Messages';
import StudentNotifications from './pages/student/Notifications';
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminJobs from './pages/admin/Jobs';
import AdminAlumni from './pages/admin/Alumni';
import AdminAnalytics from './pages/admin/Analytics';
import AdminPredictiveAnalytics from './pages/admin/PredictiveAnalytics';
import AlumniDashboard from './pages/alumni/Dashboard';
import AlumniProfile from './pages/alumni/Profile';
import AlumniMessages from './pages/alumni/Messages';

export default function App() {
  const { hasAnySession } = useAuthStore();

  return (
    <Routes>
      {/* Public Routes — always accessible */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student Routes — independently protected */}
      <Route path="/student" element={<ProtectedRoute role="student"><DashboardLayout role="student" /></ProtectedRoute>}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="jobs" element={<StudentJobs />} />
        <Route path="applications" element={<StudentApplications />} />
        <Route path="resume-builder" element={<StudentResumeBuilder />} />
        <Route path="alumni" element={<StudentAlumni />} />
        <Route path="mentorship" element={<StudentMentorship />} />
        <Route path="external-jobs" element={<StudentExternalJobs />} />
        <Route path="career-insights" element={<StudentCareerInsights />} />
        <Route path="messages" element={<StudentMessages />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route index element={<Navigate to="dashboard" />} />
      </Route>

      {/* Admin Routes — independently protected */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><DashboardLayout role="admin" /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="jobs" element={<AdminJobs />} />
        <Route path="alumni" element={<AdminAlumni />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="predictive-analytics" element={<AdminPredictiveAnalytics />} />
        <Route index element={<Navigate to="dashboard" />} />
      </Route>

      {/* Alumni Routes — independently protected */}
      <Route path="/alumni" element={<ProtectedRoute role="alumni"><DashboardLayout role="alumni" /></ProtectedRoute>}>
        <Route path="dashboard" element={<AlumniDashboard />} />
        <Route path="profile" element={<AlumniProfile />} />
        <Route path="messages" element={<AlumniMessages />} />
        <Route index element={<Navigate to="dashboard" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
