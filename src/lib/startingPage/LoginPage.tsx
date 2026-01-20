import { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Search } from 'lucide-react';
import colorClasses from '@/styles/colors';
import { Link } from 'react-router-dom';



export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (activeTab === 'login') {
      console.log('Login attempt:', { email: formData.email, password: formData.password });
    } else {
      console.log('Signup attempt:', formData);
    }
  };

  return (
    <div className={`min-h-screen ${colorClasses.background} flex items-center justify-center p-4`}>
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className={`${colorClasses.primary} p-3 rounded-full mr-3`}>
              <Search className="h-8 w-8" />
            </div>
            <h1 className={`text-3xl font-bold ${colorClasses.textPrimary}`}>
              Lost & Found
            </h1>
          </div>
          <p className={`${colorClasses.textSecondary} text-sm`}>
            Helping reunite people with their belongings
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          {/* Tab Navigation */}
          <div className="flex mb-6 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'login'
                  ? `${colorClasses.primary} ${colorClasses.primaryHover}`
                  : `${colorClasses.textSecondary} hover:text-[#7B3F00]`
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'signup'
                  ? `${colorClasses.primary} ${colorClasses.primaryHover}`
                  : `${colorClasses.textSecondary} hover:text-[#7B3F00]`
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {activeTab === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${colorClasses.textPrimary} mb-1`}>
                      First Name
                    </label>
                    <div className="relative">
                      <User className={`absolute left-3 top-3 h-4 w-4 ${colorClasses.textSecondary}`} />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2 border ${colorClasses.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD6B20] focus:border-transparent`}
                        placeholder="John"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${colorClasses.textPrimary} mb-1`}>
                      Last Name
                    </label>
                    <div className="relative">
                      <User className={`absolute left-3 top-3 h-4 w-4 ${colorClasses.textSecondary}`} />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2 border ${colorClasses.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD6B20] focus:border-transparent`}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${colorClasses.textPrimary} mb-1`}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border ${colorClasses.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD6B20] focus:border-transparent`}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className={`block text-sm font-medium ${colorClasses.textPrimary} mb-1`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-3 h-4 w-4 ${colorClasses.textSecondary}`} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 border ${colorClasses.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD6B20] focus:border-transparent`}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${colorClasses.textPrimary} mb-1`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-3 h-4 w-4 ${colorClasses.textSecondary}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-2 border ${colorClasses.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD6B20] focus:border-transparent`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-3 ${colorClasses.textSecondary} hover:text-[#7B3F00]`}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {activeTab === 'signup' && (
              <div>
                <label className={`block text-sm font-medium ${colorClasses.textPrimary} mb-1`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-3 h-4 w-4 ${colorClasses.textSecondary}`} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-2 border ${colorClasses.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD6B20] focus:border-transparent`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-3 top-3 ${colorClasses.textSecondary} hover:text-[#7B3F00]`}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'login' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#DD6B20] border-gray-300 rounded focus:ring-[#DD6B20]"
                  />
                  <span className={`ml-2 text-sm ${colorClasses.textSecondary}`}>
                    Remember me
                  </span>
                </label>
                <a href="#" className={`text-sm ${colorClasses.textSecondary} hover:text-[#7B3F00]`}>
                  Forgot password?
                </a>
              </div>
            )}
            <Link to="/2">
              <button
                type="button"
                onClick={handleSubmit}
                className={`w-full ${colorClasses.primary} ${colorClasses.primaryHover} font-medium py-3 rounded-lg transition-colors`}
              >
                {activeTab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </Link>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className={`px-4 text-sm ${colorClasses.textSecondary}`}>or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className={`text-sm ${colorClasses.textSecondary}`}>
              {activeTab === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setActiveTab(activeTab === 'login' ? 'signup' : 'login')}
                className={`${colorClasses.textPrimary} hover:text-[#C67100] font-medium`}
              >
                {activeTab === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className={`text-xs ${colorClasses.textSecondary}`}>
            By {activeTab === 'login' ? 'signing in' : 'creating an account'}, you agree to our{' '}
            <a href="#" className={`${colorClasses.textPrimary} hover:text-[#C67100]`}>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className={`${colorClasses.textPrimary} hover:text-[#C67100]`}>
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}