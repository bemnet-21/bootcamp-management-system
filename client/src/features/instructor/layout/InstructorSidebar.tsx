import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useAuthStore } from '@/src/store/useAuthStore';

const InstructorSidebar = () => {
  const { logout, role } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/portal/dashboard' },
    { name: 'Students', icon: 'groups', path: '/portal/students' },
    { name: 'Sessions', icon: 'event_note', path: '/portal/sessions' },
    { name: 'Assignments', icon: 'assignment', path: '/portal/assignments' },
    { name: 'Attendance', icon: 'fact_check', path: '/portal/attendance' },
    { name: 'Resources', icon: 'folder_managed', path: '/portal/resources' },
    { name: 'Analytics', icon: 'bar_chart', path: '/portal/analytics' },
    { name: 'Team', icon: 'manage_accounts', path: '/portal/team' },
  ].filter((item) => (role === 'helper_instructor' ? item.name !== 'Team' : true));

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col border-r border-blue-100 bg-gradient-to-b from-[#EFF6FF] via-white to-white p-6 md:flex">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-sm">
          <span className="material-symbols-outlined">school</span>
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900">CSEC ASTU</h1>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Instructor Portal</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-blue-100 bg-white/80 p-4 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#2563EB]">Access Mode</p>
        <p className="mt-2 text-sm font-semibold text-slate-900">
          {role === 'helper_instructor' ? 'Helper Instructor' : 'Lead Instructor'}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Stay inside one bootcamp lane and move quickly between delivery, attendance, and support work.
        </p>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200',
                isActive
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-[#DBEAFE] hover:text-[#1E3A8A]'
              )
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-blue-100 pt-4">
        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default InstructorSidebar;
