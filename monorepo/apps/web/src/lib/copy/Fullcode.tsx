// import React, { useState, useEffect } from 'react';
// import { Search, MapPin, Calendar, Camera, Bell, User, Settings, Star, Trophy, MessageCircle, Filter, Plus, Eye, Heart, Clock, CheckCircle, AlertCircle, Home, List, BarChart3, Shield, LogOut, Phone, Mail, QrCode, CreditCard, Upload, Send, X, ChevronRight, ChevronDown, Award } from 'lucide-react';

// // Mock data for demonstration
// const mockItems = [
//   {
//     id: 1,
//     type: 'lost',
//     title: 'Lost iPhone 15 Pro',
//     category: 'Electronics',
//     location: 'Central Park, NYC',
//     date: '2024-07-10',
//     reward: 100,
//     description: 'Black iPhone 15 Pro with a blue case. Lost near the fountain.',
//     image: '/api/placeholder/200/200',
//     user: 'John Doe',
//     matchScore: 0,
//     status: 'active'
//   },
//   {
//     id: 2,
//     type: 'found',
//     title: 'Found Wallet',
//     category: 'Personal Items',
//     location: 'Times Square, NYC',
//     date: '2024-07-11',
//     reward: 0,
//     description: 'Brown leather wallet found on the street. Contains credit cards.',
//     image: '/api/placeholder/200/200',
//     user: 'Jane Smith',
//     matchScore: 85,
//     status: 'matched'
//   },
//   {
//     id: 3,
//     type: 'lost',
//     title: 'Lost Golden Retriever',
//     category: 'Pets',
//     location: 'Brooklyn Heights',
//     date: '2024-07-09',
//     reward: 500,
//     description: 'Friendly golden retriever named Max. Has a red collar.',
//     image: '/api/placeholder/200/200',
//     user: 'Mike Johnson',
//     matchScore: 0,
//     status: 'active'
//   }
// ];

// const categories = [
//   'Electronics', 'Personal Items', 'Pets', 'Clothing', 'Jewelry', 'Keys', 'Documents', 'Sports Equipment', 'Books', 'Other'
// ];

// const LostFoundAI = () => {
//   const [currentPage, setCurrentPage] = useState('dashboard');
//   const [user, setUser] = useState(null);
//   const [items, setItems] = useState(mockItems);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [showLoginModal, setShowLoginModal] = useState(false);
//   const [showPostModal, setShowPostModal] = useState(false);
//   const [filterCategory, setFilterCategory] = useState('all');
//   const [filterType, setFilterType] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [notifications, setNotifications] = useState([
//     { id: 1, message: 'New match found for your lost item!', type: 'match', read: false },
//     { id: 2, message: 'Someone messaged you about your found item', type: 'message', read: false }
//   ]);
//   const [userPoints, setUserPoints] = useState(1250);
//   const [userRank, setUserRank] = useState('Gold Contributor');

//   // Custom color classes based on your color scheme
//   const colorClasses = {
//     primary: 'bg-[#DD6B20] text-white',
//     primaryHover: 'hover:bg-[#C45D1C]',
//     accent: 'bg-[#FFA451] text-white',
//     accentHover: 'hover:bg-[#E8934A]',
//     background: 'bg-[#FFF8F1]',
//     textPrimary: 'text-[#7B3F00]',
//     textSecondary: 'text-[#C67100]',
//     warning: 'bg-[#FF6F00] text-white',
//     found: 'bg-[#FFB74D] text-white',
//     border: 'border-[#FFA451]',
//     lightBg: 'bg-[#FFF8F1]'
//   };

//   const filteredItems = items.filter(item => {
//     const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
//     const matchesType = filterType === 'all' || item.type === filterType;
//     const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesCategory && matchesType && matchesSearch;
//   });

//   // Login Component
//   const LoginModal = () => {
//     const [isSignup, setIsSignup] = useState(false);
//     const [formData, setFormData] = useState({
//       email: '',
//       password: '',
//       confirmPassword: '',
//       role: 'both'
//     });

