import { cn } from '@/src/lib/utils';
import { useUIStore } from '@/src/store/useUIStore';
import { useDivisionStore } from '@/src/store/useDivisionStore';
import { 
  LayoutDashboard, 
  Layers, 
  GraduationCap,
  Calendar,
  ClipboardList,
  FolderGit2,
  Users, 
  BarChart2,
  Settings, 
  LogOut
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/src/store/useAuthStore';

const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { logout } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Divisions', icon: Layers, path: '/divisions' },
    { name: 'Bootcamps', icon: GraduationCap, path: '/bootcamps' },
    { name: 'Sessions', icon: Calendar, path: '/sessions' },
    { name: 'Tasks', icon: ClipboardList, path: '/tasks' },
    { name: 'Projects', icon: FolderGit2, path: '/projects' },
    { name: 'Users', icon: Users, path: '/members' },
    { name: 'Reports', icon: BarChart2, path: '/reports' },
  ];

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 h-full bg-[#131B2A] transition-all duration-300 z-50 flex flex-col text-white",
        sidebarCollapsed ? "w-20" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="h-[80px] px-6 flex items-center gap-3">
        {!sidebarCollapsed && (
          <span className="text-xl font-bold tracking-wide">
            Vanguard BMS
          </span>
        )}
        {sidebarCollapsed && (
          <span className="text-xl font-bold tracking-wide text-center w-full">
            V
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-1 mt-6">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 transition-all group relative font-medium text-[13px]",
                isActive 
                  ? "bg-[#1853A3] text-white border-l-4 border-white" 
                  : "text-[#8E9FBA] hover:text-white hover:bg-white/5 border-l-4 border-transparent"
              )}
            >
              <item.icon size={20} className={cn("min-w-[20px]", isActive ? "text-white" : "opacity-80")} />
              {!sidebarCollapsed && (
                <span className="ml-4 font-bold tracking-wide uppercase">{item.name}</span>
              )}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-vanguard-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Items */}
      <div className="mt-auto mb-6 px-3 space-y-1">
        <Link
          to="/settings"
          className="flex items-center px-4 py-3 text-[#8E9FBA] hover:text-white hover:bg-white/5 transition-all group relative font-medium text-[13px] border-l-4 border-transparent"
        >
          <Settings size={20} className="min-w-[20px] opacity-80" />
          {!sidebarCollapsed && <span className="ml-4 font-bold tracking-wide uppercase">Settings</span>}
        </Link>
        <button
          onClick={() => { logout(); window.location.href = '/login'; }}
          className="w-full flex items-center px-4 py-3 text-[#8E9FBA] hover:text-white hover:bg-white/5 transition-all group relative font-medium text-[13px] border-l-4 border-transparent text-left"
        >
          <LogOut size={20} className="min-w-[20px] opacity-80" />
          {!sidebarCollapsed && <span className="ml-4 font-bold tracking-wide uppercase">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
