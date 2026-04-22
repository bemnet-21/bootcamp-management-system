import React, { useState } from 'react';
import { Eye, Info, Lock, Network, User } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('yonas@g.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="h-screen w-full bg-gray-100">
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col justify-center px-4 py-10 md:px-6">
        <div className="flex w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl md:flex-row">
          {/* Left Panel */}
          <div className="relative flex w-full items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 px-10 py-12 text-white md:w-1/2">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(135deg, rgba(255,255,255,0.24) 0px, rgba(255,255,255,0.24) 1px, transparent 1px, transparent 22px)',
              }}
            />
            <div className="pointer-events-none absolute inset-0 opacity-30">
              <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
              <div className="mb-10 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
                  <Network className="h-6 w-6" />
                </div>
                <p className="text-lg font-bold tracking-tight">Bootcamp Management System</p>
              </div>

              <h1 className="text-4xl font-bold leading-tight">
                The Curated Precision in <br />
                <span className="text-white/95">Bootcamp Management.</span>
              </h1>
              <p className="mt-4 text-blue-100">
                Access your administrative dashboard to oversee divisions, curriculum progress, and student performance
                with editorial clarity.
              </p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex w-full flex-col justify-center px-8 py-10 md:w-1/2 md:px-12 md:py-12">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8">
                <div className="text-xl font-bold text-indigo-700">CSEC ASTU</div>
                <h2 className="mt-4 text-3xl font-semibold text-gray-900">Welcome back</h2>
                <p className="mt-2 text-gray-500">Login to continue to your bootcamp</p>
              </div>

              <form onSubmit={onSubmit} className="space-y-6">
                <div>
                  <label className="text-xs font-semibold tracking-widest text-indigo-600">USERNAME</label>
                  <div className="relative mt-2">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-lg bg-yellow-50 py-4 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-600"
                      placeholder="yonas@g.com"
                      type="email"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold tracking-widest text-indigo-600">PASSWORD</label>
                    <a href="#" className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative mt-2">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg bg-yellow-50 py-4 pl-12 pr-12 text-gray-900 placeholder:text-gray-400 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-600"
                      placeholder="••••••••••••"
                      type={showPassword ? 'text' : 'password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-700 py-4 font-semibold text-white shadow-sm transition hover:bg-indigo-800"
                >
                  Login
                </button>

                <div className="pt-2">
                  <p className="text-xs font-semibold text-gray-400">DEMO ACCESS (DEV ONLY)</p>
                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      className="flex-1 rounded-lg bg-blue-600 p-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Demo Lead Instructor
                    </button>
                    <button
                      type="button"
                      className="flex-1 rounded-lg bg-blue-500 p-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                    >
                      Demo Helper Instructor
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-gray-100 p-3 text-gray-600">
                  <Info className="mt-0.5 h-5 w-5 text-gray-500" />
                  <p className="text-sm leading-relaxed">
                    Access is provided by your bootcamp administrator. If you are a new student, check your email for
                    activation instructions.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Global Footer */}
        <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center text-xs text-gray-500 md:flex-row md:justify-between">
          <div>• SECURE ADMIN PORTAL V4.2.0</div>
          <div className="flex items-center gap-3">
            <a href="#" className="hover:text-gray-700 hover:underline">
              PRIVACY
            </a>
            <span className="text-gray-300">|</span>
            <a href="#" className="hover:text-gray-700 hover:underline">
              TERMS
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

