import { Link } from 'react-router-dom'; 
import colorClasses from '@/styles/colors';
import { Search } from 'lucide-react';

export default function LoadingPage() {

  return (
    <div className={`min-h-screen ${colorClasses.background} flex items-center justify-center`}>
      <div className="text-center">
        <div className={`w-20 h-20 ${colorClasses.primary} rounded-full flex items-center justify-center mx-auto mb-8`}>
          <Search className="text-white" size={40} />
        </div>
        <h1 className={`text-4xl font-bold ${colorClasses.textPrimary} mb-4`}>LostFound AI</h1>
        <p className={`text-xl ${colorClasses.textSecondary} mb-8`}>
          Find your lost items with the power of AI
        </p>
       <Link to="/auth">
          <button className={`px-8 py-3 ${colorClasses.primary} ${colorClasses.primaryHover} text-white rounded-lg font-medium transition-colors`}>
          Get Started
        </button>
      </Link>
      </div>
    </div>
  );
}
