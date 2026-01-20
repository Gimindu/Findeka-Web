import colorClasses from "@/styles/colors";

const SettingPage = () => (
    <div className="space-y-6">
      <h1 className={`text-3xl font-bold ${colorClasses.textPrimary}`}>Settings</h1>
      
      <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
        <h2 className={`text-xl font-semibold mb-4 ${colorClasses.textPrimary}`}>Account Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Full Name</label>
            <input
              type="text"
              className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
              defaultValue="John Doe"
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Email</label>
            <input
              type="email"
              className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
              defaultValue="john.doe@email.com"
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Phone Number</label>
            <input
              type="tel"
              className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
        <h2 className={`text-xl font-semibold mb-4 ${colorClasses.textPrimary}`}>Notification Preferences</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className={`font-medium ${colorClasses.textPrimary}`}>Email Notifications</div>
              <div className={`text-sm ${colorClasses.textSecondary}`}>Receive notifications via email</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className={`font-medium ${colorClasses.textPrimary}`}>Push Notifications</div>
              <div className={`text-sm ${colorClasses.textSecondary}`}>Receive push notifications</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className={`font-medium ${colorClasses.textPrimary}`}>Match Alerts</div>
              <div className={`text-sm ${colorClasses.textSecondary}`}>Get notified when potential matches are found</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
        <h2 className={`text-xl font-semibold mb-4 ${colorClasses.textPrimary}`}>Privacy Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className={`font-medium ${colorClasses.textPrimary}`}>Public Profile</div>
              <div className={`text-sm ${colorClasses.textSecondary}`}>Allow others to see your profile</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className={`font-medium ${colorClasses.textPrimary}`}>Location Sharing</div>
              <div className={`text-sm ${colorClasses.textSecondary}`}>Share your location for better matching</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
export default SettingPage;