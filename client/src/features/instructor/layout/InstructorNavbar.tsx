import React from 'react';
import { useAuthStore } from '@/src/store/useAuthStore';
import { toast } from 'sonner';

const InstructorNavbar = () => {
  const { user, role } = useAuthStore();
  const badgeLabel = role === 'helper_instructor' ? 'Helper Instructor' : 'Lead Instructor';

  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between bg-white/85 px-6 py-4 shadow-sm backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <p className="text-lg font-black tracking-tight text-[#1E3A8A]">CSEC ASTU</p>
        </div>
        <div className="hidden md:flex items-center gap-3 rounded-full border border-blue-100 bg-[#DBEAFE]/60 px-4 py-2">
          <span className="material-symbols-outlined text-sm text-[#2563EB]">bolt</span>
          <p className="text-sm font-medium text-slate-600">Instructor workspace focused on one active bootcamp.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 rounded-full bg-[#DBEAFE] px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1E3A8A]">
          <span className="material-symbols-outlined text-sm">shield</span>
          {badgeLabel}
        </div>
        <button
          type="button"
          onClick={() => toast.message('No new notifications.')}
          className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#2563EB]"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#2563EB]" />
        </button>
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm">
          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-[#DBEAFE]">
            {user?.avatar ? (
              <img alt="Instructor avatar" className="h-full w-full object-cover" src={user.avatar} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#2563EB] text-sm font-bold text-white">
                {user?.name?.charAt(0) || 'I'}
              </div>
            )}
          </div>
          <div className="hidden pr-2 sm:block">
            <p className="text-sm font-semibold text-slate-900">{user?.name || 'Instructor'}</p>
            <p className="text-xs text-slate-500">{user?.email || 'workspace@csecastu.local'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default InstructorNavbar;
