import { useState, useMemo } from 'react';
import {
  Search, Bell, User, Trophy, MessageCircle, Home, BarChart3, LogOut, QrCode, Settings, Menu
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // collapsed by default for mobile
  type User = { name: string; rank?: string } | null;
  const [user] = useState<User>(null);


  const [notifications] = useState([
    { id: 1, message: 'New match found for your lost item!', type: 'match', read: false },
    { id: 2, message: 'Someone messaged you about your found item', type: 'message', read: false },
    { id: 3, message: 'Someone messaged you about your found item', type: 'message', read: false }
  ]);

  const Sidebar = () => (
    <div className={`
      fixed md:static z-50 top-0 left-0 h-full 
      ${isSidebarCollapsed ? '-translate-x-full' : 'translate-x-0'} 
      md:translate-x-0 transition-transform duration-300 ease-in-out
      ${isSidebarCollapsed ? 'w-64' : 'w-64'} 
      ${colorClasses.background} border-r border-orange-200 overflow-y-auto
    `}>
      <div className="p-4 pt-16 md:pt-4">
        <div className="flex items-center gap-2 mb-8">
  <div className={`w-10 h-10 ${colorClasses.primary} rounded-lg flex items-center justify-center`}>
    <Search className="text-white" size={24} />
  </div>
  <div className={`${isSidebarCollapsed ? 'hidden' : 'block'} md:block`}>
    <h1 className={`text-xl font-bold ${colorClasses.textPrimary}`}>LostFound AI</h1>
    <p className={`text-xs ${colorClasses.textSecondary}`}>Find with Intelligence</p>
  </div>
</div>


        <nav className="space-y-5">
          {[
            { key: 'dashboard', icon: <Home size={30} />, label: 'Dashboard' },
            { key: 'profile', icon: <User size={30} />, label: 'Profile' },
            { key: 'chat', icon: <MessageCircle size={30} />, label: 'Messages' },
            { key: 'notifications', icon: <Bell size={30} />, label: 'Notifications' },
            { key: 'leaderboard', icon: <Trophy size={30} />, label: 'Leaderboard' },
            { key: 'analytics', icon: <BarChart3 size={30} />, label: 'Analytics' },
            { key: 'qr', icon: <QrCode size={30} />, label: 'QR Codes' },
            { key: 'settings', icon: <Settings size={30} />, label: 'Settings' }
          ].map(({ key, icon, label }) => (
            <div key={key} className="relative group">
              <button
                onClick={() => {
                  setCurrentPage(key);
                  setIsSidebarCollapsed(true); // close drawer on mobile
                }}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-all duration-200 relative ${
                  currentPage === key
                    ? `${colorClasses.primary} text-white shadow`
                    : `${colorClasses.textSecondary} hover:bg-orange-100`
                }`}
              >
                {icon}
                <span className="text-base">{label}</span>
                {key === 'chat' && notifications.filter(n => !n.read).length > 0 && (
                  <span className={`px-2 py-1 ${colorClasses.warning} text-white text-xs rounded-full ml-auto`}>
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
            </div>
          ))}
        </nav>

        <div className="mt-8 pt-4 border-t border-orange-200">
          <div className="relative group">
            <button
              className="w-full px-4 py-2 text-left rounded-lg flex items-center gap-3 transition-colors text-red-500 hover:bg-red-100"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const Header = () => (
    <div className="bg-white border-b border-orange-200 px-4 md:px-6 py-2 md:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-orange-100 rounded-lg transition-colors md:hidden"
          >
            <Menu size={20} className={colorClasses.textSecondary} />
          </button>
          <h2 className={`text-lg md:text-2xl font-bold ${colorClasses.textPrimary}`}>
            {currentPage === 'dashboard'
              ? 'Dashboard Overview'
              : currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="relative p-2 hover:bg-orange-100 rounded-full transition-colors"
            onClick={() => setCurrentPage('notifications')}
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
            <div className="hidden sm:block">
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
    <>
      <div className="min-h-screen flex flex-col md:flex-row">
        <Sidebar />
        {!isSidebarCollapsed && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
            onClick={() => setIsSidebarCollapsed(true)}
          />
        )}
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
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
      </div>
    </>
  );
};

export default LostFoundAI2;
