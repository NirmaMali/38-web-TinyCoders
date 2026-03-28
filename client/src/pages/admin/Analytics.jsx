import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../api/axios';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const COLORS = ['#1D4ED8', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#2563EB', '#1E40AF', '#1E3A8A'];

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const res = await api.get('/admin/analytics'); setData(res.data.data); } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <CardSkeleton count={4} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Placement Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Placement Rate by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.departmentWise || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="department" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <Legend />
              <Bar dataKey="total" fill="#93C5FD" name="Total" radius={[4, 4, 0, 0]} />
              <Bar dataKey="placed" fill="#1D4ED8" name="Placed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Year-over-Year Placement Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.yearOverYear || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <Line type="monotone" dataKey="rate" stroke="#1D4ED8" strokeWidth={3} dot={{ fill: '#1D4ED8', r: 5 }} name="Placement %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Company-wise Hiring Distribution</h3>
          {data?.companyWise?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.companyWise} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={true} fontSize={11}>
                  {data.companyWise.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-400 py-20 text-sm">No data available</p>}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Package Distribution</h3>
          {data?.packageTrends?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.packageTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="company" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="package" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Package (LPA)" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-400 py-20 text-sm">No data available</p>}
        </div>
      </div>
    </div>
  );
}
