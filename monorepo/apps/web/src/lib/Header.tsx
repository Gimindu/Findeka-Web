// import colorClasses from "@/styles/colors";

// const Header = () => (
//     <div className="bg-white border-b border-orange-200 px-6 py-4">
//       <div className="flex items-center justify-between">
//         <h2 className={`text-2xl font-bold ${colorClasses.textPrimary}`}>
//           {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
//         </h2>
//         <div className="flex items-center gap-4">
//           <button className="relative p-2 hover:bg-orange-100 rounded-full transition-colors">
//             <Bell size={20} className={colorClasses.textSecondary} />
//             {notifications.filter(n => !n.read).length > 0 && (
//               <span className={`absolute -top-1 -right-1 w-5 h-5 ${colorClasses.warning} text-white text-xs rounded-full flex items-center justify-center`}>
//                 {notifications.filter(n => !n.read).length}
//               </span>
//             )}
//           </button>
//           <div className="flex items-center gap-2">
//             <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
//               <User className="text-white" size={16} />
//             </div>
//             <div>
//               <div className={`text-sm font-medium ${colorClasses.textPrimary}`}>
//                 {user?.name || 'Guest'}
//               </div>
//               <div className={`text-xs ${colorClasses.textSecondary}`}>
//                 {user?.rank || 'New User'}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// export default Header;