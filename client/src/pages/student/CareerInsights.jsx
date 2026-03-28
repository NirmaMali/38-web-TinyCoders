import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Target, AlertTriangle, CheckCircle, Lightbulb, Award, ArrowRight,
  BarChart3, Users, Briefcase, Globe, BookOpen, Zap, GraduationCap, Star, Layers, Code2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { CardSkeleton } from '../../components/LoadingSkeleton';

// ── Static career resources shown on every load ──
const INDUSTRY_INSIGHTS = [
  { title: 'AI & Machine Learning', growth: '+32%', demand: 'Very High', icon: '🤖', color: 'from-purple-500 to-violet-600', description: 'ML Engineers, Data Scientists, and AI Researchers are among the most sought-after roles in 2026.' },
  { title: 'Cloud & DevOps', growth: '+28%', demand: 'Very High', icon: '☁️', color: 'from-blue-500 to-cyan-600', description: 'Companies are rapidly migrating to cloud. AWS, Azure, and GCP skills are in massive demand.' },
  { title: 'Full Stack Development', growth: '+22%', demand: 'High', icon: '💻', color: 'from-emerald-500 to-green-600', description: 'MERN, MEAN, and Next.js developers continue to be the backbone of product companies.' },
  { title: 'Cybersecurity', growth: '+25%', demand: 'High', icon: '🔒', color: 'from-red-500 to-orange-600', description: 'With increasing cyber threats, security analysts and ethical hackers are critical for every organization.' },
];

const PLACEMENT_TIPS = [
  { tip: 'Start preparing for DSA at least 6 months before placement season', category: 'Interview Prep', icon: Code2 },
  { tip: 'Build at least 3 solid projects — one full-stack, one involving APIs, and one using a database', category: 'Portfolio', icon: Layers },
  { tip: 'Maintain a consistent GitHub contribution graph — recruiters check for activity', category: 'Portfolio', icon: Star },
  { tip: 'Get certified in at least one cloud platform (AWS/Azure/GCP) for an edge', category: 'Skills', icon: Award },
  { tip: 'Practice mock interviews with alumni — use PlaceIQ\'s mentorship feature', category: 'Networking', icon: Users },
  { tip: 'Keep your LinkedIn profile updated with projects, skills, and recommendations', category: 'Branding', icon: GraduationCap },
  { tip: 'Apply to internships early — companies often convert interns to full-time hires', category: 'Strategy', icon: Zap },
  { tip: 'Study system design basics even as a fresher — it shows engineering maturity', category: 'Interview Prep', icon: BookOpen },
];

const SALARY_BENCHMARKS = [
  { range: 'Service-Based (TCS, Infosys, Wipro)', min: '3.5', max: '7', avg: '4.5' },
  { range: 'Mid-Tier Product (Flipkart, Zoho, Freshworks)', min: '8', max: '18', avg: '12' },
  { range: 'Top Product (Google, Microsoft, Amazon)', min: '20', max: '45', avg: '30' },
  { range: 'Startups (Funded)', min: '6', max: '25', avg: '12' },
];

