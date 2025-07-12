import colorClasses from "@/styles/colors";
import { User, Star, Trophy, Award } from "lucide-react"; // or your icon library

const userRank = "Gold";
const userPoints = 1200;

 const  Profile = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
            <User className="text-white" size={32} />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${colorClasses.textPrimary}`}>John Doe</h2>
            <p className={`${colorClasses.textSecondary}`}>john.doe@email.com</p>
            <div className="flex items-center gap-2 mt-2">
              <Star className="text-yellow-400" size={16} />
              <span className={`text-sm ${colorClasses.textSecondary}`}>{userRank}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${colorClasses.textPrimary}`}>{userPoints}</div>
            <div className={`text-sm ${colorClasses.textSecondary}`}>Points</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${colorClasses.textPrimary}`}>18</div>
            <div className={`text-sm ${colorClasses.textSecondary}`}>Items Posted</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${colorClasses.textPrimary}`}>12</div>
            <div className={`text-sm ${colorClasses.textSecondary}`}>Successful Matches</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
        <h3 className={`text-lg font-semibold mb-4 ${colorClasses.textPrimary}`}>Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
            <Trophy className="text-orange-500" size={24} />
            <div>
              <div className={`font-medium ${colorClasses.textPrimary}`}>First Match</div>
              <div className={`text-sm ${colorClasses.textSecondary}`}>Made your first successful match</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
            <Award className="text-orange-500" size={24} />
            <div>
              <div className={`font-medium ${colorClasses.textPrimary}`}>Good Samaritan</div>
              <div className={`text-sm ${colorClasses.textSecondary}`}>Helped 10 people find their items</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  export default Profile;
