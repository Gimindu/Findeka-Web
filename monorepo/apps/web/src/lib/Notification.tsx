// src/NotificationPage.tsx

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import colorClasses from '@/styles/colors';

const NotificationPage = ({ notifications }: { notifications: any[] }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/">
          <button className={`p-2 rounded-full hover:bg-orange-100 transition-colors`}>
            <ArrowLeft size={20} className={colorClasses.textPrimary} />
          </button>
        </Link>
        <h1 className={`text-2xl font-bold ${colorClasses.textPrimary}`}>Notifications</h1>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-lg shadow-sm border ${
                n.read ? 'bg-white' : 'bg-orange-50'
              }`}
            >
              <p className={`text-sm ${colorClasses.textPrimary}`}>{n.message}</p>
              <span className="text-xs text-gray-400">Type: {n.type}</span>
            </div>
          ))
        ) : (
          <p className={colorClasses.textSecondary}>No notifications available.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
