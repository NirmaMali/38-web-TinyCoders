import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Code2, FileText, Target, Briefcase, ArrowRight, Bell, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import useAuthStore from '../../features/authStore';
import { CardSkeleton } from '../../components/LoadingSkeleton';

export default function StudentDashboard() {
  const { getRoleUser } = useAuthStore();
  const user = getRoleUser('student');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/student/dashboard');
        setData(res.data.data);
      } catch {}
      setLoading(false);
    };
    fetchDashboard();
  }, []);

  if (loading) return <CardSkeleton count={4} />;

  const stats = [
    { label: 'CGPA', value: data?.profile?.cgpa || '-', icon: BarChart3, color: 'bg-blue-500' },
    { label: 'Skills', value: data?.profile?.skills?.length || 0, icon: Code2, color: 'bg-emerald-500' },
    { label: 'Applications', value: data?.applicationCount || 0, icon: FileText, color: 'bg-purple-500' },
    { label: 'Profile', value: `${data?.profileCompleteness || 0}%`, icon: Target, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-700 to-primary-800 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-primary-200">Track your placement journey and explore opportunities.</p>
          </div>
          {data?.profile?.placementStatus?.isPlaced && (
            <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-semibold rounded-full border border-green-500/30">
              ✅ Placed at {data.profile.placementStatus.company}
            </span>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Eligibility + Profile Completeness Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Profile Completeness Bar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Profile Completeness</h3>
            <span className="text-sm font-bold text-primary-700">{data?.profileCompleteness || 0}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-gradient-to-r from-primary-500 to-primary-700 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${data?.profileCompleteness || 0}%` }} />
          </div>
        </div>

        {/* Eligibility Snapshot */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Job Eligibility</h3>
            <Link to="/student/jobs" className="text-xs text-primary-700 hover:underline">View Jobs →</Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{data?.eligibleCount || 0}</p>
                <p className="text-xs text-gray-500">Eligible</p>
              </div>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div>
              <p className="text-2xl font-bold text-gray-400">{data?.totalActiveJobs || 0}</p>
              <p className="text-xs text-gray-500">Total Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Progress + Mentorship Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Progress Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary-500" /> Academic Progress</h3>
            <Link to="/student/profile" className="text-xs text-primary-700 hover:underline">Edit →</Link>
          </div>
          {data?.academicProgress?.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={data.academicProgress.map(g => ({ name: `Sem ${g.semester}`, sgpa: g.sgpa }))}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="sgpa" stroke="#4f46e5" strokeWidth={2.5} dot={{ fill: '#4f46e5', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <TrendingUp className="w-8 h-8 mb-2" />
              <p className="text-sm">No semester grades added yet.</p>
              <Link to="/student/profile" className="text-xs text-primary-600 mt-1 hover:underline">Add grades →</Link>
            </div>
          )}
        </div>

        {/* Mentorship Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Users className="w-4 h-4 text-violet-500" /> Mentorship</h3>
            <Link to="/student/mentorship" className="text-xs text-primary-700 hover:underline">View All →</Link>
          </div>
          {data?.mentorshipStats?.total > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-amber-50 rounded-xl">
                <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-gray-900">{data.mentorshipStats.pending}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-gray-900">{data.mentorshipStats.accepted}</p>
                <p className="text-xs text-gray-500">Accepted</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <Users className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-gray-900">{data.mentorshipStats.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <Users className="w-8 h-8 mb-2" />
              <p className="text-sm">No mentorship requests yet.</p>
              <Link to="/student/alumni" className="text-xs text-primary-600 mt-1 hover:underline">Browse alumni →</Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Suggested Jobs */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Suggested Jobs</h3>
            <Link to="/student/jobs" className="text-sm text-primary-700 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {data?.suggestedJobs?.length > 0 ? data.suggestedJobs.map((job) => (
              <div key={job._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
                <div>
                  <p className="font-medium text-sm text-gray-800">{job.title}</p>
                  <p className="text-xs text-gray-500">{job.company} · {job.package} LPA</p>
                </div>
                <Briefcase className="w-4 h-4 text-gray-400" />
              </div>
            )) : (
              <p className="text-sm text-gray-400 text-center py-4">No jobs available yet.</p>
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent Notifications</h3>
            <Link to="/student/notifications" className="text-sm text-primary-700 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {data?.notifications?.length > 0 ? data.notifications.map((n) => (
              <div key={n._id} className={`flex items-start gap-3 p-3 rounded-xl ${n.isRead ? 'bg-gray-50' : 'bg-primary-50'}`}>
                <Bell className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-400 text-center py-4">No notifications.</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Update Profile', to: '/student/profile', icon: Target },
          { label: 'Browse Jobs', to: '/student/jobs', icon: Briefcase },
          { label: 'Alumni Network', to: '/student/alumni', icon: Users },
          { label: 'Mentorship', to: '/student/mentorship', icon: TrendingUp },
        ].map((action, i) => (
          <Link key={i} to={action.to}
            className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
              <action.icon className="w-5 h-5 text-primary-700" />
            </div>
            <span className="font-medium text-gray-700">{action.label}</span>
            <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-primary-500 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
