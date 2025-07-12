import { useState, useMemo } from 'react';
import {
  Search, Bell, User, Trophy, MessageCircle, Home, BarChart3, LogOut, QrCode, Settings
} from 'lucide-react';
import Chat from '../Chat';
import Analytics from '../Analytics';
import Dashboard from '../Dashboard';
import Leaderboard from '../LeaderBoard';
import Profile from '../Profile';
import QRCode from '../QrCode';
import colorClasses from '@/styles/colors';
import { motion, AnimatePresence } from 'framer-motion';
import SettingPage from '../Setting';
import NotificationPage from '../Notification';

const LostFoundAI2 = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  type User = { name: string; rank?: string } | null;
  const [user, setUser] = useState<User>(null);
  const [setIsLoggedIn] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [] = useState('');
  const [notifications] = useState([
    { id: 1, message: 'New match found for your lost item!', type: 'match', read: false },
    { id: 2, message: 'Someone messaged you about your found item', type: 'message', read: false },
    { id: 3, message: 'Someone messaged you about your found item', type: 'message', read: false }
  ]);

  const PostItemModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg space-y-4">
        <h2 className="text-xl font-semibold text-center text-[#7B3F00]">Post New Item</h2>
        <div className="space-y-4">
          <input type="text" placeholder="Item Name" className="w-full border rounded p-2" />
          <select className="w-full border rounded p-2">
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
          <textarea placeholder="Description" className="w-full border rounded p-2" rows={3} />
        </div>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            onClick={() => setShowPostModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className={`w-64 ${colorClasses.background} border-r border-orange-200 h-screen overflow-y-auto`}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-8">
          <div className={`w-10 h-10 ${colorClasses.primary} rounded-lg flex items-center justify-center`}>
            <Search className="text-white" size={24} />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${colorClasses.textPrimary}`}>LostFound AI</h1>
            <p className={`text-xs ${colorClasses.textSecondary}`}>Find with Intelligence</p>
          </div>
        </div>
        <nav className="space-y-2">
          {[
            { key: 'dashboard', icon: <Home size={20} />, label: 'Dashboard' },
            { key: 'profile', icon: <User size={20} />, label: 'Profile' },
            { key: 'chat', icon: <MessageCircle size={20} />, label: 'Messages' },
            { key: 'notifications', icon: <Bell size={20} />, label: 'Notifications' }, // ✅ Added
            { key: 'leaderboard', icon: <Trophy size={20} />, label: 'Leaderboard' },
            { key: 'analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
            { key: 'qr', icon: <QrCode size={20} />, label: 'QR Codes' },
            { key: 'settings', icon: <Settings size={20} />, label: 'Settings' }
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setCurrentPage(key)}
              className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-all duration-200 ${
                currentPage === key
                  ? `${colorClasses.primary} text-white shadow`
                  : `${colorClasses.textSecondary} hover:bg-orange-100`
              }`}
            >
              {icon}
              {label}
              {key === 'chat' && notifications.filter(n => !n.read).length > 0 && (
                <span className={`px-2 py-1 ${colorClasses.warning} text-white text-xs rounded-full`}>
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="mt-8 pt-4 border-t border-orange-200">
          <button
            className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${colorClasses.textSecondary} hover:bg-red-100 hover:text-red-600`}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  const Header = () => (
    <div className="bg-white border-b border-orange-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${colorClasses.textPrimary}`}>
          {currentPage === 'dashboard' ? 'Dashboard Overview' : currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
        </h2>
        <div className="flex items-center gap-4">
          <button
            className="relative p-2 hover:bg-orange-100 rounded-full transition-colors"
            onClick={() => setCurrentPage('notifications')} // ✅ Clickable bell
          >
            <Bell size={20} className={colorClasses.textSecondary} />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className={`absolute -top-1 -right-1 w-5 h-5 ${colorClasses.warning} text-white text-xs rounded-full flex items-center justify-center`}>
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <User className="text-white" size={16} />
            </div>
            <div>
              <div className={`text-sm font-medium ${colorClasses.textPrimary}`}>
                {user?.name || 'Guest'}
              </div>
              <div className={`text-xs ${colorClasses.textSecondary}`}>
                {user?.rank || 'New User'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'profile': return <Profile />;
      case 'chat': return <Chat />;
      case 'notifications': return <NotificationPage notifications={notifications} />; 
      case 'leaderboard': return <Leaderboard />;
      case 'analytics': return <Analytics />;
      case 'qr': return <QRCode />;
      case 'settings': return <SettingPage />;
      default: return <Dashboard />;
    }
  };

  const RenderedPage = useMemo(() => renderPage(), [currentPage]);

  return (
    <div className={`min-h-screen ${colorClasses.background} flex`}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {RenderedPage}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {showPostModal && <PostItemModal />}
    </div>
  );
};

export default LostFoundAI2;
