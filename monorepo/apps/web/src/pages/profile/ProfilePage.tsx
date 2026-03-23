import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Award, Star, MapPin, Calendar, Edit, Medal } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getUserProfile } from "../../services/aiService";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        navigate('/auth');
        return;
    }

    const fetchProfile = async () => {
        try {
            const data = await getUserProfile(user.uid);
            setProfile(data);
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    fetchProfile();
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
       </div>
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