//     const handleSubmit = (e: { preventDefault: () => void; }) => {
//       e.preventDefault();
//       setUser({
//         name: 'John Doe',
//         email: formData.email,
//         role: formData.role,
//         points: 1250,
//         rank: 'Gold Contributor'
//       });
//       setIsLoggedIn(true);
//       setShowLoginModal(false);
//     };

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-lg p-6 w-full max-w-md">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className={`text-2xl font-bold ${colorClasses.textPrimary}`}>
//               {isSignup ? 'Sign Up' : 'Login'}
//             </h2>
//             <button onClick={() => setShowLoginModal(false)} className="text-gray-500 hover:text-gray-700">
//               <X size={24} />
//             </button>
//           </div>
          
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Email</label>
//               <input
//                 type="email"
//                 className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
//                 value={formData.email}
//                 onChange={(e) => setFormData({...formData, email: e.target.value})}
//                 required
//               />
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Password</label>
//               <input
//                 type="password"
//                 className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
//                 value={formData.password}
//                 onChange={(e) => setFormData({...formData, password: e.target.value})}
//                 required
//               />
//             </div>
            
//             {isSignup && (
//               <>
//                 <div>
//                   <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Confirm Password</label>
//                   <input
//                     type="password"
//                     className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
//                     value={formData.confirmPassword}
//                     onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Role</label>
//                   <select
//                     className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
//                     value={formData.role}
//                     onChange={(e) => setFormData({...formData, role: e.target.value})}
//                   >
//                     <option value="both">Both (Lost & Found)</option>
//                     <option value="lost">Lost Items Only</option>
//                     <option value="found">Found Items Only</option>
//                   </select>
//                 </div>
//               </>
//             )}
            
//             <button
//               type="submit"
//               className={`w-full py-2 px-4 ${colorClasses.primary} ${colorClasses.primaryHover} rounded-md font-medium transition-colors`}
//             >
//               {isSignup ? 'Sign Up' : 'Login'}
//             </button>
//           </form>
          
//           <div className="mt-4 text-center">
//             <button
//               onClick={() => setIsSignup(!isSignup)}
//               className={`${colorClasses.textSecondary} hover:underline`}
//             >
//               {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Post Item Modal
//   const PostItemModal = () => {
//     const [postType, setPostType] = useState('lost');
//     const [postData, setPostData] = useState({
//       title: '',
//       category: '',
//       location: '',
//       date: '',
//       time: '',
//       color: '',
//       size: '',
//       description: '',
//       reward: '',
//       photos: []
//     });

//     const handleSubmit = (e: { preventDefault: () => void; }) => {
//       e.preventDefault();
//       const newItem = {
//         id: items.length + 1,
//         type: postType,
//         ...postData,
//         user: user.name,
//         matchScore: 0,
//         status: 'active',
//         image: '/api/placeholder/200/200'
//       };
//       setItems([...items, newItem]);
//       setShowPostModal(false);
//       setPostData({
//         title: '',
//         category: '',
//         location: '',
//         date: '',
//         time: '',
//         color: '',
//         size: '',
//         description: '',
//         reward: '',
//         photos: []
//       });
//     };

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//         <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className={`text-2xl font-bold ${colorClasses.textPrimary}`}>
//               Report {postType === 'lost' ? 'Lost' : 'Found'} Item
//             </h2>
//             <button onClick={() => setShowPostModal(false)} className="text-gray-500 hover:text-gray-700">
//               <X size={24} />
//             </button>
//           </div>
          
//           <div className="flex mb-6">
//             <button
//               onClick={() => setPostType('lost')}
//               className={`px-4 py-2 rounded-l-lg font-medium ${postType === 'lost' ? colorClasses.primary : 'bg-gray-200 text-gray-700'}`}
//             >
//               Lost Item
//             </button>
//             <button
//               onClick={() => setPostType('found')}
//               className={`px-4 py-2 rounded-r-lg font-medium ${postType === 'found' ? colorClasses.found : 'bg-gray-200 text-gray-700'}`}
//             >
//               Found Item
//             </button>
//           </div>
          
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Item Name</label>
//                 <input
//                   type="text"
//                   className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
//                   value={postData.title}
//                   onChange={(e) => setPostData({...postData, title: e.target.value})}
//                   required
//                 />
//               </div>
              
//               <div>
//                 <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Category</label>
//                 <select
//                   className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
//                   value={postData.category}
//                   onChange={(e) => setPostData({...postData, category: e.target.value})}
//                   required
//                 >
//                   <option value="">Select Category</option>
//                   {categories.map(cat => (
//                     <option key={cat} value={cat}>{cat}</option>
//                   ))}
//                 </select>
//               </div>
              
