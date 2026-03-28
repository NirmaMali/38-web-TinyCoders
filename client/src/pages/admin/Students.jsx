import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, GraduationCap, Eye, Plus, X, UserPlus, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ department: '', status: '' });
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState('single'); // 'single' or 'bulk'
  const [addForm, setAddForm] = useState({ name: '', usn: '', semester: '', cgpa: '', email: '', department: 'CSE' });
  const [bulkText, setBulkText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bulkResults, setBulkResults] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = { search, ...filters, limit: 50 };
      const { data } = await api.get('/admin/students', { params });
      setStudents(data.data.students);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, [filters]);

  const viewDetail = async (id) => {
    setSelected(id);
    try {
      const { data } = await api.get(`/admin/students/${id}`);
      setDetail(data.data);
    } catch {}
  };

  const exportCSV = () => {
    const headers = ['Name', 'USN', 'Department', 'Semester', 'CGPA', 'Email', 'Status', 'Company', 'Package'];
    const rows = students.map(s => [s.userId?.name, s.usn, s.department, s.semester || '-', s.cgpa, s.userId?.email, s.placementStatus?.isPlaced ? 'Placed' : 'Not Placed', s.placementStatus?.company || '-', s.placementStatus?.package || '-']);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'students.csv';
    a.click();
  };

  const handleAddSingle = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.usn || !addForm.email || !addForm.department) {
      toast.error('Name, USN, Email, and Department are required');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/admin/add-student', addForm);
      toast.success(data.message);
      setAddForm({ name: '', usn: '', semester: '', cgpa: '', email: '', department: 'CSE' });
      setShowAddModal(false);
      fetchStudents();
    } catch {}
    setSubmitting(false);
  };

  const handleAddBulk = async () => {
    if (!bulkText.trim()) {
      toast.error('Enter student data');
      return;
    }
    setSubmitting(true);
    setBulkResults(null);
    try {
      // Parse CSV-style input: name, usn, department, semester, cgpa, email (one per line)
      const lines = bulkText.trim().split('\n').filter(l => l.trim());
      const students = lines.map(line => {
        const parts = line.split(',').map(p => p.trim());
        return {
          name: parts[0] || '',
          usn: parts[1] || '',
          department: parts[2] || 'CSE',
          semester: parts[3] || '1',
          cgpa: parts[4] || '0',
          email: parts[5] || '',
        };
      });

      const { data } = await api.post('/admin/add-students-bulk', { students });
      setBulkResults(data.data);
      toast.success(data.message);
      fetchStudents();
    } catch {}
    setSubmitting(false);
  };

  const filtered = search ? students.filter(s => s.userId?.name?.toLowerCase().includes(search.toLowerCase()) || s.usn?.toLowerCase().includes(search.toLowerCase())) : students;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-gray-900">Students</h1><p className="text-gray-500 text-sm">Manage and monitor student records</p></div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowAddModal(true); setBulkResults(null); }}
            className="px-4 py-2 bg-primary-700 text-white text-sm font-medium rounded-xl hover:bg-primary-800 flex items-center gap-2 shadow-sm transition-colors">
            <UserPlus className="w-4 h-4" /> Add Student
          </button>
          <button onClick={exportCSV} className="px-4 py-2 bg-primary-50 text-primary-700 text-sm font-medium rounded-xl hover:bg-primary-100 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Search by name or USN..." />
        </div>
        <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm"><option value="">All Depts</option>{['CSE','ECE','ISE','MECH'].map(d => <option key={d} value={d}>{d}</option>)}</select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm"><option value="">All Status</option><option value="placed">Placed</option><option value="unplaced">Not Placed</option></select>
      </div>

      {loading ? <TableSkeleton rows={8} cols={7} /> : filtered.length === 0 ? <EmptyState title="No students found" icon={GraduationCap} /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">USN</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Dept</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Sem</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">CGPA</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Action</th>
              </tr></thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s._id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{s.userId?.name}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-xs">{s.usn}</td>
                    <td className="py-3 px-4 text-gray-600">{s.department}</td>
                    <td className="py-3 px-4 text-gray-600">{s.semester || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{s.cgpa}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${s.placementStatus?.isPlaced ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        {s.placementStatus?.isPlaced ? '✓ Placed' : 'Open'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => viewDetail(s._id)} className="p-1.5 hover:bg-primary-50 rounded-lg text-primary-600 transition-colors"><Eye className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setDetail(null); setSelected(null); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{detail.profile?.userId?.name}</h2>
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div><span className="text-gray-500">USN:</span> <b>{detail.profile?.usn}</b></div>
              <div><span className="text-gray-500">Department:</span> <b>{detail.profile?.department}</b></div>
              <div><span className="text-gray-500">CGPA:</span> <b>{detail.profile?.cgpa}</b></div>
              <div><span className="text-gray-500">Semester:</span> <b>{detail.profile?.semester || '-'}</b></div>
              <div><span className="text-gray-500">Phone:</span> <b>{detail.profile?.phone || '-'}</b></div>
              <div><span className="text-gray-500">Score:</span> <b>{detail.profile?.performanceScore}</b></div>
              <div><span className="text-gray-500">Email:</span> <b>{detail.profile?.userId?.email}</b></div>
              <div><span className="text-gray-500">Status:</span> <b>{detail.profile?.placementStatus?.isPlaced ? `Placed at ${detail.profile.placementStatus.company}` : 'Not Placed'}</b></div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">{detail.profile?.skills?.length > 0 ? detail.profile.skills.map((s, i) => <span key={i} className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full">{s}</span>) : <span className="text-xs text-gray-400">No skills added yet</span>}</div>
            </div>
            {detail.applications?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Applications ({detail.applications.length})</p>
                {detail.applications.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg mb-1 text-sm">
                    <span>{a.jobTitle} at {a.company}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${a.status === 'placed' ? 'bg-green-50 text-green-600' : a.status === 'shortlisted' ? 'bg-amber-50 text-amber-600' : a.status === 'rejected' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => { setDetail(null); setSelected(null); }} className="mt-4 w-full py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-sm font-medium">Close</button>
          </motion.div>
        </div>
      )}

      {/* Add Student Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary-600" /> Add Student Academic Data
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">Pre-load student records — they can login using their USN + default password (Student@123)</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button>
              </div>

              {/* Mode Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                <button onClick={() => { setAddMode('single'); setBulkResults(null); }}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${addMode === 'single' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'}`}>
                  <Plus className="w-4 h-4" /> Single Student
                </button>
                <button onClick={() => { setAddMode('bulk'); setBulkResults(null); }}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${addMode === 'bulk' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'}`}>
                  <Upload className="w-4 h-4" /> Bulk Upload
                </button>
              </div>

              {/* Single Student Form */}
              {addMode === 'single' && (
                <form onSubmit={handleAddSingle} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g. Aarav Sharma" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">USN *</label>
                      <input value={addForm.usn} onChange={(e) => setAddForm({ ...addForm, usn: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                        placeholder="e.g. 1RV21CS001" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} type="email"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g. aarav@placeiq.com" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                      <select value={addForm.department} onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        {['CSE', 'ECE', 'ISE', 'MECH', 'CIVIL', 'EEE'].map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Semester</label>
                      <input value={addForm.semester} onChange={(e) => setAddForm({ ...addForm, semester: e.target.value })} type="number" min="1" max="8"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g. 5" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CGPA</label>
                      <input value={addForm.cgpa} onChange={(e) => setAddForm({ ...addForm, cgpa: e.target.value })} type="number" step="0.01" min="0" max="10"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g. 8.5" />
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-700">
                      <b>Note:</b> The student will be created with default password <code className="px-1.5 py-0.5 bg-blue-100 rounded text-blue-800 font-mono">Student@123</code>.
                      They can login using their <b>USN</b> and this password.
                    </p>
                  </div>

                  <button type="submit" disabled={submitting}
                    className="w-full py-3 bg-primary-700 text-white font-semibold rounded-xl hover:bg-primary-800 transition-colors disabled:opacity-50 shadow-md">
                    {submitting ? 'Adding...' : 'Add Student'}
                  </button>
                </form>
              )}

              {/* Bulk Upload */}
              {addMode === 'bulk' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-xs text-amber-700 font-medium mb-1">CSV Format (one student per line):</p>
                    <code className="text-xs text-amber-600 block font-mono">Name, USN, Department, Semester, CGPA, Email</code>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student Data</label>
                    <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={8}
                      placeholder={`Rahul Verma, 1RV22CS010, CSE, 5, 8.2, rahul@placeiq.com\nPriya Singh, 1RV22EC015, ECE, 5, 7.8, priya@placeiq.com\nAmit Kumar, 1RV22IS003, ISE, 3, 9.1, amit@placeiq.com`} />
                  </div>

                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-700">
                      <b>Note:</b> All students will be created with default password <code className="px-1.5 py-0.5 bg-blue-100 rounded text-blue-800 font-mono">Student@123</code>.
                    </p>
                  </div>

                  <button onClick={handleAddBulk} disabled={submitting}
                    className="w-full py-3 bg-primary-700 text-white font-semibold rounded-xl hover:bg-primary-800 transition-colors disabled:opacity-50 shadow-md flex items-center justify-center gap-2">
                    {submitting ? 'Processing...' : <><Upload className="w-4 h-4" /> Upload Students</>}
                  </button>

                  {/* Bulk Results */}
                  {bulkResults && (
                    <div className="space-y-3">
                      {bulkResults.success.length > 0 && (
                        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                          <p className="text-sm font-semibold text-green-700 flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4" /> {bulkResults.success.length} Students Added Successfully
                          </p>
                          <div className="space-y-1">
                            {bulkResults.success.map((s, i) => (
                              <p key={i} className="text-xs text-green-600 font-mono">{s.usn} — {s.name}</p>
                            ))}
                          </div>
                        </div>
                      )}
                      {bulkResults.failed.length > 0 && (
                        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                          <p className="text-sm font-semibold text-red-600 flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4" /> {bulkResults.failed.length} Failed
                          </p>
                          <div className="space-y-1">
                            {bulkResults.failed.map((s, i) => (
                              <p key={i} className="text-xs text-red-500"><b>{s.usn}</b>: {s.reason}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
