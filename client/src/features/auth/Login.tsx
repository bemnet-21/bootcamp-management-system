import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/src/store/useAuthStore';
import { ADMIN_PATH } from '@/src/constants/routes';
import { Toaster, toast } from 'sonner';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loginWithBackend, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await loginWithBackend(username, password);
    setLoading(false);
    if (!result.success) {
      setError(result.message || 'Invalid credentials. Use the temporary password assigned by an admin.');
      return;
    }
    const role = useAuthStore.getState().user?.role;
    if (role === 'STUDENT') {
      logout();
      setError('Student accounts must use the main student login page, not Admin login.');
      return;
    }
    toast.success('Login successful');
    navigate(ADMIN_PATH);
  };

  return (
    <>
      <Toaster position="top-right" />
      <AuthLayout 
        title="The Curated Precision in Bootcamp Management."
        subtitle="Welcome Back"
        imageText="Access the Vanguard operations portal with the credentials issued by your administrator. New accounts are provisioned exclusively from the Members workspace."
      >
        <p className="mt-2 text-sm leading-relaxed text-vanguard-gray-800/60">
          Sign in with your issued email address and password to enter the Vanguard workspace.
        </p>
        
        {error && (
          <div className="mt-6 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <Input 
            id="username"
            label="Username" 
            placeholder="Enter your username" 
            icon={<Mail size={18} />}
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); if (error) setError(null); }}
            required
          />
          
          <div className="relative">
            <Input 
              id="password"
              label="Password" 
              placeholder="••••••••••••" 
              icon={<Lock size={18} />}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
              rightIcon={showPassword ? <EyeOff size={18} onClick={() => setShowPassword(false)} /> : <Eye size={18} onClick={() => setShowPassword(true)} />}
              required
            />
            <Link to="/forgot-password" className="absolute right-0 top-0 text-[10px] font-bold uppercase tracking-widest text-vanguard-blue hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-sm uppercase tracking-widest font-black flex items-center justify-center shadow-lg shadow-blue-600/20"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            ) : (
              <>Sign In to Dashboard <ArrowRight size={18} className="ml-2" /></>
            )}
          </Button>

          <div className="pt-6">
            <div className="h-px w-full bg-blue-100" />
            <p className="mt-6 text-center text-sm text-vanguard-gray-800/60">
              Account creation is admin-only. If you need access, contact an administrator for a temporary password.
            </p>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-vanguard-muted">
          Student?{' '}
          <Link
            to="/login"
            className="font-bold text-vanguard-blue hover:underline underline-offset-2"
          >
            Back to student login
          </Link>
        </p>
      </AuthLayout>
    </>
  );
};

export default Login;
