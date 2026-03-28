import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, CheckCircle, XCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';

export default function StudentMentorship() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/student/mentorship/requests');
        setRequests(data.data);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const statusConfig = {
    pending: { icon: Clock, label: 'Pending', color: 'bg-amber-50 text-amber-600 border-amber-200', iconColor: 'text-amber-500' },
    accepted: { icon: CheckCircle, label: 'Accepted', color: 'bg-green-50 text-green-600 border-green-200', iconColor: 'text-green-500' },
    declined: { icon: XCircle, label: 'Declined', color: 'bg-red-50 text-red-500 border-red-200', iconColor: 'text-red-500' },
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    accepted: requests.filter(r => r.status === 'accepted').length,
    declined: requests.filter(r => r.status === 'declined').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Mentorship Requests</h1>
        <p className="text-gray-500 text-sm">Track your mentorship requests and connect with alumni</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-xs text-amber-600">Pending</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 border border-green-100 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
          <p className="text-xs text-green-600">Accepted</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 border border-red-100 text-center">
          <p className="text-2xl font-bold text-red-500">{stats.declined}</p>
          <p className="text-xs text-red-500">Declined</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'pending', 'accepted', 'declined'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-all capitalize ${
              filter === f ? 'bg-primary-700 text-white shadow-lg shadow-primary-700/25' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {f === 'all' ? 'All' : f} {f !== 'all' && `(${stats[f]})`}
          </button>
        ))}
      </div>

      {loading ? <CardSkeleton count={4} /> : filtered.length === 0 ? (
        <EmptyState title="No mentorship requests" description={filter === 'all' ? 'Browse the alumni network to request guidance.' : `No ${filter} requests.`} icon={Users} />
      ) : (
        <div className="space-y-4">
          {filtered.map((req, i) => {
            const cfg = statusConfig[req.status];
            const StatusIcon = cfg.icon;
            return (
              <motion.div key={req._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-base flex-shrink-0">
                      {req.alumniId?.name?.[0] || 'A'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{req.alumniId?.name}</h3>
                      {req.alumniProfile && (
                        <p className="text-xs text-gray-500">{req.alumniProfile.jobRole} at {req.alumniProfile.company} · {req.alumniProfile.department}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center gap-1 ${cfg.color}`}>
                    <StatusIcon className={`w-3 h-3 ${cfg.iconColor}`} /> {cfg.label}
                  </span>
                </div>

                <div className="mb-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-violet-50 text-violet-600 text-xs font-medium rounded-md">{req.topic}</span>
                    <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600">{req.message}</p>
                </div>

                {req.response && (
                  <div className={`p-3 rounded-xl mb-3 ${req.status === 'accepted' ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                    <p className="text-xs font-medium text-gray-600 mb-1">Alumni Response:</p>
                    <p className="text-sm text-gray-700">{req.response}</p>
                  </div>
                )}

                {req.status === 'accepted' && (
                  <Link to={`/student/messages?to=${req.alumniId?._id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 text-xs font-semibold rounded-xl hover:bg-primary-100 transition-colors">
                    <MessageSquare className="w-3 h-3" /> Message Mentor <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Browse More */}
      <div className="text-center pt-4">
        <Link to="/student/alumni"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-600/25">
          <Users className="w-4 h-4" /> Browse Alumni Network <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
