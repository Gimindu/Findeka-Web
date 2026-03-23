import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Award, Star, MapPin, Calendar, Edit, Medal, Search, Trash2, X, AlertTriangle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getUserProfile, fetchAllItems, ItemMatch, deleteItem } from "../../services/aiService";
import { useNavigate, Link } from "react-router-dom";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [userItems, setUserItems] = useState<ItemMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const initDelete = (itemId: string) => {
      setConfirmDeleteId(itemId);
  };

  const confirmDelete = async () => {
      if (!confirmDeleteId) return;
      const itemId = confirmDeleteId;
      setConfirmDeleteId(null);
      
      setDeletingId(itemId);
      try {
          await deleteItem(itemId);
          setUserItems(prev => prev.filter((i: any) => i._id !== itemId && i.id !== itemId));
      } catch (err) {
          setErrorMsg("Failed to delete the item. Please try again.");
          console.error(err);
      } finally {
          setDeletingId(null);
      }
  };

  useEffect(() => {
    if (!user) {
        navigate('/auth');
        return;
    }

    const fetchData = async () => {
        try {
            const [profileData, allItemsData] = await Promise.all([
                getUserProfile(user.uid),
                fetchAllItems()
            ]);
            setProfile(profileData);
            
            // Filter to only items reported by this user
            const myItems = allItemsData.items.filter((item: any) => item.uid === user.uid);
            myItems.sort((a, b) => new Date(b.created_at || b.date_lost || b.date_found).getTime() - new Date(a.created_at || a.date_lost || a.date_found).getTime());
            setUserItems(myItems);
            
        } catch (error) {
            console.error("Failed to load profile data", error);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [user, navigate]);

  if (loading) {
      return (
          <DashboardLayout>
              <div className="flex justify-center items-center h-full">Loading...</div>
          </DashboardLayout>
      );
  }

  const { firstName, lastName, location, stats = {}, created_at } = profile || {};
  const fullName = firstName ? `${firstName} ${lastName || ''}`.trim() : user?.email?.split('@')[0] || "User";
  const userLocation = location || "Unknown Location";
  const joinDate = created_at ? new Date(created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Recently";

  return (
    <DashboardLayout>
       <div className="max-w-4xl mx-auto space-y-6 pb-12">
          {/* Hero Section */}
          <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-100">
              <div className="h-32 bg-gradient-to-r from-orange-400 to-red-500"></div>
              <div className="px-6 pb-6 mt-[-3rem] flex flex-col md:flex-row items-end md:items-end gap-6 relative z-10">
                  <div className="rounded-full p-1 bg-white shadow-md">
                      <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop" alt="Profile" className="h-full w-full object-cover" />
                      </div>
                  </div>
                  <div className="flex-1 min-w-0 pb-2 text-center md:text-left">
                      <h1 className="text-2xl font-bold text-slate-900">{fullName}</h1>
                      <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2 text-sm mt-1">
                          <MapPin className="h-4 w-4" /> {userLocation} • Joined {joinDate}
                      </p>
                      {profile?.phone && (
                          <p className="text-slate-500 text-sm mt-1">{profile.phone}</p>
                      )}
                  </div>
                  <div className="pb-2 w-full md:w-auto">
                      <Button onClick={() => navigate('/settings')} className="w-full md:w-auto bg-[#DD6B20] hover:bg-[#C05615]">
                          <Edit className="h-4 w-4 mr-2" /> Edit Profile
                      </Button>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stats Card */}
             <div className="md:col-span-2 space-y-6">
                 <div className="grid grid-cols-3 gap-4">
                     {[
                         { label: "Points", value: stats.points || 0, icon: Star, color: "text-yellow-500", bg: "bg-yellow-50" },
                         { label: "Items Found", value: stats.items_found || 0, icon: Trophy, color: "text-orange-500", bg: "bg-orange-50" },
                         { label: "Matches", value: stats.matches || 0, icon: Award, color: "text-emerald-500", bg: "bg-emerald-50" },
                     ].map((stat, i) => (
                         <Card key={i} className="border-none shadow-sm">
                             <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                 <div className={`p-3 rounded-full mb-3 ${stat.bg}`}>
                                     <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                 </div>
                                 <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                                 <p className="text-sm text-slate-500">{stat.label}</p>
                             </CardContent>
                         </Card>
                     ))}
                 </div>

                 <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Achievements</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { title: "Good Samaritan", desc: "Returned 10 items", icon: Medal, color: "text-blue-500", bg: "bg-blue-50" },
                            { title: "Rapid Responder", desc: "Replied within 5 mins", icon: ClockIcon, color: "text-purple-500", bg: "bg-purple-50" },
                            { title: "Community Pillar", desc: "Top 5% contributor", icon: CrownIcon, color: "text-yellow-600", bg: "bg-yellow-100" },
                            { title: "Verified Finder", desc: "ID Verified", icon: CheckCircleIcon, color: "text-green-500", bg: "bg-green-50" },
                        ].map((ach, i) => (
                             <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                <div className={`p-2 rounded-lg ${ach.bg}`}>
                                    <ach.icon className={`h-5 w-5 ${ach.color}`} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 text-sm">{ach.title}</h4>
                                    <p className="text-xs text-slate-500">{ach.desc}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                 </Card>
             </div>

             {/* Sidebar Info */}
             <div className="space-y-6">
                <Card className="border-none shadow-sm h-full">
                    <CardHeader>
                        <CardTitle>About Me</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-slate-600">
                        <p>
                            {profile?.about || "No bio added yet. Go to Settings to add one!"}
                        </p>
                        <div className="pt-4 border-t border-slate-100 space-y-3">
                             <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                     <Calendar className="h-4 w-4 text-slate-500" />
                                 </div>
                                 <div>
                                     <p className="text-xs text-slate-400">Last Active</p>
                                     <p className="font-medium text-slate-900">Just now</p>
                                 </div>
                             </div>
                        </div>
                    </CardContent>
                </Card>
             </div>
          </div>
          {/* My Items Section */}
          <div className="mt-12">
             <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-2">My Reported Items</h2>
             {userItems.length === 0 ? (
                 <Card className="border-none shadow-sm bg-slate-50">
                     <CardContent className="p-8 text-center flex flex-col items-center">
                         <div className="h-16 w-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                             <Search className="h-8 w-8 text-slate-400" />
                         </div>
                         <h3 className="text-lg font-semibold text-slate-900">No items reported yet</h3>
                         <p className="text-slate-500 mt-1 max-w-sm">When you report a found or lost item, it will appear here so you can track its status.</p>
                         <Button onClick={() => navigate('/report-item')} className="mt-6 bg-[#DD6B20] hover:bg-[#C05616]">
                             Report an Item Now
                         </Button>
                     </CardContent>
                 </Card>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {userItems.map((item: any) => (
                         <Card key={item._id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col bg-white">
                             <div className="h-48 bg-slate-100 relative">
                                 <img 
                                     src={item.image_url || "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image"} 
                                     alt={item.name}
                                     className="w-full h-full object-cover relative z-0"
                                     onError={(e) => {
                                         e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image";
                                     }}
                                 />
                                 <div className="absolute top-3 left-3 z-10">
                                     <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                                         item.type === 'lost' || item.type === 'Lost'
                                         ? 'bg-red-500/90 text-white' 
                                         : 'bg-emerald-500/90 text-white'
                                     }`}>
                                         {item.type || 'unknown'}
                                     </span>
                                 </div>
                                 <div className="absolute top-3 right-3 z-10 flex gap-2">
                                     <button 
                                         onClick={() => initDelete(item._id || item.id)}
                                         disabled={deletingId === (item._id || item.id)}
                                         className="p-1.5 bg-white/90 hover:bg-red-50 text-red-500 rounded-md backdrop-blur-md shadow-sm transition-colors border border-transparent hover:border-red-200 disabled:opacity-50"
                                         title="Delete Item"
                                     >
                                         <Trash2 className="h-4 w-4" />
                                     </button>
                                     <span className={`px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-md shadow-sm flex items-center ${
                                         item.status === 'resolved' 
                                         ? 'bg-green-100/95 text-green-700' 
                                         : 'bg-blue-100/95 text-blue-700'
                                     }`}>
                                         {item.status === 'resolved' ? 'Resolved' : 'Active'}
                                     </span>
                                 </div>
                             </div>
                             <CardContent className="p-5 flex flex-col flex-1">
                                 <h3 className="font-bold text-slate-900 mb-1 text-lg line-clamp-1">{item.name}</h3>
                                 <p className="flex items-center text-xs text-slate-500 mb-2">
                                     <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                     {new Date(item.created_at || item.date_lost || item.date_found || Date.now()).toLocaleDateString()}
                                 </p>
                                 <p className="text-sm text-slate-600 mb-5 line-clamp-2 flex-1 leading-relaxed">{item.description}</p>
                                 
                                 <Link to={`/item/${item._id || item.id}`} className="mt-auto block w-full">
                                     <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-orange-600 transition-colors">
                                         View Details & Status
                                     </Button>
                                 </Link>
                             </CardContent>
                         </Card>
                     ))}
                 </div>
             )}
          </div>
       </div>

       {/* Custom Modals */}
       <AnimatePresence>
            {/* Delete Confirmation Modal */}
            {confirmDeleteId && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm"
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative p-6 text-center"
                    >
                        <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                            <Trash2 className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Delete Item?</h2>
                        <p className="text-slate-500 mb-6 text-sm">Are you sure you want to permanently delete this item? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
                            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>Delete</Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Error Modal */}
            {errorMsg && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm"
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative p-6 text-center"
                    >
                        <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Error</h2>
                        <p className="text-slate-500 mb-6 text-sm">{errorMsg}</p>
                        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white" onClick={() => setErrorMsg(null)}>Close</Button>
                    </motion.div>
                </motion.div>
            )}
       </AnimatePresence>

    </DashboardLayout>
  );
}

function ClockIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    )
}

function CrownIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-9-4 9-6-7z"/></svg>
    )
}

function CheckCircleIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    )
}
