import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  CheckCircle2,
  Trophy,
  MapPin,
  Calendar,
  ArrowUpRight,
  Filter
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { checkHealth } from "@/services/aiService";

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyBackend = async () => {
      const isOnline = await checkHealth();
      setIsBackendOnline(isOnline);
    };
    verifyBackend();
    
    // Optional: Poll every 30 seconds
    const interval = setInterval(verifyBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  // Mock data preserved from original
  const items = [
    {
      id: 1,
      type: "lost",
      title: "Lost iPhone 15 Pro",
      category: "Electronics",
      location: "Central Park, NYC",
      date: "2024-07-10",
      reward: 100,
      description: "Black iPhone 15 Pro with a blue case. Lost near the fountain.",
      image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=2670&auto=format&fit=crop",
      matchScore: 0,
      status: "active",
    },
    {
      id: 2,
      type: "found",
      title: "Found Leather Wallet",
      category: "Personal Items",
      location: "Times Square, NYC",
      date: "2024-07-11",
      reward: 0,
      description: "Brown leather wallet found on the street. Contains credit cards.",
      image: "https://images.unsplash.com/photo-1627123424574-181ce5171700?auto=format&fit=crop&q=80&w=2576&ixlib=rb-4.0.3", // Updated URL
      matchScore: 85,
      status: "matched",
    },
    {
      id: 3,
      type: "lost",
      title: "Golden Retriever",
      category: "Pets",
      location: "Brooklyn Heights",
      date: "2024-07-09",
      reward: 500,
      description: "Friendly golden retriever named Max. Has a red collar.",
      image: "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=2562&auto=format&fit=crop",
      matchScore: 0,
      status: "active",
    },
    {
      id: 4,
       type: "found",
       title: "Blue Backpack",
       category: "Clothing",
       location: "Subway Station",
       date: "2024-07-12",
       reward: 0,
       description: "Nike backend found near the ticket counter.",
       image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2574&auto=format&fit=crop",
       matchScore: 40,
       status: "active"
    }
  ];

  const categories = ["Electronics", "Personal Items", "Pets", "Clothing", "Keys", "Documents", "Other"];

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <DashboardLayout>
      {/* Hero / Quick Actions */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-r from-[#DD6B20] to-[#FF8C42] rounded-2xl p-8 text-white relative overflow-hidden shadow-lg shadow-orange-500/20">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <h1 className="text-3xl font-bold">Welcome back, Gimindu!</h1>
                    
                    {/* Backend Status Indicator */}
                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-colors ${
                        isBackendOnline === true ? 'bg-emerald-500/20 text-white border border-emerald-400/30' : 
                        isBackendOnline === false ? 'bg-red-500/20 text-white border border-red-400/30' :
                        'bg-white/10 text-white/70'
                    }`}>
                        <div className={`w-2 h-2 rounded-full ${
                            isBackendOnline === true ? 'bg-emerald-400 animate-pulse' : 
                            isBackendOnline === false ? 'bg-red-400' :
                            'bg-gray-400'
                        }`} />
                        {isBackendOnline === true ? 'AI Service Online' : 
                         isBackendOnline === false ? 'AI Service Offline' : 
                         'Connecting...'}
                    </div>
                </div>
                
                <p className="text-orange-50 mb-6 max-w-md">You have 2 items with potential matches today. Check them out to reunite with your belongings.</p>
                <div className="flex gap-3">
                   <Link to="/report-item">
                    <Button variant="secondary" className="bg-slate-100 text-orange-700 hover:bg-white border-none">
                        <Plus className="mr-2 h-4 w-4" /> Report New Item
                    </Button>
                   </Link>
                   <Button variant="outline" className="bg-orange-600/20 border-white/20 text-white hover:bg-orange-600/30 hover:text-white backdrop-blur-sm">
                        View All Activity
                   </Button>
                </div>
            </div>
            {/* Abstract Shapes */}
            <div className="absolute right-0 top-0 h-64 w-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-20 h-32 w-32 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        <div className="grid grid-rows-2 gap-4">
             <Card className="bg-white border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-shadow">
                 <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Trophy className="h-24 w-24 text-yellow-500" />
                 </div>
                 <CardContent className="p-6">
                    <div className="text-sm font-medium text-slate-600 mb-1">Your Impact</div>
                    <div className="text-3xl font-bold text-slate-900">120 pts</div>
                    <div className="flex items-center text-xs text-green-600 mt-2 font-medium">
                        <ArrowUpRight className="h-3 w-3 mr-1" /> Top 5% Contributor
                    </div>
                 </CardContent>
             </Card>
              <Card className="bg-white border-none shadow-sm flex flex-col justify-center group hover:shadow-md transition-shadow">
                 <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium text-slate-600">Success Rate</div>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900">85%</div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{ width: '85%' }}></div>
                    </div>
                 </CardContent>
             </Card>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
             <Input 
                placeholder="Search lost or found items..." 
                className="pl-10 bg-white border-slate-200 shadow-sm h-11 text-slate-900"
                icon={<Search className="h-4 w-4" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
             <Button 
                variant={filterCategory === 'all' ? 'default' : 'outline'} 
                onClick={() => setFilterCategory('all')}
                className={filterCategory === 'all' ? '' : 'bg-white border-slate-200 shadow-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50'}
             >
                All
             </Button>
             {categories.map(cat => (
                <Button 
                    key={cat}
                    variant={filterCategory === cat ? 'default' : 'outline'}
                    onClick={() => setFilterCategory(cat)}
                    className={filterCategory === cat ? '' : 'bg-white border-slate-200 shadow-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50'}
                >
                    {cat}
                </Button>
             ))}
             <Button variant="outline" size="icon" className="bg-white border-slate-200 shadow-sm text-slate-600 shrink-0 hover:bg-slate-50 hover:text-slate-900">
                <Filter className="h-4 w-4" />
             </Button>
          </div>
      </div>

      {/* Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredItems.map((item) => (
            <motion.div key={item.id} variants={itemAnim}>
                <Card className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group bg-white h-full flex flex-col">
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                        <img 
                            src={item.image} 
                            alt={item.title} 
                            onError={(e) => {
                                e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image";
                            }}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                                item.type === 'lost' 
                                ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/20' 
                                : 'bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/20'
                            }`}>
                                {item.type}
                            </span>
                             {/* {item.matchScore > 0 && (
                                <span className="px-2.5 py-1 bg-yellow-400/90 text-yellow-950 rounded-full text-xs font-bold backdrop-blur-md shadow-lg flex items-center gap-1">
                                    {item.matchScore}% Match
                                </span>
                            )} */}
                        </div>
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-[#DD6B20] transition-colors">{item.title}</h3>
                        </div>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                        
                        <div className="mt-auto space-y-2">
                             <div className="flex items-center text-xs text-slate-500 font-medium">
                                <MapPin className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                                {item.location}
                            </div>
                            <div className="flex items-center text-xs text-slate-500 font-medium">
                                <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                                {item.date}
                            </div>
                        </div>

                         <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                            <Button className="w-full bg-slate-50 text-slate-900 hover:bg-slate-100 shadow-none border border-slate-200">
                                Details
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        ))}
      </motion.div>
    </DashboardLayout>
  );
}
