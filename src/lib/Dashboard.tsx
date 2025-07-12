import { useState } from 'react';
import { Plus, Search, List, CheckCircle, Star, Trophy, MapPin, Calendar, Eye } from 'lucide-react';
import colorClasses from '@/styles/colors'; // Ensure this path is correct
import { Link } from 'react-router-dom';
  const mockItems = [
  { id: 1, name: "Wallet", category: "Accessories", type: "lost" },
  { id: 2, name: "Phone", category: "Electronics", type: "found" }
];

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showPostModal, setShowPostModal] = useState(false);
  const [] = useState(mockItems);
  

  // Mock data for demonstration (replace with actual props or fetched data)


  const items = [
    {
    id: 1,
    type: 'lost',
    title: 'Lost iPhone 15 Pro',
    category: 'Electronics',
    location: 'Central Park, NYC',
    date: '2024-07-10',
    reward: 100,
    description: 'Black iPhone 15 Pro with a blue case. Lost near the fountain.',
    image: '/api/placeholder/200/200',
    user: 'John Doe',
    matchScore: 0,
    status: 'active'
  },
  {
    id: 2,
    type: 'found',
    title: 'Found Wallet',
    category: 'Personal Items',
    location: 'Times Square, NYC',
    date: '2024-07-11',
    reward: 0,
    description: 'Brown leather wallet found on the street. Contains credit cards.',
    image: '/api/placeholder/200/200',
    user: 'Jane Smith',
    matchScore: 85,
    status: 'matched'
  },
  {
    id: 3,
    type: 'lost',
    title: 'Lost Golden Retriever',
    category: 'Pets',
    location: 'Brooklyn Heights',
    date: '2024-07-09',
    reward: 500,
    description: 'Friendly golden retriever named Max. Has a red collar.',
    image: '/api/placeholder/200/200',
    user: 'Mike Johnson',
    matchScore: 0,
    status: 'active'
  }
  ];

  const categories = [  'Electronics', 'Personal Items', 'Pets', 'Clothing', 'Jewelry', 'Keys', 'Documents', 'Sports Equipment', 'Books', 'Other'
];

  const userPoints = 120;

  // Filtered items logic
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${colorClasses.textPrimary}`}>Dashboard</h1>
          <p className={`${colorClasses.textSecondary}`}>Find your lost items with AI-powered matching</p>
        </div>

        <div className="flex gap-3">
            <Link to="/report-item">
                <button
                    className={`px-6 py-3 ${colorClasses.primary} ${colorClasses.primaryHover} rounded-lg font-medium transition-colors flex items-center gap-2`}
                >
                    <Plus size={20} />
                    Report Item
                </button>
            </Link>
            <button className={`px-6 py-3 ${colorClasses.accent} ${colorClasses.accentHover} rounded-lg font-medium transition-colors flex items-center gap-2`}>
            <Search size={20} />
            AI Match
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Items" value={items.length} icon={<List className="text-orange-300" size={32} />} />
        <StatCard title="Matches Found" value={12} icon={<CheckCircle className="text-green-400" size={32} />} />
        <StatCard title="Your Points" value={userPoints} icon={<Star className="text-yellow-400" size={32} />} />
        <StatCard title="Success Rate" value="85%" icon={<Trophy className="text-orange-400" size={32} />} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search items..."
              className={`w-full pl-10 pr-4 py-2 border ${colorClasses.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className={`px-4 py-2 border ${colorClasses.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            className={`px-4 py-2 border ${colorClasses.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="lost">Lost Items</option>
            <option value="found">Found Items</option>
          </select>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border border-orange-100 overflow-hidden">
            <div className="h-48 bg-gray-100 flex items-center justify-center">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {item.type.toUpperCase()}
                </span>
                {item.matchScore > 0 && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    {item.matchScore}% Match
                  </span>
                )}
              </div>

              <h3 className={`font-semibold text-lg mb-2 ${colorClasses.textPrimary}`}>{item.title}</h3>
              <p className={`text-sm ${colorClasses.textSecondary} mb-2`}>{item.category}</p>
              <p className="text-sm text-gray-600 mb-2">{item.description}</p>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <MapPin size={16} />
                {item.location}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <Calendar size={16} />
                {item.date}
              </div>

              {item.reward > 0 && (
                <div className={`text-sm font-medium ${colorClasses.textSecondary} mb-3`}>
                  Reward: ${item.reward}
                </div>
              )}

              <div className="flex gap-2">
                <button className={`flex-1 py-2 px-3 ${colorClasses.primary} ${colorClasses.primaryHover} rounded-lg text-sm font-medium transition-colors`}>
                  Contact
                </button>
                <button className={`px-3 py-2 border ${colorClasses.border} rounded-lg text-sm font-medium ${colorClasses.textSecondary} hover:bg-orange-50 transition-colors`}>
                  <Eye size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Optional: Extracted StatCard component for cleaner code
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-orange-700">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}
