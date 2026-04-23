import { cn } from '@/src/lib/utils';
import { useUIStore } from '@/src/store/useUIStore';
import { useDivisionStore } from '@/src/store/useDivisionStore';
import { 
  LayoutDashboard, 
  Layers, 
  Users, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  Folders,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/src/store/useAuthStore';
import { ADMIN_PATH, adminRoutes } from '@/src/constants/routes';

const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { activeDivision } = useDivisionStore();
  const location = useLocation();
  const { logout, user } = useAuthStore();

  const dashboardPath = activeDivision ? adminRoutes.division(activeDivision.id) : adminRoutes.home;

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: dashboardPath },
    { name: 'Divisions', icon: Folders, path: adminRoutes.manageDivisions },
    { 
      name: 'Bootcamps', 
      icon: Layers, 
      path: activeDivision ? adminRoutes.divisionBootcamps(activeDivision.id) : adminRoutes.manageBootcamps 
    },
    { 
      name: 'Members', 
      icon: Users, 
      path: activeDivision ? adminRoutes.divisionMembers(activeDivision.id) : adminRoutes.members 
    },
    ...(user?.role === 'ADMIN'
      ? [{
          name: 'Settings',
          icon: Settings,
          path: activeDivision ? adminRoutes.divisionSettings(activeDivision.id) : adminRoutes.settings,
        }]
      : []),
  ];

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-vanguard-gray-200 transition-all duration-300 z-50 flex flex-col",
        sidebarCollapsed ? "w-20" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="h-[64px] px-6 flex items-center gap-3 border-b border-vanguard-gray-200">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary shrink-0">
          <span className="material-symbols-outlined">school</span>
        </div>
        {!sidebarCollapsed && (
          <div className="flex flex-col truncate">
            <span className="text-xl font-black text-on-surface tracking-tighter font-headline uppercase leading-none">
              CSEC ASTU
            </span>
            <span className="text-xs text-on-surface-variant font-medium">
              Bootcamp Portal
            </span>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-1 mt-6">
        {navItems.map((item) => {
          const isDivisionsAdmin = item.name === 'Divisions' && location.pathname.startsWith(adminRoutes.manageDivisions);
          const isBootcampsAdmin =
            item.name === 'Bootcamps' &&
            !activeDivision &&
            (location.pathname === adminRoutes.manageBootcamps || location.pathname.startsWith(`${adminRoutes.manageBootcamps}/`));
          const isBootcampsRegistry =
            item.name === 'Bootcamps' &&
            !activeDivision &&
            (location.pathname === adminRoutes.bootcamps || location.pathname.startsWith(`${adminRoutes.bootcamps}/`));
          const isActive =
            location.pathname === item.path ||
            (item.name === 'Dashboard' && location.pathname.startsWith(`${ADMIN_PATH}/divisions/`)) ||
            isDivisionsAdmin ||
            (item.name === 'Bootcamps' && activeDivision && location.pathname.startsWith(adminRoutes.divisionBootcamps(activeDivision.id))) ||
            isBootcampsAdmin ||
            isBootcampsRegistry ||
            (item.path !== adminRoutes.home &&
              item.path !== adminRoutes.manageDivisions &&
              item.path !== adminRoutes.manageBootcamps &&
              location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center p-2.5 rounded-lg transition-all group relative font-medium text-sm",
                isActive 
                  ? "bg-vanguard-blue-light text-vanguard-blue" 
                  : "text-vanguard-muted hover:text-vanguard-gray-800 hover:bg-vanguard-gray-50"
              )}
            >
              <item.icon size={18} className={cn("min-w-[18px]", isActive ? "text-vanguard-blue" : "opacity-80")} />
              {!sidebarCollapsed && (
                <span className="ml-3">{item.name}</span>
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

      {/* User Footer */}
      <div className="p-4 border-t border-vanguard-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-lg bg-vanguard-gray-800 flex items-center justify-center overflow-hidden">
             {user?.avatar ? (
                 <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
             ) : (
                <Users className="text-white" size={20} />
             )}
          </div>
          {!sidebarCollapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.name || 'Admin Portal'}</p>
              <p className="text-[10px] uppercase font-bold text-vanguard-gray-800 opacity-50 truncate">
                {user?.role || 'System Master'}
              </p>
            </div>
          )}
        </div>
        <button 
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-lg bg-vanguard-gray-100 hover:bg-vanguard-gray-200 transition-colors mb-2"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <div className="flex items-center text-xs font-bold uppercase gap-2"><ChevronLeft size={16} /> Collapse</div>}
        </button>
        <button
          onClick={() => { logout(); window.location.href = '/admin/login'; }}
          className="w-full flex items-center justify-center p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold mt-2 transition-colors"
        >
          <LogOut size={16} className="mr-2" /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
