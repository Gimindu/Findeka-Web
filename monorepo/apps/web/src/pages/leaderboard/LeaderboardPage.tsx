import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { Trophy, Medal, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const leaderboardData = [
  { rank: 1, name: 'Sarah Johnson', points: 2450, matches: 28, avatar: 'SJ' },
  { rank: 2, name: 'Mike Chen', points: 2280, matches: 25, avatar: 'MC' },
  { rank: 3, name: 'Emily Davis', points: 2150, matches: 23, avatar: 'ED' },
  { rank: 4, name: 'John Doe', points: 1250, matches: 12, avatar: 'JD' },
  { rank: 5, name: 'Alex Smith', points: 1180, matches: 11, avatar: 'AS' },
  { rank: 6, name: 'Lisa Wong', points: 980, matches: 8, avatar: 'LW' },
  { rank: 7, name: 'David Miller', points: 850, matches: 7, avatar: 'DM' },
  { rank: 8, name: 'Sophie Taylor', points: 720, matches: 5, avatar: 'ST' },
];

export default function LeaderboardPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Community Leaderboard</h1>
            <p className="text-slate-500">Recognition for our top contributors who help reunite lost items.</p>
          </div>
           <div className="w-full md:w-48">
              <NativeSelect>
                 <option>This Month</option>
                 <option>All Time</option>
                 <option>This Year</option>
              </NativeSelect>
           </div>
        </div>

        {/* Top 3 Podium (Visual only on larger screens) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 2nd Place */}
             <div className="hidden md:flex flex-col items-center justify-end">
                <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-slate-200 border-4 border-slate-300 flex items-center justify-center text-xl font-bold text-slate-500 mb-4 overflow-hidden">
                        MC
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-slate-300 text-slate-600 h-8 w-8 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                        2
                    </div>
                </div>
                 <div className="text-center mt-2">
                    <h3 className="font-bold text-slate-800 text-lg">Mike Chen</h3>
                    <p className="text-[#DD6B20] font-semibold">2280 pts</p>
                 </div>
                 <div className="h-24 w-full bg-gradient-to-t from-slate-200 to-slate-50 rounded-t-xl mt-4 opacity-50"></div>
            </div>

             {/* 1st Place */}
             <div className="hidden md:flex flex-col items-center justify-end z-10">
                <Crown className="h-8 w-8 text-yellow-500 mb-2 animate-bounce" />
                <div className="relative">
                    <div className="h-32 w-32 rounded-full bg-yellow-100 border-4 border-yellow-400 flex items-center justify-center text-3xl font-bold text-yellow-700 mb-4 overflow-hidden shadow-lg shadow-yellow-200">
                        SJ
                    </div>
                     <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 h-10 w-10 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm text-xl">
                        1
                    </div>
                </div>
                 <div className="text-center mt-2">
                    <h3 className="font-bold text-slate-900 text-xl">Sarah Johnson</h3>
                    <p className="text-[#DD6B20] font-bold text-lg">2450 pts</p>
                 </div>
                 <div className="h-32 w-full bg-gradient-to-t from-yellow-100 to-yellow-50 rounded-t-xl mt-4 opacity-50"></div>
            </div>

             {/* 3rd Place */}
            <div className="hidden md:flex flex-col items-center justify-end">
                <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-orange-100 border-4 border-orange-200 flex items-center justify-center text-xl font-bold text-orange-700 mb-4 overflow-hidden">
                        ED
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-orange-300 text-orange-800 h-8 w-8 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                        3
                    </div>
                </div>
                 <div className="text-center mt-2">
                    <h3 className="font-bold text-slate-800 text-lg">Emily Davis</h3>
                    <p className="text-[#DD6B20] font-semibold">2150 pts</p>
                 </div>
                 <div className="h-20 w-full bg-gradient-to-t from-orange-100 to-orange-50 rounded-t-xl mt-4 opacity-50"></div>
            </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
             <div className="flex items-center justify-between">
                <div>
                     <CardTitle>Rankings</CardTitle>
                    <CardDescription>Top performers this month</CardDescription>
                </div>
                <Trophy className="h-5 w-5 text-slate-400" />
             </div>
          </CardHeader>
          <CardContent className="p-0">
            {leaderboardData.map((user) => (
              <div 
                key={user.rank} 
                className={cn(
                    "flex items-center p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0",
                    user.name === "John Doe" && "bg-orange-50/50 hover:bg-orange-50"
                )}
              >
                <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full font-bold mr-4 shrink-0",
                    user.rank === 1 ? "bg-yellow-100 text-yellow-700" :
                    user.rank === 2 ? "bg-slate-200 text-slate-700" :
                    user.rank === 3 ? "bg-orange-100 text-orange-800" :
                    "text-slate-500"
                )}>
                  {user.rank}
                </div>
                
                <div className="flex items-center flex-1 min-w-0">
                     <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-semibold mr-3 shrink-0">
                        {user.avatar}
                     </div>
                     <div>
                        <h4 className={cn("font-semibold truncate", user.name === "John Doe" ? "text-orange-900" : "text-slate-900")}>
                            {user.name} {user.name === "John Doe" && "(You)"}
                        </h4>
                        <p className="text-xs text-slate-500">{user.matches} successful matches</p>
                     </div>
                </div>

                <div className="text-right shrink-0 ml-4">
                    <div className="font-bold text-slate-900">{user.points}</div>
                    <div className="text-xs text-slate-500">points</div>
                </div>

                {user.rank <= 3 && (
                     <div className="ml-4 hidden sm:block">
                        <Medal className={cn(
                            "h-5 w-5",
                            user.rank === 1 ? "text-yellow-500" :
                            user.rank === 2 ? "text-slate-400" :
                            "text-orange-400"
                        )} />
                     </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
