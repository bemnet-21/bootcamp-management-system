import React from 'react';
import { useAuthStore } from '@/src/store/useAuthStore';

const StudentNavbar = () => {
  const { user } = useAuthStore();

  return (
    <header className="bg-surface-lowest/70 backdrop-blur-xl sticky top-0 z-50 shadow-sm flex justify-between items-center w-full px-6 py-3">
      <div className="flex items-center gap-6">
        <span className="text-2xl font-black text-on-surface font-headline md:hidden">CSEC ASTU</span>
        <div className="hidden md:flex bg-surface-container-highest px-4 py-2 rounded-full items-center gap-3 w-80">
          <span className="material-symbols-outlined text-outline text-lg">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-outline" 
            placeholder="Search modules, tasks..." 
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-tertiary rounded-full border-2 border-surface-lowest"></span>
        </button>
        <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
          <span className="material-symbols-outlined">apps</span>
        </button>
        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-surface-container shadow-sm">
          {user?.avatar ? (
            <img 
              alt="Student avatar" 
              className="w-full h-full object-cover" 
              src={user.avatar} 
            />
          ) : (
            <div className="w-full h-full bg-primary flex items-center justify-center text-on-primary font-bold">
              {user?.name?.charAt(0) || 'S'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default StudentNavbar;
