import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, Briefcase, TrendingUp, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../api/axios';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const COLORS = ['#1D4ED8', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#2563EB', '#1E40AF', '#1E3A8A'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dashRes, anaRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/analytics'),
        ]);
        setData(dashRes.data.data);
        setAnalytics(anaRes.data.data);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <CardSkeleton count={4} />;

  const stats = [
    { label: 'Total Students', value: data?.totalStudents || 0, icon: GraduationCap, color: 'bg-blue-500' },
    { label: 'Placed Students', value: data?.placedStudents || 0, icon: Users, color: 'bg-green-500' },
    { label: 'Placement Rate', value: `${data?.placementRate || 0}%`, icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Avg Package', value: `${data?.avgPackage || 0} LPA`, icon: DollarSign, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
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
        {/* Placement by Department */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Placement Rate by Department</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics?.departmentWise || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="department" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <Bar dataKey="rate" fill="#1D4ED8" radius={[6, 6, 0, 0]} name="Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Company-wise hiring */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Company-wise Hiring</h3>
          {analytics?.companyWise?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={analytics.companyWise} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name} (${value})`} labelLine={false} fontSize={11}>
                  {analytics.companyWise.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-10">No data</p>}
        </div>
      </div>

      {/* Top Students */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Top Performing Students</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Rank</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Department</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">CGPA</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Score</th>
            </tr></thead>
            <tbody>
              {data?.topStudents?.map((s, i) => (
                <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4"><span className="w-6 h-6 bg-primary-50 text-primary-700 rounded-full inline-flex items-center justify-center text-xs font-bold">{i + 1}</span></td>
                  <td className="py-3 px-4 font-medium text-gray-900">{s.userId?.name || 'Unknown'}</td>
                  <td className="py-3 px-4 text-gray-600">{s.department}</td>
                  <td className="py-3 px-4 text-gray-600">{s.cgpa}</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs font-medium rounded-full">{s.performanceScore}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
