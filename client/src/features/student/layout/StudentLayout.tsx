import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentNavbar from './StudentNavbar';
import { cn } from '@/src/lib/utils';
import { Toaster } from 'sonner';

const StudentLayout = () => {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Toaster position="top-right" />
      {/* Sidebar for Desktop */}
      <StudentSidebar />

      {/* Main Wrapper */}
      <div className="md:ml-72 min-h-screen flex flex-col">
        {/* TopAppBar */}
        <StudentNavbar />

        {/* Main Content Canvas */}
        <main className="p-6 md:p-10 flex-grow max-w-7xl mx-auto w-full pb-24 md:pb-10">
          <Outlet />
        </main>
      </div>

      {/* BottomNavbar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-surface-lowest/80 backdrop-blur-2xl border-t border-outline-variant/10 flex justify-around items-center px-4 pb-6 pt-3">
        <NavLink
          to="/portal/dashboard"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center transition-all duration-300 ease-out py-2 px-5 rounded-2xl",
              isActive ? "text-primary bg-surface-container shadow-sm scale-110" : "text-on-surface-variant"
            )
          }
        >
          <span className="material-symbols-outlined text-[20px]">home</span>
          <span className="font-body text-[10px] uppercase tracking-widest font-bold mt-1">Home</span>
        </NavLink>
        <NavLink
          to="/portal/sessions"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center transition-all duration-300 ease-out py-2 px-5 rounded-2xl",
              isActive ? "text-primary bg-surface-container shadow-sm scale-110" : "text-on-surface-variant"
            )
          }
        >
          <span className="material-symbols-outlined text-[20px]">school</span>
          <span className="font-body text-[10px] uppercase tracking-widest font-bold mt-1">Learn</span>
        </NavLink>
        <NavLink
          to="/portal/assignments"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center transition-all duration-300 ease-out py-2 px-5 rounded-2xl",
              isActive ? "text-primary bg-surface-container shadow-sm scale-110" : "text-on-surface-variant"
            )
          }
        >
          <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
          <span className="font-body text-[10px] uppercase tracking-widest font-bold mt-1">Tasks</span>
        </NavLink>
        <NavLink
          to="/portal/profile"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center transition-all duration-300 ease-out py-2 px-5 rounded-2xl",
              isActive ? "text-primary bg-surface-container shadow-sm scale-110" : "text-on-surface-variant"
            )
          }
        >
          <span className="material-symbols-outlined text-[20px]">person</span>
          <span className="font-body text-[10px] uppercase tracking-widest font-bold mt-1">Profile</span>
        </NavLink>
      </nav>

      {/* Contextual Progress FAB (Common in Student Portal) */}
      <div className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-50 group hidden md:block">
        <div className="bg-surface-variant/70 backdrop-blur-2xl p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-surface-lowest/50">
          <div className="relative w-12 h-12">
            <svg className="w-full h-full transform -rotate-90">
              <circle className="text-surface-container-highest" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="4"></circle>
              <circle className="text-primary" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeDasharray="125.6" strokeDashoffset="31.4" strokeWidth="4"></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-on-surface">75%</div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Academic Pulse</p>
            <p className="text-sm font-bold text-primary">On Target for Honors</p>
          </div>
          <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform cursor-pointer">chevron_right</span>
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;
