import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Award, CheckCircle, XCircle, Clock, Briefcase, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../features/authStore';
import { CardSkeleton } from '../../components/LoadingSkeleton';

export default function AlumniDashboard() {
  const { getRoleUser } = useAuthStore();
  const user = getRoleUser('alumni');
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [profileRes, requestsRes] = await Promise.all([
          api.get('/alumni/profile'),
          api.get('/alumni/mentorship/requests'),
        ]);
        setProfile(profileRes.data.data);
        setRequests(requestsRes.data.data);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  const handleRespond = async (id, status, responseMsg = '') => {
    try {
      await api.put(`/alumni/mentorship/requests/${id}`, { status, response: responseMsg });
      toast.success(`Request ${status}`);
      setRequests(requests.map(r => r._id === id ? { ...r, status, response: responseMsg } : r));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <CardSkeleton count={4} />;

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const acceptedCount = requests.filter(r => r.status === 'accepted').length;

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-700 to-primary-800 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}! 🎓</h1>
        <p className="text-primary-200">Help guide the next generation of professionals.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Company', value: profile?.company || '-', icon: Briefcase, color: 'bg-blue-500' },
          { label: 'Mentees', value: acceptedCount, icon: Users, color: 'bg-emerald-500' },
          { label: 'Pending', value: pendingRequests.length, icon: Clock, color: 'bg-amber-500' },
          { label: 'Mentorship', value: profile?.isAvailableForMentorship ? 'Active' : 'Off', icon: Award, color: profile?.isAvailableForMentorship ? 'bg-green-500' : 'bg-gray-400' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
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

      {/* Career Timeline */}
      {profile?.careerPath?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">My Career Journey</h3>
          <div className="relative pl-6 border-l-2 border-primary-200 space-y-4">
            {[...profile.careerPath].sort((a, b) => a.year - b.year).map((step, j, arr) => (
              <div key={j} className="relative">
                <div className={`absolute -left-[25px] top-1 w-3.5 h-3.5 rounded-full border-2 ${j === arr.length - 1 ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-400'}`} />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{step.role}</p>
                  <p className="text-xs text-gray-500">{step.company} · {step.year}{j === arr.length - 1 ? ' – Present' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Mentorship Requests */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-violet-500" /> Mentorship Requests
            {pendingRequests.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-bold rounded-full">{pendingRequests.length} new</span>
            )}
          </h3>
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No pending mentorship requests. 🎉</p>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req, i) => (
              <motion.div key={req._id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-bold flex-shrink-0">
                    {req.studentId?.name?.[0] || 'S'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 text-sm">{req.studentId?.name}</h4>
                      <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                    {req.studentProfile && (
                      <p className="text-xs text-gray-500">{req.studentProfile.department} · Sem {req.studentProfile.semester} · CGPA: {req.studentProfile.cgpa}</p>
                    )}
                    {req.studentProfile?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {req.studentProfile.skills.slice(0, 4).map((s, j) => (
                          <span key={j} className="px-1.5 py-0.5 bg-primary-50 text-primary-600 text-xs rounded">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <span className="px-2 py-0.5 bg-violet-50 text-violet-600 text-xs font-medium rounded-md">{req.topic}</span>
                  <p className="text-sm text-gray-600 mt-1">{req.message}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => {
                    const msg = prompt('Optional: Add a response message for the student');
                    handleRespond(req._id, 'accepted', msg || '');
                  }}
                    className="flex-1 px-4 py-2 bg-green-500 text-white text-xs font-semibold rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Accept
                  </button>
                  <button onClick={() => handleRespond(req._id, 'declined', 'Unable to mentor at this time.')}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-300 transition-colors flex items-center justify-center gap-1">
                    <XCircle className="w-3 h-3" /> Decline
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Update Profile', to: '/alumni/profile', icon: Users },
          { label: 'View Messages', to: '/alumni/messages', icon: MessageSquare },
          { label: 'Browse Students', to: '/alumni/students', icon: Award },
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
