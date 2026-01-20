import colorClasses from "@/styles/colors";
import { BarChart3, CheckCircle, Clock, User } from "lucide-react";

const categories = ['Electronics', 'Wallets', 'Phones', 'Keys', 'Bags'];


const Analytics = () => (
    <div className="space-y-6">
      <h1 className={`text-3xl font-bold ${colorClasses.textPrimary}`}>Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${colorClasses.textSecondary}`}>Total Recoveries</p>
              <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>247</p>
            </div>
            <CheckCircle className="text-green-400" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${colorClasses.textSecondary}`}>Active Users</p>
              <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>1,234</p>
            </div>
            <User className="text-blue-400" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${colorClasses.textSecondary}`}>Success Rate</p>
              <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>78%</p>
            </div>
            <BarChart3 className="text-purple-400" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${colorClasses.textSecondary}`}>Avg Response Time</p>
              <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>2.3h</p>
            </div>
            <Clock className="text-orange-400" size={32} />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
          <h3 className={`text-lg font-semibold mb-4 ${colorClasses.textPrimary}`}>Most Lost Categories</h3>
          <div className="space-y-3">
            {categories.slice(0, 5).map((category, index) => (
              <div key={category} className="flex items-center justify-between">
                <span className={`${colorClasses.textSecondary}`}>{category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full"
                      style={{ width: `${(5 - index) * 20}%` }}
                    />
                  </div>
                  <span className={`text-sm ${colorClasses.textPrimary}`}>{(5 - index) * 20}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
          <h3 className={`text-lg font-semibold mb-4 ${colorClasses.textPrimary}`}>Top Locations</h3>
          <div className="space-y-3">
            {['Central Park', 'Times Square', 'Brooklyn Bridge', 'Empire State Building', 'Grand Central'].map((location, index) => (
              <div key={location} className="flex items-center justify-between">
                <span className={`${colorClasses.textSecondary}`}>{location}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full"
                      style={{ width: `${(5 - index) * 15 + 25}%` }}
                    />
                  </div>
                  <span className={`text-sm ${colorClasses.textPrimary}`}>{(5 - index) * 15 + 25}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
export default Analytics;