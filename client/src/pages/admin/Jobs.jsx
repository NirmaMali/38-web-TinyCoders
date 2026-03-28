import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Users, Briefcase, X } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const emptyJob = { title: '', company: '', description: '', requiredSkills: [], minCGPA: 0, package: '', location: '', type: 'on-campus', deadline: '' };

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyJob });
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [viewApplicants, setViewApplicants] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    try { const { data } = await api.get('/admin/jobs'); setJobs(data.data); } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) { await api.put(`/admin/jobs/${editId}`, form); toast.success('Job updated'); }
      else { await api.post('/admin/jobs', form); toast.success('Job posted'); }
      setShowForm(false); setEditId(null); setForm({ ...emptyJob }); fetchJobs();
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try { await api.delete(`/admin/jobs/${id}`); toast.success('Job deleted'); fetchJobs(); } catch {}
  };

  const handleEdit = (job) => {
    setForm({ title: job.title, company: job.company, description: job.description, requiredSkills: job.requiredSkills, minCGPA: job.minCGPA, package: job.package, location: job.location || '', type: job.type, deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '' });
    setEditId(job._id); setShowForm(true);
  };

  const updateStatus = async (appId, status, jobId) => {
    try {
      await api.put(`/admin/applications/${appId}`, { status, jobId });
      toast.success(`Application ${status}`);
      fetchJobs();
    } catch {}
  };

  const inputCls = 'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Job Management</h1><p className="text-gray-500 text-sm">Post, edit and manage job openings</p></div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...emptyJob }); }}
          className="px-5 py-2.5 bg-primary-700 text-white text-sm font-semibold rounded-xl hover:bg-primary-800 flex items-center gap-2 shadow-lg shadow-primary-700/25">
          <Plus className="w-4 h-4" /> Post Job
        </button>
      </div>

      {/* Job Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editId ? 'Edit Job' : 'Post New Job'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="Job Title" required />
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputCls} placeholder="Company" required />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} h-20`} placeholder="Description" required />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" step="0.1" value={form.package} onChange={(e) => setForm({ ...form, package: e.target.value })} className={inputCls} placeholder="Package (LPA)" required />
                <input type="number" step="0.1" value={form.minCGPA} onChange={(e) => setForm({ ...form, minCGPA: e.target.value })} className={inputCls} placeholder="Min CGPA" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputCls} placeholder="Location" />
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
                  <option value="on-campus">On Campus</option><option value="off-campus">Off Campus</option><option value="internship">Internship</option>
                </select>
              </div>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className={inputCls} required />
              <div>
                <div className="flex flex-wrap gap-1.5 mb-2">{form.requiredSkills.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full">{s}<button type="button" onClick={() => setForm({ ...form, requiredSkills: form.requiredSkills.filter((_, j) => j !== i) })}><X className="w-3 h-3" /></button></span>
                ))}</div>
                <div className="flex gap-2">
                  <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (skillInput.trim()) { setForm({ ...form, requiredSkills: [...form.requiredSkills, skillInput.trim()] }); setSkillInput(''); } } }} className={inputCls} placeholder="Add skill & Enter" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary-700 text-white font-semibold rounded-xl hover:bg-primary-800 disabled:opacity-50 text-sm">{saving ? 'Saving...' : editId ? 'Update' : 'Post Job'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-sm">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Jobs List */}
      {loading ? <CardSkeleton count={3} /> : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <motion.div key={job._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-sm text-gray-500">{job.company} · {job.package} LPA · <span className="capitalize">{job.type}</span> · {job.location || 'Remote'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(job)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Edit className="w-4 h-4 text-gray-500" /></button>
                  <button onClick={() => handleDelete(job._id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-400" /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">{job.requiredSkills?.map((s, i) => <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{s}</span>)}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Deadline: {new Date(job.deadline).toLocaleDateString()} · Min CGPA: {job.minCGPA}</span>
                <button onClick={() => setViewApplicants(viewApplicants === job._id ? null : job._id)}
                  className="px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-lg hover:bg-primary-100 flex items-center gap-1">
                  <Users className="w-3 h-3" /> {job.applicants?.length || 0} Applicants
                </button>
              </div>
              {viewApplicants === job._id && job.applicants?.length > 0 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                  {job.applicants.map((app) => (
                    <div key={app._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{app.name} ({app.usn})</p>
                        <p className="text-xs text-gray-500">CGPA: {app.cgpa} · {app.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${app.status === 'placed' ? 'bg-green-50 text-green-600' : app.status === 'shortlisted' ? 'bg-amber-50 text-amber-600' : app.status === 'rejected' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>{app.status}</span>
                        <select value={app.status} onChange={(e) => updateStatus(app._id, e.target.value, job._id)}
                          className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white">
                          <option value="applied">Applied</option><option value="shortlisted">Shortlist</option><option value="rejected">Reject</option><option value="placed">Place</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