//               <div>
//                 <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Location</label>
//                 <input
//                   type="text"
//                   className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
//                   value={postData.location}
//                   onChange={(e) => setPostData({...postData, location: e.target.value})}
//                   required
//                 />
//               </div>
              
//               <div>
//                 <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Date</label>
//                 <input
//                   type="date"
//                   className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
//                   value={postData.date}
//                   onChange={(e) => setPostData({...postData, date: e.target.value})}
//                   required
//                 />
//               </div>
              
//               <div>
//                 <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Color</label>
//                 <input
//                   type="text"
//                   className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
//                   value={postData.color}
//                   onChange={(e) => setPostData({...postData, color: e.target.value})}
//                 />
//               </div>
              
//               <div>
//                 <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Size</label>
//                 <input
//                   type="text"
//                   className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
//                   value={postData.size}
//                   onChange={(e) => setPostData({...postData, size: e.target.value})}
//                 />
//               </div>
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Description</label>
//               <textarea
//                 className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
//                 rows={4}
//                 value={postData.description}
//                 onChange={(e) => setPostData({...postData, description: e.target.value})}
//                 required
//               />
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Reward (Optional)</label>
//               <input
//                 type="number"
//                 className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
//                 value={postData.reward}
//                 onChange={(e) => setPostData({...postData, reward: e.target.value})}
//                 placeholder="Enter reward amount"
//               />
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Photos</label>
//               <div className={`border-2 border-dashed ${colorClasses.border} rounded-lg p-4 text-center`}>
//                 <Camera className="mx-auto mb-2 text-gray-400" size={48} />
//                 <p className="text-gray-600">Click to upload photos</p>
//               </div>
//             </div>
            
//             <button
//               type="submit"
//               className={`w-full py-3 px-4 ${postType === 'lost' ? colorClasses.primary : colorClasses.found} ${colorClasses.primaryHover} rounded-md font-medium transition-colors`}
//             >
//               Post {postType === 'lost' ? 'Lost' : 'Found'} Item
//             </button>
//           </form>
//         </div>
//       </div>
//     );
//   };

//   // Dashboard Component
//   const Dashboard = () => (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h1 className={`text-3xl font-bold ${colorClasses.textPrimary}`}>Dashboard</h1>
//           <p className={`${colorClasses.textSecondary}`}>Find your lost items with AI-powered matching</p>
//         </div>
        
//         <div className="flex gap-3">
//           <button
//             onClick={() => setShowPostModal(true)}
//             className={`px-6 py-3 ${colorClasses.primary} ${colorClasses.primaryHover} rounded-lg font-medium transition-colors flex items-center gap-2`}
//           >
//             <Plus size={20} />
//             Report Item
//           </button>
//           <button className={`px-6 py-3 ${colorClasses.accent} ${colorClasses.accentHover} rounded-lg font-medium transition-colors flex items-center gap-2`}>
//             <Search size={20} />
//             AI Match
//           </button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className={`text-sm ${colorClasses.textSecondary}`}>Total Items</p>
//               <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>{items.length}</p>
//             </div>
//             <List className="text-orange-300" size={32} />
//           </div>
//         </div>
        
//         <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className={`text-sm ${colorClasses.textSecondary}`}>Matches Found</p>
//               <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>12</p>
//             </div>
//             <CheckCircle className="text-green-400" size={32} />
//           </div>
//         </div>
        
//         <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className={`text-sm ${colorClasses.textSecondary}`}>Your Points</p>
//               <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>{userPoints}</p>
//             </div>
//             <Star className="text-yellow-400" size={32} />
//           </div>
//         </div>
        
//         <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className={`text-sm ${colorClasses.textSecondary}`}>Success Rate</p>
//               <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>85%</p>
//             </div>
//             <Trophy className="text-orange-400" size={32} />
//           </div>
//         </div>
//       </div>

//       {/* Search and Filters */}
//       <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
//         <div className="flex flex-col md:flex-row gap-4">
//           <div className="flex-1">
//             <div className="relative">
//               <Search className="absolute left-3 top-3 text-gray-400" size={20} />
//               <input
//                 type="text"
//                 placeholder="Search items..."
//                 className={`w-full pl-10 pr-4 py-2 border ${colorClasses.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//           </div>
          
