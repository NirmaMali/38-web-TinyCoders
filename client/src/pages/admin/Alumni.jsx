import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, UserX, Users, Eye } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';

export default function AdminAlumni() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');

  const fetchAlumni = async () => {
    setLoading(true);
    try { const { data } = await api.get('/admin/alumni'); setAlumni(data.data); } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAlumni(); }, []);

  const handleApprove = async (id, approve) => {
    try { await api.put(`/admin/alumni/${id}/approve`, { approve }); toast.success(approve ? 'Alumni approved' : 'Alumni rejected'); fetchAlumni(); } catch {}
  };

  const pending = alumni.filter(a => !a.userId?.isApproved);
  const approved = alumni.filter(a => a.userId?.isApproved);
  const display = tab === 'pending' ? pending : approved;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Alumni Management</h1><p className="text-gray-500 text-sm">Approve registrations and manage alumni records</p></div>
      <div className="flex gap-2">
        <button onClick={() => setTab('pending')} className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${tab === 'pending' ? 'bg-primary-700 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Pending ({pending.length})</button>
        <button onClick={() => setTab('approved')} className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${tab === 'approved' ? 'bg-primary-700 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Approved ({approved.length})</button>
      </div>
      {loading ? <CardSkeleton count={4} /> : display.length === 0 ? <EmptyState title={tab === 'pending' ? 'No pending approvals' : 'No approved alumni'} icon={Users} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {display.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-lg">{a.userId?.name?.[0]}</div>
                <div>
                  <h3 className="font-semibold text-gray-900">{a.userId?.name}</h3>
                  <p className="text-sm text-gray-500">{a.jobRole} at {a.company}</p>
                  <p className="text-xs text-gray-400">{a.userId?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                <span>Dept: {a.department}</span><span>Batch: {a.batchYear}</span>
                <span>Salary: {a.salary} LPA</span><span>Mentor: {a.isAvailableForMentorship ? '✓ Yes' : 'No'}</span>
              </div>
              {a.bio && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{a.bio}</p>}
              {tab === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(a._id, true)} className="flex-1 py-2 bg-green-50 text-green-600 text-xs font-semibold rounded-xl hover:bg-green-100 flex items-center justify-center gap-1"><UserCheck className="w-3 h-3" /> Approve</button>
                  <button onClick={() => handleApprove(a._id, false)} className="flex-1 py-2 bg-red-50 text-red-500 text-xs font-semibold rounded-xl hover:bg-red-100 flex items-center justify-center gap-1"><UserX className="w-3 h-3" /> Reject</button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
