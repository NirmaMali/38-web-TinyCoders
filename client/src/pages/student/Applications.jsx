import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, XCircle, Award } from 'lucide-react';
import api from '../../api/axios';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';

const statusConfig = {
  applied: { color: 'bg-blue-50 text-blue-600', icon: Clock, label: 'Applied' },
  shortlisted: { color: 'bg-amber-50 text-amber-600', icon: Award, label: 'Shortlisted' },
  rejected: { color: 'bg-red-50 text-red-500', icon: XCircle, label: 'Rejected' },
  placed: { color: 'bg-green-50 text-green-600', icon: CheckCircle, label: 'Placed' },
};

export default function StudentApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/student/applications');
        setApps(data.data);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = tab === 'all' ? apps : apps.filter(a => a.status === tab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-500 text-sm">Track the status of your job applications</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'applied', 'shortlisted', 'rejected', 'placed'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors ${tab === t ? 'bg-primary-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
            {t === 'all' ? 'All' : statusConfig[t]?.label} {t !== 'all' && `(${apps.filter(a => a.status === t).length})`}
          </button>
        ))}
      </div>

      {loading ? <CardSkeleton count={4} /> : filtered.length === 0 ? <EmptyState title="No applications" description="You haven't applied to any jobs yet." icon={FileText} /> : (
        <div className="space-y-3">
          {filtered.map((app, i) => {
            const cfg = statusConfig[app.status] || statusConfig.applied;
            return (
              <motion.div key={app._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{app.title}</h3>
                    <p className="text-sm text-gray-500">{app.company} · {app.package} LPA · <span className="capitalize">{app.type}</span></p>
                    <p className="text-xs text-gray-400 mt-1">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1 ${cfg.color}`}>
                  <cfg.icon className="w-3 h-3" /> {cfg.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
