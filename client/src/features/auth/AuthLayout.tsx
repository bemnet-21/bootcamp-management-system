import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  imageText: string;
}

const AuthLayout = ({ children, title, subtitle, imageText }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#EFF6FF]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-10 md:px-6">
        <div className="w-full overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-blue-100/70 md:flex md:min-h-[640px]">
        {/* Left Panel */}
          <div className="relative flex flex-col justify-between bg-gradient-to-br from-[#0B74C9] via-[#0469BE] to-[#074EA7] px-10 py-12 text-white md:w-[46%]">
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#0B74C9]" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 7h10v10H7z" opacity="0.25" />
                    <path d="M9 12h6" />
                    <path d="M12 9v6" />
                    <path d="M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2" opacity="0.9" />
                  </svg>
                </div>
                <p className="text-lg font-bold tracking-tight">Bootcamp Management System</p>
              </div>

              <h1 className="mt-10 text-4xl font-black leading-[1.08] tracking-tight md:text-5xl">
                {title}
              </h1>

              <p className="mt-8 max-w-sm text-base leading-relaxed text-blue-50/90 md:text-lg">
                {imageText}
              </p>
            </div>

            {/* Visual depth + diagonals (to match reference UI) */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute right-[-30%] top-[-10%] h-[420px] w-[420px] rounded-full bg-white/10 blur-[90px]" />
              <div className="absolute bottom-[-25%] left-[-25%] h-[420px] w-[420px] rounded-full bg-white/10 blur-[90px]" />
              <div className="absolute right-[-80px] top-1/2 h-[520px] w-[220px] -translate-y-1/2 -skew-x-12 bg-white/10" />
              <div className="absolute right-[40px] top-[55%] h-[420px] w-[160px] -translate-y-1/2 -skew-x-12 bg-white/5" />
            </div>
          </div>
        
        {/* Right Panel */}
          <div className="flex flex-1 flex-col justify-center px-8 py-12 md:px-14">
            <div className="mx-auto w-full max-w-md">
              <h2 className="text-4xl font-black tracking-tight text-vanguard-gray-800">{subtitle}</h2>
              <div className="mt-2 text-vanguard-gray-800/60">
                {children}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex w-full items-center justify-between text-[11px] font-bold uppercase tracking-[0.25em] text-vanguard-gray-800/40">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-vanguard-gray-800/20" />
            <span>Secure Admin Portal v4.2.0</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="transition hover:text-vanguard-blue">Privacy</a>
            <a href="#" className="transition hover:text-vanguard-blue">Terms</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
