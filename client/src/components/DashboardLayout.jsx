import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, User, Briefcase, FileText, Users, MessageSquare, Bell, LogOut,
  ChevronLeft, ChevronRight, GraduationCap, BarChart3, UserCheck, Menu, X, Globe, Target, Brain
} from 'lucide-react';
import useAuthStore from '../features/authStore';

const navItems = {
  student: [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/profile', icon: User, label: 'My Profile' },
    { to: '/student/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/student/applications', icon: FileText, label: 'Applications' },
    { to: '/student/resume-builder', icon: FileText, label: 'Resume Builder' },
    { to: '/student/alumni', icon: Users, label: 'Alumni' },
    { to: '/student/mentorship', icon: GraduationCap, label: 'Mentorship' },
    { to: '/student/external-jobs', icon: Globe, label: 'External Jobs' },
    { to: '/student/career-insights', icon: Target, label: 'Career Insights' },
    { to: '/student/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/student/notifications', icon: Bell, label: 'Notifications' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/students', icon: GraduationCap, label: 'Students' },
    { to: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/admin/alumni', icon: UserCheck, label: 'Alumni' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/predictive-analytics', icon: Brain, label: 'Predictions' },
  ],
  alumni: [
    { to: '/alumni/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/alumni/profile', icon: User, label: 'My Profile' },
    { to: '/alumni/messages', icon: MessageSquare, label: 'Messages' },
  ],
};

export default function DashboardLayout({ role }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { getRoleUser, logout } = useAuthStore();
  const user = getRoleUser(role);
  const navigate = useNavigate();
  const items = navItems[role] || [];

  const handleLogout = async () => {
    await logout(role);
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-primary-600/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold text-xl">
            P
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
              <h1 className="font-bold text-lg tracking-tight">PlaceIQ</h1>
              <p className="text-xs text-primary-200 capitalize">{role} Panel</p>
            </motion.div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white/20 text-white shadow-lg shadow-primary-900/20'
                  : 'text-primary-100 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-primary-600/30">
        <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
            {user?.name?.[0] || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-primary-200 truncate">{user?.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-primary-100 hover:bg-white/10 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.2 }}
        className="hidden lg:flex flex-col bg-gradient-to-b from-primary-700 to-primary-900 text-white relative"
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 w-6 h-6 bg-primary-700 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white hover:bg-primary-600 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 h-full w-[260px] bg-gradient-to-b from-primary-700 to-primary-900 text-white z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Welcome,</span>
            <span className="text-sm font-semibold text-gray-800">{user?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full capitalize">
              {role}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
