import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Users, BarChart3, Brain, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../api/axios';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const RISK_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
const PIE_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

export default function PredictiveAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/predictive-analytics');
        setData(res.data.data);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <CardSkeleton count={6} />;
  if (!data) return <p className="text-center text-gray-500 py-10">No analytics data available.</p>;

  const forecast = data.forecast;
  const forecastPieData = [
    { name: 'Likely Placed', value: forecast.likelyToGetPlaced },
    { name: 'Moderate', value: forecast.moderate },
    { name: 'At Risk', value: forecast.atRisk },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Brain className="w-6 h-6 text-violet-600" /> Predictive Analytics
        </h1>
        <p className="text-gray-500 text-sm">AI-driven predictions for placement success and career trends</p>
      </div>

      {/* Forecast KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Unplaced Students', value: forecast.totalUnplaced, icon: Users, color: 'bg-blue-500' },
          { label: 'Likely to Get Placed', value: forecast.likelyToGetPlaced, icon: TrendingUp, color: 'bg-green-500' },
          { label: 'At Risk', value: forecast.atRisk, icon: AlertTriangle, color: 'bg-red-500' },
          { label: 'Predicted Rate', value: `${forecast.predictedPlacementRate}%`, icon: Target, color: 'bg-violet-500' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placement Forecast Pie */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Placement Forecast Distribution</h3>
          {forecastPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={forecastPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50}
                  label={({ name, value }) => `${name}: ${value}`} labelLine={true} fontSize={11}>
                  {forecastPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-16">No data</p>}
        </div>

        {/* Department Predictions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Department-wise Prediction</h3>
          {data.deptPredictions?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.deptPredictions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Legend />
                <Bar dataKey="avgProbability" fill="#4f46e5" name="Avg Probability %" radius={[4, 4, 0, 0]} />
                <Bar dataKey="atRiskCount" fill="#ef4444" name="At Risk Students" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-16">No data</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Demand vs Supply */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-500" /> Skill Demand vs Student Supply</h3>
          {data.skillGaps?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.skillGaps} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="skill" type="category" tick={{ fontSize: 10 }} width={100} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Legend />
                <Bar dataKey="demand" fill="#3b82f6" name="Demand (Jobs)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="supply" fill="#22c55e" name="Supply (Students)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-16">No data</p>}
        </div>

        {/* Salary by CGPA Range */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Average Package by CGPA Range</h3>
          {data.salaryByGrade?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.salaryByGrade.filter(d => d.count > 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  formatter={(val, name) => [name === 'avgPackage' ? `${val} LPA` : val, name === 'avgPackage' ? 'Avg Package' : 'Students']} />
                <Bar dataKey="avgPackage" fill="#8b5cf6" name="Avg Package (LPA)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-16">No data</p>}
        </div>
      </div>

      {/* At-Risk Students Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" /> At-Risk Students (Placement Probability &lt; 40%)
        </h3>
        {data.predictions?.filter(p => p.riskLevel === 'high').length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Student</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Dept</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">CGPA</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Probability</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Skills</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Issues</th>
                </tr>
              </thead>
              <tbody>
                {data.predictions.filter(p => p.riskLevel === 'high').map((s) => (
                  <tr key={s.studentId} className="border-b border-gray-50 hover:bg-red-50/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{s.name}</td>
                    <td className="py-3 px-4 text-gray-600">{s.department}</td>
                    <td className="py-3 px-4 text-gray-600">{s.cgpa}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-bold rounded-full">{s.probability}%</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{s.skillCount}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {s.recommendations?.slice(0, 2).map((r, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-amber-50 text-amber-600 text-xs rounded">{r}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-green-600 text-center py-6">🎉 No students at high risk!</p>
        )}
      </div>

      {/* Top Demanded Skills */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Top Demanded Skills in Active Jobs</h3>
        <div className="flex flex-wrap gap-2">
          {data.topDemandedSkills?.map((skill, i) => (
            <span key={i} className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-full">
              {skill.skill} <span className="text-primary-400 text-xs ml-1">({skill.demand})</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
