import { Search, Bell, HelpCircle, X } from 'lucide-react';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useUIStore } from '@/src/store/useUIStore';

const Navbar = () => {
  const { user } = useAuthStore();
  const { searchQuery, setSearchQuery } = useUIStore();

  return (
    <div className="h-[64px] border-b border-vanguard-gray-200 bg-white flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex-1 max-w-[400px]">
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-vanguard-muted opacity-40">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search students, courses, or events..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-10 pr-10 bg-[#F1F5F9] rounded-full text-[13px] border-none focus:ring-1 focus:ring-vanguard-blue transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-vanguard-muted hover:text-vanguard-gray-800 transition-colors"
            >
              <X size={14} />
            </button>
          )}

          {/* Search Result Preview (Basic placeholder logic) */}
          {searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-vanguard-gray-100 py-3 z-50 overflow-hidden">
               <div className="px-4 py-1 mb-2">
                  <p className="text-[10px] font-bold text-vanguard-muted uppercase tracking-widest">Global Search Results</p>
               </div>
               <div className="max-h-[300px] overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-vanguard-blue-light/30 cursor-pointer border-l-2 border-transparent hover:border-vanguard-blue transition-all">
                     <p className="text-sm font-bold text-vanguard-gray-800">Search for "{searchQuery}" in Registry</p>
                     <p className="text-[11px] text-vanguard-muted">Find matching students across all 4 pillars</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-vanguard-blue-light/30 cursor-pointer border-l-2 border-transparent hover:border-vanguard-blue transition-all">
                     <p className="text-sm font-bold text-vanguard-gray-800">Bootcamp Archive</p>
                     <p className="text-[11px] text-vanguard-muted">Locate legacy course materials and sessions</p>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <button className="text-vanguard-gray-800 opacity-60 hover:opacity-100 transition-opacity relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="text-vanguard-gray-800 opacity-60 hover:opacity-100 transition-opacity">
          <HelpCircle size={20} />
        </button>
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-vanguard-gray-200 overflow-hidden ring-2 ring-transparent group-hover:ring-vanguard-blue transition-all">
             <img 
               src={user?.avatar || "https://picsum.photos/seed/user/200"} 
               alt="User" 
               className="w-full h-full object-cover"
               referrerPolicy="no-referrer"
             />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
