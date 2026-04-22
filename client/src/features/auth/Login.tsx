import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/src/store/useAuthStore';
import { Toaster, toast } from 'sonner';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loginWithBackend } = useAuthStore();
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
    toast.success('Login successful');
    navigate('/');
  };

  return (
    <>
      <Toaster position="top-right" />
      <AuthLayout 
        title="The Curated Precision in Bootcamp Management."
        subtitle="Welcome Back"
        imageText="Access the Vanguard operations portal with the credentials issued by your administrator. New accounts are provisioned exclusively from the Members workspace."
      >
        <p className="mb-8">Sign in with your issued email address and password to enter the Vanguard workspace.</p>
        
        {error && (
          <div className="w-full mb-4 p-4 rounded-lg bg-red-100 border border-red-400 text-red-700 text-base font-bold text-center animate-pulse">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-6">
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

          <Button type="submit" className="w-full h-12 text-sm uppercase tracking-widest font-black flex items-center justify-center" size="lg" disabled={loading}>
            {loading ? (
              <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            ) : (
              <>Sign In to Dashboard <ArrowRight size={18} className="ml-2" /></>
            )}
          </Button>

          <div className="pt-6 rounded-2xl border border-vanguard-gray-100 bg-vanguard-blue-light/20 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-vanguard-gray-800/60">
              Access Policy
            </p>
            <p className="mt-2 text-sm text-vanguard-muted leading-relaxed">
              Account creation is admin-only. If you need access, contact a Vanguard administrator to add you in the Members module and share your temporary password.
            </p>
          </div>
        </form>
      </AuthLayout>
    </>
  );
};

export default Login;
