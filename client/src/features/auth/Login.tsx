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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { authenticate } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const authenticated = authenticate(email, password);

    if (!authenticated) {
      toast.error('Invalid credentials. Use the temporary password assigned by an admin.');
      return;
    }

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
        
        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            id="email"
            label="Email Address" 
            placeholder="admin@vanguard.edu" 
            icon={<Mail size={18} />}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              rightIcon={showPassword ? <EyeOff size={18} onClick={() => setShowPassword(false)} /> : <Eye size={18} onClick={() => setShowPassword(true)} />}
              required
            />
            <Link to="#" className="absolute right-0 top-0 text-[10px] font-bold uppercase tracking-widest text-vanguard-blue hover:underline">
              Forgot password?
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-vanguard-gray-200 text-vanguard-blue focus:ring-vanguard-blue" />
            <label htmlFor="remember" className="text-xs font-semibold text-vanguard-gray-800 opacity-60">Keep me signed in for 30 days</label>
          </div>

          <Button type="submit" className="w-full h-12 text-sm uppercase tracking-widest font-black" size="lg">
            Sign In to Dashboard <ArrowRight size={18} className="ml-2" />
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