//           <select
//             className={`px-4 py-2 border ${colorClasses.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
//             value={filterCategory}
//             onChange={(e) => setFilterCategory(e.target.value)}
//           >
//             <option value="all">All Categories</option>
//             {categories.map(cat => (
//               <option key={cat} value={cat}>{cat}</option>
//             ))}
//           </select>
          
//           <select
//             className={`px-4 py-2 border ${colorClasses.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
//             value={filterType}
//             onChange={(e) => setFilterType(e.target.value)}
//           >
//             <option value="all">All Types</option>
//             <option value="lost">Lost Items</option>
//             <option value="found">Found Items</option>
//           </select>
//         </div>
//       </div>

//       {/* Items Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredItems.map(item => (
//           <div key={item.id} className="bg-white rounded-lg shadow-sm border border-orange-100 overflow-hidden">
//             <div className="h-48 bg-gray-100 flex items-center justify-center">
//               <img
//                 src={item.image}
//                 alt={item.title}
//                 className="w-full h-full object-cover"
//               />
//             </div>
            
//             <div className="p-4">
//               <div className="flex items-center justify-between mb-2">
//                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                   item.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
//                 }`}>
//                   {item.type.toUpperCase()}
//                 </span>
//                 {item.matchScore > 0 && (
//                   <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
//                     {item.matchScore}% Match
//                   </span>
//                 )}
//               </div>
              
//               <h3 className={`font-semibold text-lg mb-2 ${colorClasses.textPrimary}`}>{item.title}</h3>
//               <p className={`text-sm ${colorClasses.textSecondary} mb-2`}>{item.category}</p>
//               <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              
//               <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
//                 <MapPin size={16} />
//                 {item.location}
//               </div>
              
//               <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
//                 <Calendar size={16} />
//                 {item.date}
//               </div>
              
//               {item.reward > 0 && (
//                 <div className={`text-sm font-medium ${colorClasses.textSecondary} mb-3`}>
//                   Reward: ${item.reward}
//                 </div>
//               )}
              
//               <div className="flex gap-2">
//                 <button className={`flex-1 py-2 px-3 ${colorClasses.primary} ${colorClasses.primaryHover} rounded-lg text-sm font-medium transition-colors`}>
//                   Contact
//                 </button>
//                 <button className={`px-3 py-2 border ${colorClasses.border} rounded-lg text-sm font-medium ${colorClasses.textSecondary} hover:bg-orange-50 transition-colors`}>
//                   <Eye size={16} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );

//   // Profile Component
//   const Profile = () => (
//     <div className="space-y-6">
//       <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
//         <div className="flex items-center gap-4 mb-6">
//           <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
//             <User className="text-white" size={32} />
//           </div>
//           <div>
//             <h2 className={`text-2xl font-bold ${colorClasses.textPrimary}`}>John Doe</h2>
//             <p className={`${colorClasses.textSecondary}`}>john.doe@email.com</p>
//             <div className="flex items-center gap-2 mt-2">
//               <Star className="text-yellow-400" size={16} />
//               <span className={`text-sm ${colorClasses.textSecondary}`}>{userRank}</span>
//             </div>
//           </div>
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="text-center">
//             <div className={`text-2xl font-bold ${colorClasses.textPrimary}`}>{userPoints}</div>
//             <div className={`text-sm ${colorClasses.textSecondary}`}>Points</div>
//           </div>
//           <div className="text-center">
//             <div className={`text-2xl font-bold ${colorClasses.textPrimary}`}>18</div>
//             <div className={`text-sm ${colorClasses.textSecondary}`}>Items Posted</div>
//           </div>
//           <div className="text-center">
//             <div className={`text-2xl font-bold ${colorClasses.textPrimary}`}>12</div>
//             <div className={`text-sm ${colorClasses.textSecondary}`}>Successful Matches</div>
//           </div>
//         </div>
//       </div>
      
