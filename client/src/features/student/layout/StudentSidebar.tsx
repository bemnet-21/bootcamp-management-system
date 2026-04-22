import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useAuthStore } from '@/src/store/useAuthStore';

const StudentSidebar = () => {
  const { logout } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/portal/dashboard' },
    { name: 'Sessions', icon: 'calendar_month', path: '/portal/sessions' },
    { name: 'Resources', icon: 'folder_open', path: '/portal/resources' },
    { name: 'Assignments', icon: 'task', path: '/portal/assignments' },
    { name: 'Attendance', icon: 'how_to_reg', path: '/portal/attendance' },
    { name: 'Grades', icon: 'grade', path: '/portal/grades' },
    { name: 'Feedback', icon: 'rate_review', path: '/portal/feedback' },
  ];

  return (
    <aside className="h-screen w-72 fixed left-0 top-0 hidden md:flex flex-col bg-surface-container-low border-r border-outline-variant/10 p-6 gap-8 z-40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined">school</span>
        </div>
        <div>
          <h1 className="font-headline font-extrabold text-xl text-on-surface">CSEC ASTU</h1>
          <p className="text-xs text-on-surface-variant font-medium">Bootcamp Portal</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-body text-sm font-medium outline-none",
                isActive
                  ? "text-primary bg-surface-container-lowest shadow-sm"
                  : "text-on-surface-variant hover:text-primary hover:translate-x-1"
              )
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col gap-2 pt-4 border-t border-outline-variant/20 mt-auto pb-2">
        <NavLink
          to="/portal/support"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-4 px-4 py-2 rounded-xl transition-all duration-200 font-body text-sm font-medium outline-none",
              isActive ? "text-primary" : "text-on-surface-variant hover:text-primary"
            )
          }
        >
          <span className="material-symbols-outlined">help_center</span>
          Support
        </NavLink>
        <button
          onClick={() => { logout(); window.location.href = '/login'; }}
          className="flex items-center gap-4 px-4 py-2 text-on-surface-variant hover:text-error transition-all duration-200 font-body text-sm font-medium outline-none"
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default StudentSidebar;
