import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, X, Github, Linkedin, Phone, BookOpen, TrendingUp, Target, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CardSkeleton } from '../../components/LoadingSkeleton';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newLocation, setNewLocation] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/student/profile');
        setProfile(data.data);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/student/profile', {
        skills: profile.skills,
        interests: profile.interests,
        github: profile.github,
        linkedin: profile.linkedin,
        phone: profile.phone,
        semester: profile.semester,
        internships: profile.internships,
        certifications: profile.certifications,
        projects: profile.projects,
        semesterGrades: profile.semesterGrades,
        preferredRoles: profile.preferredRoles,
        preferredLocations: profile.preferredLocations,
        expectedPackage: profile.expectedPackage,
      });
      setProfile(data.data);
      toast.success('Profile updated successfully!');
    } catch {}
    setSaving(false);
  };

  const addTag = (field, value, setter) => {
    if (value.trim() && !profile[field]?.includes(value.trim())) {
      setProfile({ ...profile, [field]: [...(profile[field] || []), value.trim()] });
      setter('');
    }
  };

  const removeTag = (field, index) => {
    setProfile({ ...profile, [field]: profile[field].filter((_, i) => i !== index) });
  };

  const addItem = (field, template) => {
    setProfile({ ...profile, [field]: [...(profile[field] || []), template] });
  };

  const updateItem = (field, index, key, value) => {
    const items = [...profile[field]];
    items[index] = { ...items[index], [key]: value };
    setProfile({ ...profile, [field]: items });
  };

  const removeItem = (field, index) => {
    setProfile({ ...profile, [field]: profile[field].filter((_, i) => i !== index) });
  };

  const updateSemesterGrade = (sem, key, value) => {
    const grades = [...(profile.semesterGrades || [])];
    const idx = grades.findIndex(g => g.semester === sem);
    if (idx >= 0) {
      grades[idx] = { ...grades[idx], [key]: key === 'semester' ? sem : parseFloat(value) || 0 };
    } else {
      grades.push({ semester: sem, sgpa: 0, credits: 0, backlogs: 0, [key]: key === 'semester' ? sem : parseFloat(value) || 0 });
    }
    setProfile({ ...profile, semesterGrades: grades });
  };

  const getSemesterGrade = (sem) => {
    return (profile.semesterGrades || []).find(g => g.semester === sem) || { semester: sem, sgpa: 0, credits: 0, backlogs: 0 };
  };

  if (loading) return <CardSkeleton count={4} />;
  if (!profile) return <p className="text-center text-gray-500 py-10">Profile not found.</p>;

  const completeness = (() => {
    let c = 0;
    if (profile.skills?.length > 0) c += 15;
    if (profile.interests?.length > 0) c += 10;
    if (profile.github) c += 10;
    if (profile.linkedin) c += 10;
    if (profile.phone) c += 5;
    if (profile.internships?.length > 0) c += 15;
    if (profile.projects?.length > 0) c += 15;
    if (profile.certifications?.length > 0) c += 10;
    if (profile.resume) c += 10;
    return Math.min(c, 100);
  })();

  const sgpaChartData = Array.from({ length: profile.semester || 8 }, (_, i) => {
    const grade = getSemesterGrade(i + 1);
    return { name: `Sem ${i + 1}`, sgpa: grade.sgpa || 0 };
  }).filter(d => d.sgpa > 0);

  const calculatedCGPA = sgpaChartData.length > 0
    ? Math.round((sgpaChartData.reduce((sum, d) => sum + d.sgpa, 0) / sgpaChartData.length) * 100) / 100
    : null;

  const inputCls = 'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm">Manage your information and showcase your skills</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2.5 bg-primary-700 text-white text-sm font-semibold rounded-xl hover:bg-primary-800 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary-700/25">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Completeness */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Profile Completeness</span>
          <span className="text-sm font-bold text-primary-700">{completeness}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div className="bg-gradient-to-r from-primary-500 to-primary-700 h-2.5 rounded-full transition-all" style={{ width: `${completeness}%` }} />
        </div>
      </div>

      {/* Basic Info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Name</label><p className="text-sm font-medium text-gray-900">{profile.userId?.name}</p></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">USN</label><p className="text-sm font-medium text-gray-900">{profile.usn}</p></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Department</label><p className="text-sm font-medium text-gray-900">{profile.department}</p></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">CGPA</label>
            <p className="text-sm font-medium text-gray-900">{profile.cgpa}
              {calculatedCGPA && calculatedCGPA !== profile.cgpa && (
                <span className="text-xs text-primary-500 ml-2">(auto-calculated: {calculatedCGPA})</span>
              )}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
            <input value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className={inputCls} placeholder="9876543210" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Semester</label>
            <input type="number" min="1" max="8" value={profile.semester || ''} onChange={(e) => setProfile({ ...profile, semester: parseInt(e.target.value) })} className={inputCls} />
          </div>
        </div>
      </motion.div>

      {/* Semester-wise Grades */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Semester-wise Academic Progress</h2>
        {sgpaChartData.length > 0 && (
          <div className="mb-6 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={sgpaChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="sgpa" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: profile.semester || 8 }, (_, i) => i + 1).map(sem => {
            const grade = getSemesterGrade(sem);
            return (
              <div key={sem} className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs font-semibold text-gray-600 mb-2">Semester {sem}</p>
                <div className="space-y-1.5">
                  <input type="number" step="0.01" min="0" max="10" value={grade.sgpa || ''} onChange={(e) => updateSemesterGrade(sem, 'sgpa', e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="SGPA" />
                  <input type="number" min="0" value={grade.credits || ''} onChange={(e) => updateSemesterGrade(sem, 'credits', e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Credits" />
                  <input type="number" min="0" value={grade.backlogs || ''} onChange={(e) => updateSemesterGrade(sem, 'backlogs', e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Backlogs" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Links */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">Portfolio Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><Github className="w-3 h-3" /> GitHub</label>
            <input value={profile.github || ''} onChange={(e) => setProfile({ ...profile, github: e.target.value })} className={inputCls} placeholder="https://github.com/..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><Linkedin className="w-3 h-3" /> LinkedIn</label>
            <input value={profile.linkedin || ''} onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })} className={inputCls} placeholder="https://linkedin.com/in/..." />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">Skills</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.skills?.map((skill, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
              {skill}<button onClick={() => removeTag('skills', i)}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('skills', newSkill, setNewSkill))}
            className={inputCls} placeholder="Add a skill (press Enter)" />
          <button onClick={() => addTag('skills', newSkill, setNewSkill)} className="px-4 py-2 bg-primary-50 text-primary-700 rounded-xl hover:bg-primary-100 text-sm font-medium"><Plus className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Interests */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">Interests / Preferred Domains</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.interests?.map((interest, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
              {interest}<button onClick={() => removeTag('interests', i)}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newInterest} onChange={(e) => setNewInterest(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('interests', newInterest, setNewInterest))}
            className={inputCls} placeholder="Add an interest (press Enter)" />
          <button onClick={() => addTag('interests', newInterest, setNewInterest)} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 text-sm font-medium"><Plus className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Job Preferences */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Target className="w-4 h-4" /> Job Preferences</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Preferred Roles</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(profile.preferredRoles || []).map((role, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-violet-50 text-violet-700 text-xs font-medium rounded-full">
                  {role}<button onClick={() => removeTag('preferredRoles', i)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newRole} onChange={(e) => setNewRole(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('preferredRoles', newRole, setNewRole))}
                className={inputCls} placeholder="e.g., Full Stack Developer, Data Analyst" />
              <button onClick={() => addTag('preferredRoles', newRole, setNewRole)} className="px-4 py-2 bg-violet-50 text-violet-700 rounded-xl hover:bg-violet-100 text-sm font-medium"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> Preferred Locations</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(profile.preferredLocations || []).map((loc, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-50 text-cyan-700 text-xs font-medium rounded-full">
                  {loc}<button onClick={() => removeTag('preferredLocations', i)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('preferredLocations', newLocation, setNewLocation))}
                className={inputCls} placeholder="e.g., Bangalore, Hyderabad, Remote" />
              <button onClick={() => addTag('preferredLocations', newLocation, setNewLocation)} className="px-4 py-2 bg-cyan-50 text-cyan-700 rounded-xl hover:bg-cyan-100 text-sm font-medium"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Expected Package (LPA)</label>
            <input type="number" step="0.5" min="0" value={profile.expectedPackage || ''} onChange={(e) => setProfile({ ...profile, expectedPackage: parseFloat(e.target.value) || '' })}
              className={`${inputCls} max-w-xs`} placeholder="e.g., 8" />
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Projects</h2>
          <button onClick={() => addItem('projects', { title: '', description: '', techStack: '', link: '' })} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 text-xs font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
        </div>
        {profile.projects?.map((proj, i) => (
          <div key={i} className="p-4 bg-gray-50 rounded-xl mb-3 relative">
            <button onClick={() => removeItem('projects', i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={proj.title} onChange={(e) => updateItem('projects', i, 'title', e.target.value)} className={inputCls} placeholder="Project title" />
              <input value={proj.techStack} onChange={(e) => updateItem('projects', i, 'techStack', e.target.value)} className={inputCls} placeholder="Tech stack" />
              <input value={proj.description} onChange={(e) => updateItem('projects', i, 'description', e.target.value)} className={`${inputCls} sm:col-span-2`} placeholder="Description" />
              <input value={proj.link || ''} onChange={(e) => updateItem('projects', i, 'link', e.target.value)} className={inputCls} placeholder="Project link" />
            </div>
          </div>
        ))}
      </div>

      {/* Internships */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Internships</h2>
          <button onClick={() => addItem('internships', { company: '', role: '', duration: '', description: '' })} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 text-xs font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
        </div>
        {profile.internships?.map((intern, i) => (
          <div key={i} className="p-4 bg-gray-50 rounded-xl mb-3 relative">
            <button onClick={() => removeItem('internships', i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={intern.company} onChange={(e) => updateItem('internships', i, 'company', e.target.value)} className={inputCls} placeholder="Company" />
              <input value={intern.role} onChange={(e) => updateItem('internships', i, 'role', e.target.value)} className={inputCls} placeholder="Role" />
              <input value={intern.duration} onChange={(e) => updateItem('internships', i, 'duration', e.target.value)} className={inputCls} placeholder="Duration" />
              <input value={intern.description} onChange={(e) => updateItem('internships', i, 'description', e.target.value)} className={inputCls} placeholder="Description" />
            </div>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Certifications</h2>
          <button onClick={() => addItem('certifications', { name: '', issuer: '', year: '', link: '' })} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 text-xs font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
        </div>
        {profile.certifications?.map((cert, i) => (
          <div key={i} className="p-4 bg-gray-50 rounded-xl mb-3 relative">
            <button onClick={() => removeItem('certifications', i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={cert.name} onChange={(e) => updateItem('certifications', i, 'name', e.target.value)} className={inputCls} placeholder="Certificate name" />
              <input value={cert.issuer} onChange={(e) => updateItem('certifications', i, 'issuer', e.target.value)} className={inputCls} placeholder="Issuer" />
              <input value={cert.year} onChange={(e) => updateItem('certifications', i, 'year', e.target.value)} className={inputCls} placeholder="Year" />
              <input value={cert.link || ''} onChange={(e) => updateItem('certifications', i, 'link', e.target.value)} className={inputCls} placeholder="Link" />
            </div>
          </div>
        ))}
      </div>

      {/* Placement Status */}
      {profile.placementStatus?.isPlaced && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <h2 className="font-semibold text-green-800 mb-3">🎉 Placement Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-green-600">Company</p><p className="font-medium text-green-900">{profile.placementStatus.company}</p></div>
            <div><p className="text-xs text-green-600">Role</p><p className="font-medium text-green-900">{profile.placementStatus.role}</p></div>
            <div><p className="text-xs text-green-600">Package</p><p className="font-medium text-green-900">{profile.placementStatus.package} LPA</p></div>
          </div>
        </div>
      )}
    </div>
  );
}
