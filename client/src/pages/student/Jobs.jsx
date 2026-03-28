import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Briefcase, MapPin, Clock, Info } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';

export default function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', search: '' });
  const [applying, setApplying] = useState(null);
  const [expandedBreakdown, setExpandedBreakdown] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.type) params.type = filter.type;
      const { data } = await api.get('/student/jobs', { params });
      setJobs(data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, [filter.type]);

  const handleApply = async (jobId) => {
    setApplying(jobId);
    try {
      await api.post(`/student/jobs/${jobId}/apply`);
      toast.success('Application submitted!');
      fetchJobs();
    } catch {}
    setApplying(null);
  };

  const filtered = filter.search
    ? jobs.filter(j => j.title.toLowerCase().includes(filter.search.toLowerCase()) || j.company.toLowerCase().includes(filter.search.toLowerCase()))
    : jobs;

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-red-500 bg-red-50';
  };

  const breakdownLabels = {
    skills: 'Skills Match',
    cgpa: 'CGPA',
    interests: 'Interests',
    roleMatch: 'Role Fit',
    locationMatch: 'Location',
    experience: 'Experience',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Openings</h1>
        <p className="text-gray-500 text-sm">Browse and apply to available positions — sorted by your match score</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Search jobs..." />
        </div>
        <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">All Types</option>
          <option value="on-campus">On Campus</option>
          <option value="off-campus">Off Campus</option>
          <option value="internship">Internship</option>
        </select>
      </div>

      {loading ? <CardSkeleton count={6} /> : filtered.length === 0 ? <EmptyState title="No jobs found" description="Try adjusting your filters." icon={Briefcase} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((job, i) => (
            <motion.div key={job._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-primary-600" />
                  </div>
                  {/* Eligibility Badge */}
                  {job.isEligible === false && (
                    <span className="px-2 py-0.5 bg-red-50 text-red-500 text-xs font-medium rounded-full">Not Eligible</span>
                  )}
                  {job.isEligible === true && (
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs font-medium rounded-full">Eligible</span>
                  )}
                </div>
                <button onClick={() => setExpandedBreakdown(expandedBreakdown === job._id ? null : job._id)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity ${getScoreColor(job.matchScore)}`}>
                  {job.matchScore}% match <Info className="w-3 h-3" />
                </button>
              </div>

              {/* Match Breakdown */}
              {expandedBreakdown === job._id && job.matchBreakdown && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mb-3 p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Match Breakdown</p>
                  <div className="space-y-1.5">
                    {Object.entries(job.matchBreakdown).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-20">{breakdownLabels[key]}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full transition-all ${val > 0 ? 'bg-primary-500' : 'bg-gray-300'}`}
                            style={{ width: `${Math.min((val / (key === 'skills' ? 35 : key === 'interests' ? 20 : key === 'cgpa' || key === 'roleMatch' ? 15 : key === 'experience' ? 10 : 5)) * 100, 100)}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-8 text-right">{val}%</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{job.company}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500"><MapPin className="w-3 h-3" />{job.location || 'Remote'}</span>
                <span className="text-xs text-gray-300">•</span>
                <span className="text-xs text-gray-500">{job.package} LPA</span>
                <span className="text-xs text-gray-300">•</span>
                <span className="text-xs text-gray-500 capitalize">{job.type}</span>
                {job.minCGPA > 0 && (
                  <>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-500">Min CGPA: {job.minCGPA}</span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {job.requiredSkills?.slice(0, 4).map((s, j) => (
                  <span key={j} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">{s}</span>
                ))}
                {(job.requiredSkills?.length || 0) > 4 && <span className="text-xs text-gray-400">+{job.requiredSkills.length - 4}</span>}
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" />Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                {job.hasApplied ? (
                  <span className="px-3 py-1.5 bg-green-50 text-green-600 text-xs font-medium rounded-lg">✓ Applied</span>
                ) : (
                  <button onClick={() => handleApply(job._id)} disabled={applying === job._id || !job.isEligible}
                    className="px-4 py-1.5 bg-primary-700 text-white text-xs font-semibold rounded-lg hover:bg-primary-800 disabled:opacity-50 transition-colors">
                    {applying === job._id ? 'Applying...' : !job.isEligible ? 'Ineligible' : 'Apply'}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
