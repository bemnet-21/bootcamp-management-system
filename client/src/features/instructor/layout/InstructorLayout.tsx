import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import InstructorSidebar from './InstructorSidebar';
import InstructorNavbar from './InstructorNavbar';
import { cn } from '@/src/lib/utils';
import { Toaster } from 'sonner';
import ModalHost from '@/src/components/ui/ModalHost';
import { useAuthStore } from '@/src/store/useAuthStore';

const mobileItems = [
  { label: 'Home', icon: 'home', path: '/portal/dashboard' },
  { label: 'Students', icon: 'groups', path: '/portal/students' },
  { label: 'Sessions', icon: 'event', path: '/portal/sessions' },
  { label: 'Team', icon: 'manage_accounts', path: '/portal/team' },
];

const InstructorLayout = () => {
  const { role } = useAuthStore();
  return (
    <div className="min-h-screen bg-[#F8FBFF] text-slate-900">
      <Toaster position="top-right" />
      <InstructorSidebar />

      <div className="min-h-screen md:ml-72">
        <InstructorNavbar />
        <main className="mx-auto w-full max-w-7xl flex-grow px-6 pb-28 pt-6 md:px-10 md:pb-10">
          <Outlet />
        </main>
      </div>

      <ModalHost />

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-blue-100 bg-white/95 px-4 pb-6 pt-3 backdrop-blur-xl md:hidden">
        {mobileItems.filter((item) => (role === 'helper_instructor' ? item.label !== 'Team' : true)).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center rounded-2xl px-4 py-2 transition-all duration-200',
                isActive ? 'bg-[#DBEAFE] text-[#1E3A8A]' : 'text-slate-500'
              )
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default InstructorLayout;
