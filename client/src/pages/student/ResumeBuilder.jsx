import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Sparkles, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { CardSkeleton } from '../../components/LoadingSkeleton';

export default function StudentResumeBuilder() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState('modern');
  const [tips, setTips] = useState([]);
  const [loadingTips, setLoadingTips] = useState(false);

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

  const fetchTips = async () => {
    setLoadingTips(true);
    try {
      const { data } = await api.post('/ai/resume-tips');
      setTips(data.data.tips || []);
    } catch {}
    setLoadingTips(false);
  };

  const handleDownload = () => {
    const content = generateResumeHTML();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile?.userId?.name || 'resume'}_resume.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateResumeHTML = () => {
    const p = profile;
    const colors = template === 'modern' ? { primary: '#1D4ED8', bg: '#EFF6FF' } : template === 'classic' ? { primary: '#1e293b', bg: '#f8fafc' } : { primary: '#374151', bg: '#ffffff' };
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${p?.userId?.name} - Resume</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box} body{font-family:'Segoe UI',sans-serif;color:#1e293b;max-width:800px;margin:0 auto;padding:40px}
      h1{color:${colors.primary};font-size:28px;margin-bottom:4px} .contact{color:#64748b;font-size:13px;margin-bottom:20px}
      h2{color:${colors.primary};font-size:16px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid ${colors.primary};padding-bottom:4px;margin:20px 0 10px}
      .item{margin-bottom:12px} .item h3{font-size:14px;font-weight:600} .item p{font-size:13px;color:#475569;line-height:1.5}
      .skills{display:flex;flex-wrap:wrap;gap:6px} .skill{background:${colors.bg};color:${colors.primary};padding:3px 10px;border-radius:4px;font-size:12px;font-weight:500}
      @media print{body{padding:20px}}
    </style></head><body>
    <h1>${p?.userId?.name || ''}</h1>
    <p class="contact">${p?.usn || ''} | ${p?.department || ''} | CGPA: ${p?.cgpa || ''} | ${p?.phone || ''}<br>
    ${p?.userId?.email || ''}${p?.github ? ' | GitHub: ' + p.github : ''}${p?.linkedin ? ' | LinkedIn: ' + p.linkedin : ''}</p>
    ${p?.skills?.length ? `<h2>Skills</h2><div class="skills">${p.skills.map(s => `<span class="skill">${s}</span>`).join('')}</div>` : ''}
    ${p?.projects?.length ? `<h2>Projects</h2>${p.projects.map(pr => `<div class="item"><h3>${pr.title}</h3><p>${pr.description || ''}${pr.techStack ? ' | Tech: ' + pr.techStack : ''}</p></div>`).join('')}` : ''}
    ${p?.internships?.length ? `<h2>Experience</h2>${p.internships.map(int => `<div class="item"><h3>${int.role} at ${int.company}</h3><p>${int.duration || ''} — ${int.description || ''}</p></div>`).join('')}` : ''}
    ${p?.certifications?.length ? `<h2>Certifications</h2>${p.certifications.map(c => `<div class="item"><h3>${c.name}</h3><p>${c.issuer || ''} (${c.year || ''})</p></div>`).join('')}` : ''}
    ${p?.interests?.length ? `<h2>Interests</h2><div class="skills">${p.interests.map(i => `<span class="skill">${i}</span>`).join('')}</div>` : ''}
    </body></html>`;
  };

  if (loading) return <CardSkeleton count={4} />;
  if (!profile) return <p className="text-center text-gray-500 py-10">Profile not found. Please complete your profile first.</p>;

  const templates = [
    { id: 'modern', label: 'Modern', desc: 'Clean blue accents' },
    { id: 'classic', label: 'Classic', desc: 'Traditional layout' },
    { id: 'minimal', label: 'Minimal', desc: 'Simple & elegant' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
          <p className="text-gray-500 text-sm">Generate a professional resume from your profile data</p>
        </div>
        <button onClick={handleDownload} className="px-5 py-2.5 bg-primary-700 text-white text-sm font-semibold rounded-xl hover:bg-primary-800 transition-colors flex items-center gap-2 shadow-lg shadow-primary-700/25">
          <Download className="w-4 h-4" /> Download HTML
        </button>
      </div>

      {/* Template Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {templates.map((t) => (
          <button key={t.id} onClick={() => setTemplate(t.id)}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${template === t.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
            <p className="font-semibold text-sm text-gray-900">{t.label}</p>
            <p className="text-xs text-gray-500">{t.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-auto">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FileText className="w-4 h-4" /> Preview</h2>
          <div className="border rounded-xl p-6 min-h-[400px] bg-gray-50">
            <h3 className="text-2xl font-bold" style={{ color: template === 'modern' ? '#1D4ED8' : '#1e293b' }}>{profile.userId?.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{profile.usn} | {profile.department} | CGPA: {profile.cgpa} | {profile.phone}</p>
            <p className="text-sm text-gray-500">{profile.userId?.email}{profile.github ? ` | ${profile.github}` : ''}{profile.linkedin ? ` | ${profile.linkedin}` : ''}</p>

            {profile.skills?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: template === 'modern' ? '#1D4ED8' : '#1e293b', borderBottom: '2px solid' }}>Skills</h4>
                <div className="flex flex-wrap gap-1.5">{profile.skills.map((s, i) => <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">{s}</span>)}</div>
              </div>
            )}
            {profile.projects?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: template === 'modern' ? '#1D4ED8' : '#1e293b', borderBottom: '2px solid' }}>Projects</h4>
                {profile.projects.map((p, i) => <div key={i} className="mb-2"><p className="text-sm font-semibold">{p.title}</p><p className="text-xs text-gray-500">{p.description}{p.techStack ? ` | ${p.techStack}` : ''}</p></div>)}
              </div>
            )}
            {profile.internships?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: template === 'modern' ? '#1D4ED8' : '#1e293b', borderBottom: '2px solid' }}>Experience</h4>
                {profile.internships.map((int, i) => <div key={i} className="mb-2"><p className="text-sm font-semibold">{int.role} at {int.company}</p><p className="text-xs text-gray-500">{int.duration} — {int.description}</p></div>)}
              </div>
            )}
            {profile.certifications?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: template === 'modern' ? '#1D4ED8' : '#1e293b', borderBottom: '2px solid' }}>Certifications</h4>
                {profile.certifications.map((c, i) => <div key={i} className="mb-1"><p className="text-sm font-semibold">{c.name}</p><p className="text-xs text-gray-500">{c.issuer} ({c.year})</p></div>)}
              </div>
            )}
          </div>
        </div>

        {/* AI Tips */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /> AI Tips</h2>
          </div>
          <button onClick={fetchTips} disabled={loadingTips}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 flex items-center justify-center gap-2 mb-4">
            {loadingTips ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4" /> Get AI Tips</>}
          </button>
          {tips.length > 0 ? (
            <ul className="space-y-3">
              {tips.map((tip, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2 text-sm text-gray-700 p-3 bg-amber-50 rounded-xl">
                  <span className="text-amber-500 font-bold flex-shrink-0">{i + 1}.</span>
                  {tip}
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Click the button above to get AI-powered suggestions to improve your resume.</p>
          )}
        </div>
      </div>
    </div>
  );
}
