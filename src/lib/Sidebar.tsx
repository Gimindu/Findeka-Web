// import colorClasses from "@/styles/colors";
// import { Home, User, MessageCircle, Trophy, BarChart3, QrCode, Settings, Search, LogOut } from "lucide-react";

// const Sidebar = ({ currentPage, setCurrentPage, notifications, onLogout }) => {
//   const unreadCount = notifications.filter(n => !n.read).length;

//   const navItems = [
//     { key: 'dashboard', icon: <Home size={20} />, label: 'Dashboard' },
//     { key: 'profile', icon: <User size={20} />, label: 'Profile' },
//     { key: 'chat', icon: <MessageCircle size={20} />, label: 'Messages' },
//     { key: 'leaderboard', icon: <Trophy size={20} />, label: 'Leaderboard' },
//     { key: 'analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
//     { key: 'qr', icon: <QrCode size={20} />, label: 'QR Codes' },
//     { key: 'settings', icon: <Settings size={20} />, label: 'Settings' }
//   ];

//   return (
//     <div className={`w-64 ${colorClasses.background} border-r border-orange-200 h-screen overflow-y-auto`}>
//       <div className="p-4">
//         <div className="flex items-center gap-2 mb-8">
//           <div className={`w-10 h-10 ${colorClasses.primary} rounded-lg flex items-center justify-center`}>
//             <Search className="text-white" size={24} />
//           </div>
//           <div>
//             <h1 className={`text-xl font-bold ${colorClasses.textPrimary}`}>LostFound AI</h1>
//             <p className={`text-xs ${colorClasses.textSecondary}`}>Find with Intelligence</p>
//           </div>
//         </div>

//         <nav className="space-y-2">
//           {navItems.map(({ key, icon, label }) => (
//             <button
//               key={key}
//               onClick={() => setCurrentPage(key)}
//               className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
//                 currentPage === key
//                   ? `${colorClasses.primary} text-white`
//                   : `${colorClasses.textSecondary} hover:bg-orange-100`
//               }`}
//             >
//               {icon}
//               <span>{label}</span>
//               {key === 'chat' && unreadCount > 0 && (
//                 <span className={`px-2 py-1 ${colorClasses.warning} text-white text-xs rounded-full`}>
//                   {unreadCount}
//                 </span>
//               )}
//             </button>
//           ))}
//         </nav>

//         <div className="mt-8 pt-4 border-t border-orange-200">
//           <button
//             onClick={onLogout}
//             className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${colorClasses.textSecondary} hover:bg-red-100 hover:text-red-600`}
//           >
//             <LogOut size={20} />
//             Logout
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;
