import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck } from 'lucide-react';
import api from '../../api/axios';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/notifications');
        setNotifications(data.data);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const typeColor = { info: 'bg-blue-50 text-blue-600', success: 'bg-green-50 text-green-600', warning: 'bg-amber-50 text-amber-600' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm">Stay updated with your placement activities</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button onClick={markAllRead} className="px-4 py-2 bg-primary-50 text-primary-700 text-sm font-medium rounded-xl hover:bg-primary-100 flex items-center gap-2">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>
      {loading ? <CardSkeleton count={5} /> : notifications.length === 0 ? <EmptyState title="No notifications" description="You're all caught up!" icon={Bell} /> : (
        <div className="space-y-2">
          {notifications.map((n, i) => (
            <motion.div key={n._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              className={`flex items-start gap-3 p-4 rounded-2xl transition-colors ${n.isRead ? 'bg-white border border-gray-100' : 'bg-primary-50 border border-primary-100'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${typeColor[n.type] || typeColor.info}`}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead && <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2" />}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
