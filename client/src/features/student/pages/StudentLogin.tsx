import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/src/store/useAuthStore';
import { Toaster, toast } from 'sonner';

const StudentLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginWithBackend, login } = useAuthStore();
  const navigate = useNavigate();

  const handleDemoLogin = (demoRole: 'LEAD_INSTRUCTOR' | 'HELPER_INSTRUCTOR') => {
    const demoPermissions =
      demoRole === 'HELPER_INSTRUCTOR'
        ? ['upload_resource']
        : ['create_session', 'mark_attendance', 'add_student', 'upload_resource'];

    login(
      {
        id: demoRole === 'HELPER_INSTRUCTOR' ? 'demo-helper' : 'demo-lead',
        name: demoRole === 'HELPER_INSTRUCTOR' ? 'Demo Helper Instructor' : 'Demo Lead Instructor',
        email: demoRole === 'HELPER_INSTRUCTOR' ? 'helper@demo.local' : 'lead@demo.local',
        role: demoRole,
        divisions: [],
        permissions: demoPermissions,
        avatar: `https://picsum.photos/seed/${demoRole === 'HELPER_INSTRUCTOR' ? 'helper' : 'lead'}/200`,
      } as any,
      'demo.demo.demo'
    );

    toast.success(`Signed in as ${demoRole === 'HELPER_INSTRUCTOR' ? 'Helper' : 'Lead'} Instructor (demo)`);
    navigate('/portal/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithBackend(username, password);
      if (result.success) {
        toast.success('Login Successful! Welcome to CSEC ASTU.');
        navigate('/portal/dashboard');
      } else {
        toast.error(result.message || 'Invalid credentials. Please try again.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center p-6 selection:bg-primary-fixed selection:text-on-primary-fixed-variant relative overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Decorative Subtle Background Element */}
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-primary-fixed opacity-20 rounded-full blur-3xl -z-10"></div>
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-secondary-fixed opacity-20 rounded-full blur-3xl -z-10"></div>

      {/* Brand Shell Header */}
      <header className="w-full max-w-7xl mx-auto px-6 flex justify-center items-center pb-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-primary tracking-tighter font-headline uppercase leading-none">CSEC ASTU</span>
        </div>
      </header>

      <main className="w-full max-w-md relative z-10">
        {/* Login Card */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-[0_12px_40px_rgba(13,28,46,0.06)] overflow-hidden border border-outline-variant/10">
          <div className="p-8 md:p-10">
            {/* Authentication Header */}
            <div className="mb-10">
              <h1 className="text-3xl font-extrabold text-on-surface tracking-tight leading-tight mb-3 font-headline">
                Welcome back
              </h1>
              <p className="text-on-surface-variant leading-relaxed font-body">
                Login to continue to your bootcamp
              </p>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-label" htmlFor="username">
                  Username
                </label>
                <div className="relative group">
                  <input 
                    className="w-full bg-surface-container-highest border-none rounded-xl py-3.5 px-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-200" 
                    id="username" 
                    placeholder="Enter your username" 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-label" htmlFor="password">
                    Password
                  </label>
                  <button type="button" className="text-xs font-semibold text-primary hover:text-on-primary-fixed-variant transition-colors underline-offset-4 hover:underline">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <input 
                    className="w-full bg-surface-container-highest border-none rounded-xl py-3.5 px-4 pr-12 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all duration-200" 
                    id="password" 
                    placeholder="Enter your password" 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Login'}
                </button>
              </div>

              {(import.meta as any).env?.DEV ? (
                <div className="pt-6 border-t border-outline-variant/20">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">
                    Demo Access (Dev Only)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleDemoLogin('LEAD_INSTRUCTOR')}
                      className="bg-blue-600 text-white font-bold py-3 rounded-xl shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
                      disabled={loading}
                    >
                      Demo Lead Instructor
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoLogin('HELPER_INSTRUCTOR')}
                      className="bg-blue-600 text-white font-bold py-3 rounded-xl shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
                      disabled={loading}
                    >
                      Demo Helper Instructor
                    </button>
                  </div>
                </div>
              ) : null}
            </form>

            {/* Footer Access Note */}
            <div className="mt-10 pt-8 border-t border-outline-variant/20 flex items-start gap-3">
              <span className="material-symbols-outlined text-outline text-lg shrink-0">info</span>
              <p className="text-xs leading-relaxed text-on-surface-variant font-body">
                Access is provided by your bootcamp administrator. If you are a new student, check your email for activation instructions.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-8 relative z-10">
        <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium font-body">
          <span className="material-symbols-outlined text-sm">contact_support</span>
          Need help signing in?
        </button>
      </footer>
    </div>
  );
};

export default StudentLogin;