export default function CareerInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTipCategory, setActiveTipCategory] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/student/career-insights');
        setData(res.data.data);
      } catch (err) {
        console.error('Career insights fetch error:', err);
        setError(true);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <CardSkeleton count={6} />;

  const riskConfig = {
    low: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, label: 'Strong', desc: 'You have a strong placement profile!' },
    medium: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle, label: 'Moderate', desc: 'Some areas need improvement to boost your chances.' },
    high: { color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, label: 'Needs Work', desc: 'Focus on building skills and projects to improve your profile.' },
  };

  const risk = data ? (riskConfig[data.riskLevel] || riskConfig.medium) : null;
  const RiskIcon = risk?.icon || Target;

  // Radar chart data
  const radarData = data?.factors ? Object.entries(data.factors)
    .filter(([key]) => key !== 'backlogs')
    .map(([, val]) => ({
      subject: val.label,
      value: Math.max(0, Math.round((val.score / val.max) * 100)),
      fullMark: 100,
    })) : [];

  // Trend
  const trendEmoji = data?.trendDirection === 'improving' ? '📈' : data?.trendDirection === 'declining' ? '📉' : '➡️';
  const trendLabel = data?.trendDirection === 'improving' ? 'Improving' : data?.trendDirection === 'declining' ? 'Declining' : 'Stable';

  const filteredTips = activeTipCategory === 'all'
    ? PLACEMENT_TIPS
    : PLACEMENT_TIPS.filter(t => t.category === activeTipCategory);

  const tipCategories = ['all', ...new Set(PLACEMENT_TIPS.map(t => t.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-6 h-6 text-primary-600" /> Career Insights & Predictions
        </h1>
        <p className="text-gray-500 text-sm">AI-powered analysis, industry trends, and personalized guidance for your placement journey</p>
      </div>

      {/* ═══════════════ SECTION 1: PERSONALIZED ANALYTICS (API data) ═══════════════ */}
      {data && (
        <>
          {/* Placement Probability Hero */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-6 border ${risk.border} ${risk.bg}`}>
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none"
                      stroke={data.riskLevel === 'low' ? '#22c55e' : data.riskLevel === 'medium' ? '#f59e0b' : '#ef4444'}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${data.placementProbability * 2.64} ${264 - data.placementProbability * 2.64}`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${risk.color}`}>{data.placementProbability}%</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Placement Probability</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <RiskIcon className={`w-4 h-4 ${risk.color}`} />
                    <span className={`text-sm font-semibold ${risk.color}`}>{risk.label}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{risk.desc}</p>
                </div>
              </div>
              <div className="text-right bg-white/60 rounded-xl p-4 min-w-[120px]">
                <p className="text-xs text-gray-500 mb-1">Dept Ranking</p>
                <p className="text-3xl font-bold text-gray-900">#{data.peerComparison?.rank || '-'}</p>
                <p className="text-xs text-gray-500">of {data.peerComparison?.total || 0} in {data.peerComparison?.department}</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Eligible Jobs', value: data.eligibleJobCount, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Total Active', value: data.totalActiveJobs, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: `SGPA: ${trendLabel}`, value: trendEmoji, icon: TrendingUp, color: 'text-gray-700', bg: 'bg-gray-50' },
              { label: 'Career Paths', value: data.careerPaths?.length || 0, icon: Award, color: 'text-violet-600', bg: 'bg-violet-50' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`rounded-2xl p-4 shadow-sm border border-gray-100 text-center ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Strength Breakdown */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary-500" /> Profile Strength Breakdown
              </h3>
              <div className="space-y-3">
                {data.factors && Object.entries(data.factors).map(([key, factor]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 font-medium">{factor.label}</span>
                      <span className={`font-bold ${factor.score < 0 ? 'text-red-500' : 'text-gray-700'}`}>
                        {factor.score}/{factor.max}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      {factor.score >= 0 ? (
                        <div className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((factor.score / factor.max) * 100, 100)}%` }} />
                      ) : (
                        <div className="bg-red-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(Math.abs(factor.score) * 7, 100)}%` }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Profile Radar</h3>
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name="Score" dataKey="value" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <BarChart3 className="w-10 h-10 mb-2" />
                  <p className="text-sm">Complete your profile to see your radar chart</p>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          {data.recommendations?.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" /> Personalized Recommendations
              </h3>
              <div className="space-y-2">
                {data.recommendations.map((rec, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
                    <span className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-700">{rec}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {data.missingSkills?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-500" /> Skill Gap — High Demand Skills You're Missing
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.missingSkills.map((skill, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                    className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-3.5 h-3.5 text-red-500" />
                      <p className="text-sm font-semibold text-gray-800">{skill.skill}</p>
                    </div>
                    <p className="text-xs text-gray-500">{skill.reason}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* SGPA Trend */}
          {data.sgpaTrend?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">SGPA Progression {trendEmoji}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.sgpaTrend.map(g => ({ name: `Sem ${g.semester}`, sgpa: g.sgpa }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="sgpa" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Career Paths */}
          {data.careerPaths?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-violet-500" /> Suggested Career Paths (Based on Your Profile)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.careerPaths.map((path, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="p-5 bg-gradient-to-br from-violet-50 to-primary-50 rounded-xl border border-violet-100">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-900">{path.title}</h4>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        path.match === 'High' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>{path.match} Match</span>
                    </div>
                    <div className="flex gap-4 mb-3 text-xs text-gray-500">
                      <span>💰 {path.salary}</span>
                      <span>📈 {path.growth} growth</span>
                    </div>
                    <div className="space-y-2">
                      {path.steps.map((step, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs text-primary-600 font-bold flex-shrink-0 border border-primary-200 mt-0.5">
                            {j + 1}
                          </span>
                          <p className="text-xs text-gray-600">{step}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════ SECTION 2: INDUSTRY INSIGHTS (Always shown) ═══════════════ */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-500" /> Industry Trends 2026
        </h3>
        <p className="text-xs text-gray-500 mb-4">Fastest-growing tech domains and hiring trends this year</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INDUSTRY_INSIGHTS.map((insight, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
              className="relative overflow-hidden rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all group">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${insight.color} opacity-5 rounded-bl-full group-hover:opacity-10 transition-opacity`} />
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{insight.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{insight.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">{insight.growth} growth</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{insight.demand} demand</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{insight.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ═══════════════ SECTION 3: SALARY BENCHMARKS (Always shown) ═══════════════ */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" /> Fresher Salary Benchmarks (LPA)
        </h3>
        <p className="text-xs text-gray-500 mb-4">Expected compensation ranges by company tier for fresh graduates</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Company Tier</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">Min</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">Average</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">Max</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">Range</th>
              </tr>
            </thead>
            <tbody>
              {SALARY_BENCHMARKS.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900">{row.range}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{row.min} LPA</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">{row.avg} LPA</span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">{row.max} LPA</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center">
                      <div className="w-24 bg-gray-100 rounded-full h-2 relative">
                        <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full"
                          style={{ width: `${(parseFloat(row.avg) / 45) * 100}%` }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════ SECTION 4: PLACEMENT TIPS (Always shown) ═══════════════ */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" /> Placement Preparation Tips
        </h3>
        <p className="text-xs text-gray-500 mb-4">Proven strategies from successfully placed students and recruiters</p>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tipCategories.map(cat => (
            <button key={cat} onClick={() => setActiveTipCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all capitalize ${
                activeTipCategory === cat
                  ? 'bg-primary-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredTips.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-primary-50/50 transition-colors">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100">
                <item.icon className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-700 leading-relaxed">{item.tip}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 bg-white text-xs text-gray-500 font-medium rounded border border-gray-100">
                  {item.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ═══════════════ SECTION 5: INTERVIEW PREPARATION ROADMAP (Always shown) ═══════════════ */}
      <div className="bg-gradient-to-br from-primary-50 to-violet-50 rounded-2xl p-6 border border-primary-100">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary-600" /> Interview Preparation Roadmap
        </h3>
        <div className="relative pl-6 space-y-4">
          {[
            { phase: 'Phase 1 (3-6 months before)', title: 'Foundation Building', tasks: ['Learn a programming language deeply (Java/Python/C++)', 'Start DSA from basics — Arrays, Strings, Linked Lists', 'Build 1 solid project to apply concepts'], color: 'bg-blue-500' },
            { phase: 'Phase 2 (2-3 months before)', title: 'Deep Practice', tasks: ['Solve 150+ DSA problems on LeetCode/HackerRank', 'Learn Trees, Graphs, DP, Greedy algorithms', 'Build 2 more projects — full-stack + something unique'], color: 'bg-violet-500' },
            { phase: 'Phase 3 (1-2 months before)', title: 'Interview Ready', tasks: ['Practice mock interviews (peers + alumni)', 'Learn System Design basics', 'Prepare HR answers (strengths, weaknesses, goals)', 'Polish resume to 1 page with impact-driven bullet points'], color: 'bg-emerald-500' },
            { phase: 'Phase 4 (Placement Season)', title: 'Execute & Apply', tasks: ['Apply to every eligible company', 'Revise core subjects (OS, DBMS, Networks, OOPs)', 'Stay calm and maintain consistency', 'Track applications on PlaceIQ dashboard'], color: 'bg-amber-500' },
          ].map((phase, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.12 }}
              className="relative">
              <div className={`absolute -left-[25px] top-1.5 w-3 h-3 rounded-full ${phase.color} ring-4 ring-white`} />
              {i < 3 && <div className="absolute -left-[19px] top-5 w-0.5 h-full bg-gray-200" />}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-400 font-medium mb-1">{phase.phase}</p>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">{phase.title}</h4>
                <div className="space-y-1.5">
                  {phase.tasks.map((task, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-gray-300 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600">{task}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ═══════════════ QUICK ACTIONS ═══════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Improve Profile', to: '/student/profile', icon: Target, color: 'bg-primary-50', hoverColor: 'group-hover:bg-primary-100', iconColor: 'text-primary-700' },
          { label: 'Browse Jobs', to: '/student/jobs', icon: Briefcase, color: 'bg-emerald-50', hoverColor: 'group-hover:bg-emerald-100', iconColor: 'text-emerald-700' },
          { label: 'External Jobs', to: '/student/external-jobs', icon: Globe, color: 'bg-blue-50', hoverColor: 'group-hover:bg-blue-100', iconColor: 'text-blue-700' },
          { label: 'Find Mentors', to: '/student/alumni', icon: Users, color: 'bg-violet-50', hoverColor: 'group-hover:bg-violet-100', iconColor: 'text-violet-700' },
        ].map((action, i) => (
          <Link key={i} to={action.to}
            className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all group">
            <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center ${action.hoverColor} transition-colors`}>
              <action.icon className={`w-5 h-5 ${action.iconColor}`} />
            </div>
            <span className="font-medium text-gray-700 text-sm">{action.label}</span>
            <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-primary-500 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