//       <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
//         <h3 className={`text-lg font-semibold mb-4 ${colorClasses.textPrimary}`}>Achievements</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
//             <Trophy className="text-orange-500" size={24} />
//             <div>
//               <div className={`font-medium ${colorClasses.textPrimary}`}>First Match</div>
//               <div className={`text-sm ${colorClasses.textSecondary}`}>Made your first successful match</div>
//             </div>
//           </div>
//           <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
//             <Award className="text-orange-500" size={24} />
//             <div>
//               <div className={`font-medium ${colorClasses.textPrimary}`}>Good Samaritan</div>
//               <div className={`text-sm ${colorClasses.textSecondary}`}>Helped 10 people find their items</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // Analytics Component
//   const Analytics = () => (
//     <div className="space-y-6">
//       <h1 className={`text-3xl font-bold ${colorClasses.textPrimary}`}>Analytics Dashboard</h1>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className={`text-sm ${colorClasses.textSecondary}`}>Total Recoveries</p>
//               <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>247</p>
//             </div>
//             <CheckCircle className="text-green-400" size={32} />
//           </div>
//         </div>
        
//         <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className={`text-sm ${colorClasses.textSecondary}`}>Active Users</p>
//               <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>1,234</p>
//             </div>
//             <User className="text-blue-400" size={32} />
//           </div>
//         </div>
        
//         <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className={`text-sm ${colorClasses.textSecondary}`}>Success Rate</p>
//               <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>78%</p>
//             </div>
//             <BarChart3 className="text-purple-400" size={32} />
//           </div>
//         </div>
        
//         <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className={`text-sm ${colorClasses.textSecondary}`}>Avg Response Time</p>
//               <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>2.3h</p>
//             </div>
//             <Clock className="text-orange-400" size={32} />
//           </div>
//         </div>
//       </div>
      
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
//           <h3 className={`text-lg font-semibold mb-4 ${colorClasses.textPrimary}`}>Most Lost Categories</h3>
//           <div className="space-y-3">
//             {categories.slice(0, 5).map((category, index) => (
//               <div key={category} className="flex items-center justify-between">
//                 <span className={`${colorClasses.textSecondary}`}>{category}</span>
//                 <div className="flex items-center gap-2">
//                   <div className="w-32 bg-gray-200 rounded-full h-2">
//                     <div 
//                       className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full"
//                       style={{ width: `${(5 - index) * 20}%` }}
//                     />
//                   </div>
//                   <span className={`text-sm ${colorClasses.textPrimary}`}>{(5 - index) * 20}%</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
        
//         <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
//           <h3 className={`text-lg font-semibold mb-4 ${colorClasses.textPrimary}`}>Top Locations</h3>
//           <div className="space-y-3">
//             {['Central Park', 'Times Square', 'Brooklyn Bridge', 'Empire State Building', 'Grand Central'].map((location, index) => (
//               <div key={location} className="flex items-center justify-between">
//                 <span className={`${colorClasses.textSecondary}`}>{location}</span>
//                 <div className="flex items-center gap-2">
//                   <div className="w-32 bg-gray-200 rounded-full h-2">
//                     <div 
//                       className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full"
//                       style={{ width: `${(5 - index) * 15 + 25}%` }}
//                     />
//                   </div>
//                   <span className={`text-sm ${colorClasses.textPrimary}`}>{(5 - index) * 15 + 25}%</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // Leaderboard Component
//   const Leaderboard = () => (
//     <div className="space-y-6">
//       <h1 className={`text-3xl font-bold ${colorClasses.textPrimary}`}>Leaderboard</h1>
      
//       <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className={`text-xl font-semibold ${colorClasses.textPrimary}`}>Top Contributors</h2>
//           <select className={`px-4 py-2 border ${colorClasses.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}>
//             <option>This Month</option>
//             <option>All Time</option>
//             <option>This Year</option>
//           </select>
//         </div>
        
//         <div className="space-y-4">
//           {[
//             { name: 'Sarah Johnson', points: 2450, matches: 28, rank: 1 },
//             { name: 'Mike Chen', points: 2280, matches: 25, rank: 2 },
//             { name: 'Emily Davis', points: 2150, matches: 23, rank: 3 },
//             { name: 'John Doe', points: 1250, matches: 12, rank: 4 },
//             { name: 'Alex Smith', points: 1180, matches: 11, rank: 5 }
//           ].map((user, index) => (
//             <div key={user.name} className={`flex items-center justify-between p-4 rounded-lg ${user.name === 'John Doe' ? 'bg-orange-50 border-2 border-orange-200' : 'bg-gray-50'}`}>
//               <div className="flex items-center gap-4">
//                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//                   index === 0 ? 'bg-yellow-400 text-white' :
//                   index === 1 ? 'bg-gray-400 text-white' :
//                   index === 2 ? 'bg-orange-400 text-white' :
//                   'bg-gray-200 text-gray-600'
//                 }`}>
//                   {user.rank}
//                 </div>
//                 <div>
//                   <div className={`font-semibold ${colorClasses.textPrimary}`}>{user.name}</div>
//                   <div className={`text-sm ${colorClasses.textSecondary}`}>{user.matches} successful matches</div>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <div className={`font-bold ${colorClasses.textPrimary}`}>{user.points}</div>
//                 <div className={`text-sm ${colorClasses.textSecondary}`}>points</div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );

