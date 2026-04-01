// Page module: LoginForm
// Purpose: Handles this page's UI state and user actions.

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login('genuka56@gmail.com', 'findEkapassword_123');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to auto login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {error && <div className="p-3 bg-red-100 text-red-600 rounded-md text-sm">{error}</div>}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleInputChange}
          icon={<Mail className="h-4 w-4" />}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
            <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            icon={<Lock className="h-4 w-4" />}
            required
            />
            <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#DD6B20] transition-colors"
            >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center cursor-pointer group">
          <input
            type="checkbox"
            className="w-4 h-4 text-[#DD6B20] border-gray-300 rounded focus:ring-[#DD6B20] transition-colors"
          />
          <span className="ml-2 text-sm text-gray-500 group-hover:text-gray-700">
            Remember me
          </span>
        </label>
        <a href="#" className="text-sm font-medium text-[#DD6B20] hover:text-[#c05615] transition-colors">
          Forgot password?
        </a>
      </div>

      <Button type="submit" className="w-full h-11 text-base shadow-orange-100" disabled={loading}>
        {loading ? 'Please wait...' : 'Sign In'}
      </Button>
      
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500">Or</span>
        </div>
      </div>

      <Button 
        type="button" 
        variant="outline" 
        className="w-full h-11 text-base border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
        onClick={handleAutoLogin}
        disabled={loading}
      >
        Auto Login (Demo)
      </Button>
    </form>
  );
}

