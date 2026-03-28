import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, MapPin, Briefcase, Filter, Globe } from 'lucide-react';
import api from '../../api/axios';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';

export default function ExternalJobs() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ platform: '', type: '', search: '' });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.platform) params.platform = filters.platform;
        if (filters.type) params.type = filters.type;
        if (filters.search) params.search = filters.search;
        const res = await api.get('/external-jobs', { params });
        setData(res.data.data);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [filters.platform, filters.type]);

  const filtered = filters.search && data?.jobs
    ? data.jobs.filter(j =>
      j.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      j.company.toLowerCase().includes(filters.search.toLowerCase()) ||
      j.skills.some(s => s.toLowerCase().includes(filters.search.toLowerCase()))
    )
    : data?.jobs || [];

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-red-500 bg-red-50';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Globe className="w-6 h-6 text-primary-600" /> External Job Platforms
        </h1>
        <p className="text-gray-500 text-sm">Opportunities from LinkedIn, Naukri, Indeed & Internshala — matched to your profile</p>
      </div>

      {/* Platform Stats */}
      {data?.platforms && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {data.platforms.map((p) => {
            const count = (data?.jobs || []).filter(j => j.platform === p.id).length;
            return (
              <button key={p.id} onClick={() => setFilters({ ...filters, platform: filters.platform === p.id ? '' : p.id })}
                className={`p-4 rounded-2xl border transition-all text-center ${
                  filters.platform === p.id ? 'border-primary-300 bg-primary-50 shadow-md' : 'border-gray-100 bg-white hover:shadow-sm'
                }`}>
                <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: p.color + '15' }}>
                  <Globe className="w-4 h-4" style={{ color: p.color }} />
                </div>
                <p className="font-semibold text-sm text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-500">{count} jobs</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Search jobs, companies, skills..." />
        </div>
        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">All Types</option>
          <option value="Full-Time">Full-Time</option>
          <option value="Internship">Internship</option>
        </select>
        {filters.platform && (
          <button onClick={() => setFilters({ ...filters, platform: '' })}
            className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium flex items-center gap-1 hover:bg-gray-200">
            <Filter className="w-3 h-3" /> Clear Platform
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{filtered.length} opportunities found</p>
        <span className="text-xs text-gray-400">Sorted by match score</span>
      </div>

      {loading ? <CardSkeleton count={6} /> : filtered.length === 0 ? <EmptyState title="No external jobs found" description="Try different filters." icon={Briefcase} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((job, i) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden">

              {/* Platform Badge */}
              <div className="absolute top-4 right-4">
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full text-white" style={{ backgroundColor: job.platformInfo?.color || '#666' }}>
                  {job.platformInfo?.name}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (job.platformInfo?.color || '#666') + '15' }}>
                  <Briefcase className="w-5 h-5" style={{ color: job.platformInfo?.color }} />
                </div>
                <div className="min-w-0 pr-20">
                  <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
                  <p className="text-sm text-gray-500">{job.company}</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{job.description}</p>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500"><MapPin className="w-3 h-3" />{job.location}</span>
                <span className="text-xs text-gray-300">•</span>
                <span className="text-xs text-gray-500 font-medium">{job.package}</span>
                <span className="text-xs text-gray-300">•</span>
                <span className="text-xs text-gray-500">{job.type}</span>
                <span className="text-xs text-gray-300">•</span>
                <span className="text-xs text-gray-500">{job.experience}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {job.skills?.slice(0, 5).map((s, j) => (
                  <span key={j} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">{s}</span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {job.matchScore !== null && (
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getScoreColor(job.matchScore)}`}>
                      {job.matchScore}% match
                    </span>
                  )}
                  {job.isEligible === false && (
                    <span className="px-2 py-0.5 bg-red-50 text-red-500 text-xs font-medium rounded-full">Min CGPA: {job.minCGPA}</span>
                  )}
                </div>
                <a href={job.applyUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-4 py-2 bg-primary-700 text-white text-xs font-semibold rounded-xl hover:bg-primary-800 transition-colors shadow-sm">
                  Apply <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