//   // Chat Component
//   const Chat = () => {
//     const [messages, setMessages] = useState([
//       { id: 1, sender: 'Jane Smith', message: 'Hi! I found a wallet that matches your description. Could you confirm the details?', timestamp: '2:30 PM', isUser: false },
//       { id: 2, sender: 'You', message: 'Yes! It\'s a brown leather wallet. Does it have a driver\'s license for John Doe?', timestamp: '2:32 PM', isUser: true },
//       { id: 3, sender: 'Jane Smith', message: 'Yes, it does! Where would you like to meet to get it back?', timestamp: '2:35 PM', isUser: false }
//     ]);
//     const [newMessage, setNewMessage] = useState('');

//     const sendMessage = () => {
//       if (newMessage.trim()) {
//         setMessages([...messages, {
//           id: messages.length + 1,
//           sender: 'You',
//           message: newMessage,
//           timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//           isUser: true
//         }]);
//         setNewMessage('');
//       }
//     };

//     return (
//       <div className="space-y-6">
//         <h1 className={`text-3xl font-bold ${colorClasses.textPrimary}`}>Messages</h1>
        
//         <div className="bg-white rounded-lg shadow-sm border border-orange-100 h-96 flex flex-col">
//           <div className="p-4 border-b border-orange-100">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
//                 <User className="text-white" size={20} />
//               </div>
//               <div>
//                 <div className={`font-semibold ${colorClasses.textPrimary}`}>Jane Smith</div>
//                 <div className={`text-sm ${colorClasses.textSecondary}`}>About: Found Wallet</div>
//               </div>
//             </div>
//           </div>
          
//           <div className="flex-1 p-4 overflow-y-auto space-y-3">
//             {messages.map(message => (
//               <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
//                 <div className={`max-w-xs px-4 py-2 rounded-lg ${
//                   message.isUser 
//                     ? `${colorClasses.primary} text-white` 
//                     : 'bg-gray-100 text-gray-800'
//                 }`}>
//                   <div className="text-sm">{message.message}</div>
//                   <div className={`text-xs mt-1 ${message.isUser ? 'text-orange-100' : 'text-gray-500'}`}>
//                     {message.timestamp}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
          
//           <div className="p-4 border-t border-orange-100">
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 placeholder="Type your message..."
//                 className={`flex-1 px-3 py-2 border ${colorClasses.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
//               />
//               <button
//                 onClick={sendMessage}
//                 className={`px-4 py-2 ${colorClasses.primary} ${colorClasses.primaryHover} rounded-lg transition-colors`}
//               >
//                 <Send size={20} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // QR Code Component
//   const QRCode = () => (
//     <div className="space-y-6">
//       <h1 className={`text-3xl font-bold ${colorClasses.textPrimary}`}>QR Code Generator</h1>
      
//       <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
//         <h2 className={`text-xl font-semibold mb-4 ${colorClasses.textPrimary}`}>Generate QR Code for Your Items</h2>
//         <p className={`${colorClasses.textSecondary} mb-6`}>
//           Create QR codes for your valuable items. When someone finds your item and scans the code, they'll be able to contact you directly.
//         </p>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           <div className="space-y-4">
//             <div>
//               <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Item Name</label>
//               <input
//                 type="text"
//                 className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
//                 placeholder="e.g., My Laptop"
//               />
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Contact Information</label>
//               <textarea
//                 className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
//                 rows={3}
//                 placeholder="Email or phone number"
//               />
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Reward Amount (Optional)</label>
//               <input
//                 type="number"
//                 className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
//                 placeholder="$0"
//               />
//             </div>
            
