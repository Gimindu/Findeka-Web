import colorClasses from "@/styles/colors";
import { QrCode } from "lucide-react";

const QRCode = () => (
    <div className="space-y-6">
      <h1 className={`text-3xl font-bold ${colorClasses.textPrimary}`}>QR Code Generator</h1>
      
      <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
        <h2 className={`text-xl font-semibold mb-4 ${colorClasses.textPrimary}`}>Generate QR Code for Your Items</h2>
        <p className={`${colorClasses.textSecondary} mb-6`}>
          Create QR codes for your valuable items. When someone finds your item and scans the code, they'll be able to contact you directly.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Item Name</label>
              <input
                type="text"
                className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
                placeholder="e.g., My Laptop"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Contact Information</label>
              <textarea
                className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
                rows={3}
                placeholder="Email or phone number"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Reward Amount (Optional)</label>
              <input
                type="number"
                className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
                placeholder="$0"
              />
            </div>
            
            <button className={`w-full py-3 px-4 ${colorClasses.primary} ${colorClasses.primaryHover} rounded-lg font-medium transition-colors`}>
              Generate QR Code
            </button>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <QrCode className="text-gray-400" size={64} />
            </div>
            <p className={`text-sm ${colorClasses.textSecondary} text-center`}>
              Your QR code will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  export default QRCode;
