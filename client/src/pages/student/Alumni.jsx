import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Building2, MessageSquare, Award, Send, X, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';

const TOPICS = ['Career Guidance', 'Interview Prep', 'Resume Review', 'Higher Studies', 'Career Switch', 'Skill Development', 'Company Insights', 'General Advice'];

export default function StudentAlumni() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ department: '', company: '', batchYear: '', mentorOnly: false });
  const [mentorModal, setMentorModal] = useState(null);
  const [mentorForm, setMentorForm] = useState({ topic: '', message: '' });
  const [sending, setSending] = useState(false);
  const [expandedTimeline, setExpandedTimeline] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = {};
        if (filters.department) params.department = filters.department;
        if (filters.company) params.company = filters.company;
        if (filters.batchYear) params.batchYear = filters.batchYear;
        if (filters.mentorOnly) params.mentorOnly = 'true';
        const { data } = await api.get('/student/alumni', { params });
        setAlumni(data.data);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [filters.department, filters.batchYear, filters.mentorOnly]);

  const filtered = filters.company
    ? alumni.filter(a => a.company?.toLowerCase().includes(filters.company.toLowerCase()))
    : alumni;

  const handleRequestMentorship = async () => {
    if (!mentorForm.topic || !mentorForm.message.trim()) {
      toast.error('Please select a topic and write a message');
      return;
    }
    setSending(true);
    try {
      await api.post('/student/mentorship/request', {
        alumniId: mentorModal.userId?._id,
        topic: mentorForm.topic,
        message: mentorForm.message,
      });
      toast.success('Mentorship request sent!');
      setMentorModal(null);
      setMentorForm({ topic: '', message: '' });
      // Refresh to update mentorship status
      const { data } = await api.get('/student/alumni', {
        params: {
          ...(filters.department && { department: filters.department }),
          ...(filters.mentorOnly && { mentorOnly: 'true' }),
        },
      });
      setAlumni(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
    setSending(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alumni Network</h1>
        <p className="text-gray-500 text-sm">Connect with alumni mentors for guidance and career advice</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={filters.company} onChange={(e) => setFilters({ ...filters, company: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Search by company..." />
        </div>
        <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">All Depts</option>
          {['CSE', 'ECE', 'ISE', 'MECH'].map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={filters.batchYear} onChange={(e) => setFilters({ ...filters, batchYear: e.target.value })}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">All Years</option>
          {[2020, 2021, 2022, 2023].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button onClick={() => setFilters({ ...filters, mentorOnly: !filters.mentorOnly })}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${
            filters.mentorOnly ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}>
          <Filter className="w-3 h-3" /> Mentors Only
        </button>
      </div>

      {loading ? <CardSkeleton count={8} /> : filtered.length === 0 ? <EmptyState title="No alumni found" description="Try adjusting your filters." icon={Users} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((alum, i) => (
            <motion.div key={alum._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-lg flex-shrink-0">
                  {alum.userId?.name?.[0] || 'A'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{alum.userId?.name}</h3>
                  <p className="text-sm text-gray-500">{alum.jobRole} at {alum.company}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Building2 className="w-3 h-3" /> {alum.department} · Batch {alum.batchYear}
                </div>
                {alum.salary && <p className="text-xs text-gray-500">💰 {alum.salary} LPA</p>}
                {alum.isAvailableForMentorship && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 text-xs font-medium rounded-full">
                    <Award className="w-3 h-3" /> Available for Mentorship
                  </span>
                )}
              </div>

              {/* Specializations */}
              {alum.specializations?.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {alum.specializations.map((s, j) => (
                      <span key={j} className="px-2 py-0.5 bg-violet-50 text-violet-600 text-xs rounded-md font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Advice Topics */}
              {alum.adviceTopics?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Can help with:</p>
                  <div className="flex flex-wrap gap-1">
                    {alum.adviceTopics.map((t, j) => (
                      <span key={j} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-md">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {alum.bio && <p className="text-xs text-gray-500 mb-4 line-clamp-2">{alum.bio}</p>}

              {/* Career Path Timeline */}
              {alum.careerPath?.length > 0 && (
                <div className="mb-4">
                  <button onClick={() => setExpandedTimeline(expandedTimeline === alum._id ? null : alum._id)}
                    className="w-full flex items-center justify-between text-xs font-medium text-gray-600 mb-1 hover:text-primary-600 transition-colors">
                    <span>Career Path</span>
                    {expandedTimeline === alum._id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  <AnimatePresence>
                    {expandedTimeline === alum._id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <div className="relative pl-4 border-l-2 border-primary-200 space-y-3 mt-2">
                          {[...alum.careerPath].sort((a, b) => a.year - b.year).map((cp, j) => (
                            <div key={j} className="relative">
                              <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-white border-2 border-primary-500" />
                              <div className="pb-1">
                                <p className="text-xs font-semibold text-gray-800">{cp.role}</p>
                                <p className="text-xs text-gray-500">{cp.company} · {cp.year}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {expandedTimeline !== alum._id && (
                    <div className="flex flex-wrap gap-1">
                      {alum.careerPath.map((cp, j) => (
                        <span key={j} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{cp.role} @ {cp.company} ({cp.year})</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => navigate(`/student/messages?to=${alum.userId?._id}`)}
                  className="flex-1 px-3 py-2 bg-primary-50 text-primary-700 text-xs font-semibold rounded-xl hover:bg-primary-100 transition-colors flex items-center justify-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Message
                </button>
                {alum.isAvailableForMentorship && (
                  alum.mentorshipStatus === 'pending' ? (
                    <span className="px-3 py-2 bg-amber-50 text-amber-600 text-xs font-medium rounded-xl flex items-center gap-1">⏳ Pending</span>
                  ) : alum.mentorshipStatus === 'accepted' ? (
                    <span className="px-3 py-2 bg-green-50 text-green-600 text-xs font-medium rounded-xl flex items-center gap-1">✅ Connected</span>
                  ) : (
                    <button onClick={() => setMentorModal(alum)}
                      className="px-3 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-semibold rounded-xl hover:from-violet-600 hover:to-purple-600 transition-colors flex items-center gap-1">
                      <Award className="w-3 h-3" /> Request Guidance
                    </button>
                  )
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Mentorship Request Modal */}
      <AnimatePresence>
        {mentorModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMentorModal(null)}
              className="fixed inset-0 bg-black/50 z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-gray-900">Request Mentorship</h3>
                  <button onClick={() => setMentorModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>

                <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
                    {mentorModal.userId?.name?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{mentorModal.userId?.name}</p>
                    <p className="text-xs text-gray-500">{mentorModal.jobRole} at {mentorModal.company}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Topic</label>
                    <div className="grid grid-cols-2 gap-2">
                      {TOPICS.map(t => (
                        <button key={t} onClick={() => setMentorForm({ ...mentorForm, topic: t })}
                          className={`px-3 py-2 text-xs rounded-xl border transition-all ${
                            mentorForm.topic === t ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
                    <textarea value={mentorForm.message} onChange={(e) => setMentorForm({ ...mentorForm, message: e.target.value })}
                      rows={3} maxLength={500}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      placeholder="Introduce yourself and explain what guidance you're looking for..." />
                    <p className="text-xs text-gray-400 mt-1 text-right">{mentorForm.message.length}/500</p>
                  </div>
                  <button onClick={handleRequestMentorship} disabled={sending}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                    <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