//             <button className={`w-full py-3 px-4 ${colorClasses.primary} ${colorClasses.primaryHover} rounded-lg font-medium transition-colors`}>
//               Generate QR Code
//             </button>
//           </div>
          
//           <div className="flex flex-col items-center justify-center">
//             <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
//               <QrCode className="text-gray-400" size={64} />
//             </div>
//             <p className={`text-sm ${colorClasses.textSecondary} text-center`}>
//               Your QR code will appear here
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // Settings Component
//   const Settings = () => (
//     <div className="space-y-6">
//       <h1 className={`text-3xl font-bold ${colorClasses.textPrimary}`}>Settings</h1>
      
//       <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
//         <h2 className={`text-xl font-semibold mb-4 ${colorClasses.textPrimary}`}>Account Settings</h2>
        
//         <div className="space-y-4">
//           <div>
//             <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Full Name</label>
//             <input
//               type="text"
//               className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
//               defaultValue="John Doe"
//             />
//           </div>
          
//           <div>
//             <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Email</label>
//             <input
//               type="email"
//               className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
//               defaultValue="john.doe@email.com"
//             />
//           </div>
          
//           <div>
//             <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Phone Number</label>
//             <input
//               type="tel"
//               className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
//               placeholder="+1 (555) 123-4567"
//             />
//           </div>
//         </div>
//       </div>
      
//       <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
//         <h2 className={`text-xl font-semibold mb-4 ${colorClasses.textPrimary}`}>Notification Preferences</h2>
        
//         <div className="space-y-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <div className={`font-medium ${colorClasses.textPrimary}`}>Email Notifications</div>
//               <div className={`text-sm ${colorClasses.textSecondary}`}>Receive notifications via email</div>
//             </div>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input type="checkbox" className="sr-only peer" defaultChecked />
//               <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
//             </label>
//           </div>
          
//           <div className="flex items-center justify-between">
//             <div>
//               <div className={`font-medium ${colorClasses.textPrimary}`}>Push Notifications</div>
//               <div className={`text-sm ${colorClasses.textSecondary}`}>Receive push notifications</div>
//             </div>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input type="checkbox" className="sr-only peer" defaultChecked />
//               <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
//             </label>
//           </div>
          
//           <div className="flex items-center justify-between">
//             <div>
//               <div className={`font-medium ${colorClasses.textPrimary}`}>Match Alerts</div>
//               <div className={`text-sm ${colorClasses.textSecondary}`}>Get notified when potential matches are found</div>
//             </div>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input type="checkbox" className="sr-only peer" defaultChecked />
//               <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
//             </label>
//           </div>
//         </div>
//       </div>
      
//       <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
//         <h2 className={`text-xl font-semibold mb-4 ${colorClasses.textPrimary}`}>Privacy Settings</h2>
        
//         <div className="space-y-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <div className={`font-medium ${colorClasses.textPrimary}`}>Public Profile</div>
//               <div className={`text-sm ${colorClasses.textSecondary}`}>Allow others to see your profile</div>
//             </div>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input type="checkbox" className="sr-only peer" defaultChecked />
//               <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
//             </label>
//           </div>
          
//           <div className="flex items-center justify-between">
//             <div>
//               <div className={`font-medium ${colorClasses.textPrimary}`}>Location Sharing</div>
//               <div className={`text-sm ${colorClasses.textSecondary}`}>Share your location for better matching</div>
//             </div>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input type="checkbox" className="sr-only peer" />
//               <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
//             </label>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // Sidebar Component
//   const Sidebar = () => (
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
//           <button
//             onClick={() => setCurrentPage('dashboard')}
//             className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
//               currentPage === 'dashboard' 
//                 ? `${colorClasses.primary} text-white` 
//                 : `${colorClasses.textSecondary} hover:bg-orange-100`
//             }`}
//           >
//             <Home size={20} />
//             Dashboard
//           </button>
          
//           <button
//             onClick={() => setCurrentPage('profile')}
//             className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
//               currentPage === 'profile' 
//                 ? `${colorClasses.primary} text-white` 
//                 : `${colorClasses.textSecondary} hover:bg-orange-100`
//             }`}
//           >
//             <User size={20} />
//             Profile
//           </button>
          
