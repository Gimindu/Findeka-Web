import colorClasses from "@/styles/colors";

const Leaderboard = () => (
    <div className="space-y-6">
      <h1 className={`text-3xl font-bold ${colorClasses.textPrimary}`}>Leaderboard</h1>
      
      <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold ${colorClasses.textPrimary}`}>Top Contributors</h2>
          <select className={`px-4 py-2 border ${colorClasses.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}>
            <option>This Month</option>
            <option>All Time</option>
            <option>This Year</option>
          </select>
        </div>
        
        <div className="space-y-4">
          {[
            { name: 'Sarah Johnson', points: 2450, matches: 28, rank: 1 },
            { name: 'Mike Chen', points: 2280, matches: 25, rank: 2 },
            { name: 'Emily Davis', points: 2150, matches: 23, rank: 3 },
            { name: 'John Doe', points: 1250, matches: 12, rank: 4 },
            { name: 'Alex Smith', points: 1180, matches: 11, rank: 5 }
          ].map((user, index) => (
            <div key={user.name} className={`flex items-center justify-between p-4 rounded-lg ${user.name === 'John Doe' ? 'bg-orange-50 border-2 border-orange-200' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-yellow-400 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-400 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {user.rank}
                </div>
                <div>
                  <div className={`font-semibold ${colorClasses.textPrimary}`}>{user.name}</div>
                  <div className={`text-sm ${colorClasses.textSecondary}`}>{user.matches} successful matches</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${colorClasses.textPrimary}`}>{user.points}</div>
                <div className={`text-sm ${colorClasses.textSecondary}`}>points</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
export default Leaderboard;
