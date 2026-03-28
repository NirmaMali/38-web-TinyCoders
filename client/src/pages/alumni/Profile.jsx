import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, X, Github, Linkedin, Award, Building2, Briefcase } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const ADVICE_TOPIC_OPTIONS = [
  'Career Guidance', 'Interview Prep', 'Resume Review', 'Higher Studies',
  'Career Switch', 'Skill Development', 'Company Insights', 'General Advice',
];

export default function AlumniProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSpecialization, setNewSpecialization] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/alumni/profile');
        setProfile(data.data);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/alumni/profile', {
        company: profile.company,
        jobRole: profile.jobRole,
        salary: profile.salary,
        linkedin: profile.linkedin,
        github: profile.github,
        careerPath: profile.careerPath,
        bio: profile.bio,
        isAvailableForMentorship: profile.isAvailableForMentorship,
        department: profile.department,
        batchYear: profile.batchYear,
        adviceTopics: profile.adviceTopics,
        specializations: profile.specializations,
      });
      setProfile(data.data);
      toast.success('Profile updated!');
    } catch {}
    setSaving(false);
  };

  const addCareerStep = () => {
    setProfile({ ...profile, careerPath: [...(profile.careerPath || []), { company: '', role: '', year: new Date().getFullYear() }] });
  };

  const updateCareerStep = (index, key, value) => {
    const path = [...profile.careerPath];
    path[index] = { ...path[index], [key]: key === 'year' ? parseInt(value) || '' : value };
    setProfile({ ...profile, careerPath: path });
  };

  const removeCareerStep = (index) => {
    setProfile({ ...profile, careerPath: profile.careerPath.filter((_, i) => i !== index) });
  };

  const toggleAdviceTopic = (topic) => {
    const topics = profile.adviceTopics || [];
    if (topics.includes(topic)) {
      setProfile({ ...profile, adviceTopics: topics.filter(t => t !== topic) });
    } else {
      setProfile({ ...profile, adviceTopics: [...topics, topic] });
    }
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !(profile.specializations || []).includes(newSpecialization.trim())) {
      setProfile({ ...profile, specializations: [...(profile.specializations || []), newSpecialization.trim()] });
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (index) => {
    setProfile({ ...profile, specializations: profile.specializations.filter((_, i) => i !== index) });
  };

  if (loading) return <CardSkeleton count={4} />;
  if (!profile) return <p className="text-center text-gray-500 py-10">Profile not found.</p>;

  const inputCls = 'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm">Manage your alumni profile and mentorship settings</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2.5 bg-primary-700 text-white text-sm font-semibold rounded-xl hover:bg-primary-800 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary-700/25">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Basic Info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Building2 className="w-4 h-4" /> Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Name</label><p className="text-sm font-medium text-gray-900">{profile.userId?.name}</p></div>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Email</label><p className="text-sm font-medium text-gray-900">{profile.userId?.email}</p></div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
            <select value={profile.department || ''} onChange={(e) => setProfile({ ...profile, department: e.target.value })} className={inputCls}>
              {['CSE', 'ECE', 'ISE', 'MECH', 'CIVIL', 'EEE'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Batch Year</label>
            <input type="number" min="2000" max="2030" value={profile.batchYear || ''} onChange={(e) => setProfile({ ...profile, batchYear: parseInt(e.target.value) })} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Current Company</label>
            <input value={profile.company || ''} onChange={(e) => setProfile({ ...profile, company: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Current Role</label>
            <input value={profile.jobRole || ''} onChange={(e) => setProfile({ ...profile, jobRole: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Current Salary (LPA)</label>
            <input type="number" step="0.5" value={profile.salary || ''} onChange={(e) => setProfile({ ...profile, salary: parseFloat(e.target.value) })} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
            <textarea value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} maxLength={500}
              className={`${inputCls} resize-none`} placeholder="Tell students about yourself and your experience..." />
            <p className="text-xs text-gray-400 mt-1 text-right">{(profile.bio || '').length}/500</p>
          </div>
        </div>
      </motion.div>

      {/* Mentorship Toggle */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Award className="w-4 h-4 text-green-500" /> Mentorship Availability</h2>
            <p className="text-sm text-gray-500 mt-1">When enabled, students can request mentorship from you</p>
          </div>
          <button onClick={() => setProfile({ ...profile, isAvailableForMentorship: !profile.isAvailableForMentorship })}
            className={`relative w-14 h-7 rounded-full transition-colors ${profile.isAvailableForMentorship ? 'bg-green-500' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${profile.isAvailableForMentorship ? 'translate-x-7' : ''}`} />
          </button>
        </div>

        {/* Stats */}
        {profile.mentorshipStats && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-lg font-bold text-gray-900">{profile.mentorshipStats.total}</p>
              <p className="text-xs text-gray-500">Total Requests</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-xl">
              <p className="text-lg font-bold text-amber-600">{profile.mentorshipStats.pending}</p>
              <p className="text-xs text-amber-600">Pending</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <p className="text-lg font-bold text-green-600">{profile.mentorshipStats.accepted}</p>
              <p className="text-xs text-green-600">Mentees</p>
            </div>
          </div>
        )}
      </div>

      {/* Advice Topics */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-2">Advice Topics</h2>
        <p className="text-sm text-gray-500 mb-4">Select areas where you can guide students</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ADVICE_TOPIC_OPTIONS.map(topic => (
            <button key={topic} onClick={() => toggleAdviceTopic(topic)}
              className={`px-3 py-2 text-xs rounded-xl border transition-all ${
                (profile.adviceTopics || []).includes(topic)
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Specializations */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">Specializations</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {(profile.specializations || []).map((spec, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-violet-50 text-violet-700 text-xs font-medium rounded-full">
              {spec}<button onClick={() => removeSpecialization(i)}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newSpecialization} onChange={(e) => setNewSpecialization(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
            className={inputCls} placeholder="e.g., System Design, Cloud Architecture, ML" />
          <button onClick={addSpecialization} className="px-4 py-2 bg-violet-50 text-violet-700 rounded-xl hover:bg-violet-100 text-sm font-medium"><Plus className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Links */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">Profile Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><Linkedin className="w-3 h-3" /> LinkedIn</label>
            <input value={profile.linkedin || ''} onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })} className={inputCls} placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><Github className="w-3 h-3" /> GitHub</label>
            <input value={profile.github || ''} onChange={(e) => setProfile({ ...profile, github: e.target.value })} className={inputCls} placeholder="https://github.com/..." />
          </div>
        </div>
      </div>

      {/* Career Path Editor */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Career Path</h2>
          <button onClick={addCareerStep} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 text-xs font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> Add Step</button>
        </div>

        {/* Timeline Preview */}
        {profile.careerPath?.length > 0 && (
          <div className="mb-6 relative pl-6 border-l-2 border-primary-200 space-y-3">
            {[...profile.careerPath].sort((a, b) => a.year - b.year).map((step, j, arr) => (
              <div key={j} className="relative">
                <div className={`absolute -left-[25px] top-1 w-3.5 h-3.5 rounded-full border-2 ${j === arr.length - 1 ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-400'}`} />
                <p className="text-sm font-semibold text-gray-800">{step.role || 'Role'}</p>
                <p className="text-xs text-gray-500">{step.company || 'Company'} · {step.year || 'Year'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Editable Steps */}
        {(profile.careerPath || []).map((step, i) => (
          <div key={i} className="p-4 bg-gray-50 rounded-xl mb-3 relative">
            <button onClick={() => removeCareerStep(i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input value={step.company || ''} onChange={(e) => updateCareerStep(i, 'company', e.target.value)} className={inputCls} placeholder="Company" />
              <input value={step.role || ''} onChange={(e) => updateCareerStep(i, 'role', e.target.value)} className={inputCls} placeholder="Role" />
              <input type="number" min="2000" max="2030" value={step.year || ''} onChange={(e) => updateCareerStep(i, 'year', e.target.value)} className={inputCls} placeholder="Year" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