//           <button
//             onClick={() => setCurrentPage('chat')}
//             className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
//               currentPage === 'chat' 
//                 ? `${colorClasses.primary} text-white` 
//                 : `${colorClasses.textSecondary} hover:bg-orange-100`
//             }`}
//           >
//             <MessageCircle size={20} />
//             Messages
//             {notifications.filter(n => !n.read).length > 0 && (
//               <span className={`px-2 py-1 ${colorClasses.warning} text-white text-xs rounded-full`}>
//                 {notifications.filter(n => !n.read).length}
//               </span>
//             )}
//           </button>
          
//           <button
//             onClick={() => setCurrentPage('leaderboard')}
//             className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
//               currentPage === 'leaderboard' 
//                 ? `${colorClasses.primary} text-white` 
//                 : `${colorClasses.textSecondary} hover:bg-orange-100`
//             }`}
//           >
//             <Trophy size={20} />
//             Leaderboard
//           </button>
          
//           <button
//             onClick={() => setCurrentPage('analytics')}
//             className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
//               currentPage === 'analytics' 
//                 ? `${colorClasses.primary} text-white` 
//                 : `${colorClasses.textSecondary} hover:bg-orange-100`
//             }`}
//           >
//             <BarChart3 size={20} />
//             Analytics
//           </button>
          
//           <button
//             onClick={() => setCurrentPage('qr')}
//             className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
//               currentPage === 'qr' 
//                 ? `${colorClasses.primary} text-white` 
//                 : `${colorClasses.textSecondary} hover:bg-orange-100`
//             }`}
//           >
//             <QrCode size={20} />
//             QR Codes
//           </button>
          
//           <button
//             onClick={() => setCurrentPage('settings')}
//             className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
//               currentPage === 'settings' 
//                 ? `${colorClasses.primary} text-white` 
//                 : `${colorClasses.textSecondary} hover:bg-orange-100`
//             }`}
//           >
//             <Settings size={20} />
//             Settings
//           </button>
//         </nav>
        
//         <div className="mt-8 pt-4 border-t border-orange-200">
//           <button
//             onClick={() => {
//               setIsLoggedIn(false);
//               setUser(null);
//               setCurrentPage('dashboard');
//             }}
//             className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${colorClasses.textSecondary} hover:bg-red-100 hover:text-red-600`}
//           >
//             <LogOut size={20} />
//             Logout
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   // Header Component
//   const Header = () => (
//     <div className="bg-white border-b border-orange-200 px-6 py-4">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <h2 className={`text-2xl font-bold ${colorClasses.textPrimary}`}>
//             {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
//           </h2>
//         </div>
        
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

//   // Main render function
//   const renderPage = () => {
//     switch (currentPage) {
//       case 'dashboard':
//         return <Dashboard />;
//       case 'profile':
//         return <Profile />;
//       case 'chat':
//         return <Chat />;
//       case 'leaderboard':
//         return <Leaderboard />;
//       case 'analytics':
//         return <Analytics />;
//       case 'qr':
//         return <QRCode />;
//       case 'settings':
//         return <Settings />;
//       default:
//         return <Dashboard />;
//     }
//   };

//   if (!isLoggedIn) {
//     return (
//       <div className={`min-h-screen ${colorClasses.background} flex items-center justify-center`}>
//         <div className="text-center">
//           <div className={`w-20 h-20 ${colorClasses.primary} rounded-full flex items-center justify-center mx-auto mb-8`}>
//             <Search className="text-white" size={40} />
//           </div>
//           <h1 className={`text-4xl font-bold ${colorClasses.textPrimary} mb-4`}>LostFound AI</h1>
//           <p className={`text-xl ${colorClasses.textSecondary} mb-8`}>
//             Find your lost items with the power of AI
//           </p>
//           <button
//             onClick={() => setShowLoginModal(true)}
//             className={`px-8 py-3 ${colorClasses.primary} ${colorClasses.primaryHover} text-white rounded-lg font-medium transition-colors`}
//           >
//             Get Started
//           </button>
//         </div>
//         {showLoginModal && <LoginModal />}
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen ${colorClasses.background} flex`}>
//       <Sidebar />
//       <div className="flex-1 flex flex-col">
//         <Header />
//         <main className="flex-1 p-6 overflow-y-auto">
//           {renderPage()}
//         </main>
//       </div>
//       {showPostModal && <PostItemModal />}
//     </div>
//   );
// };

// export default LostFoundAI;