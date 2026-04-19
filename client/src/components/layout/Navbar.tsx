import { Search, Bell, HelpCircle, X, Plus } from 'lucide-react';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useUIStore } from '@/src/store/useUIStore';

const Navbar = () => {
  const { user } = useAuthStore();
  const { searchQuery, setSearchQuery } = useUIStore();

  return (
    <div className="h-[80px] border-b border-vanguard-gray-200 bg-[#F8FAFC] flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center">
        <h2 className="text-xl font-bold text-vanguard-gray-800 tracking-tight mr-8">
          Hello, {user?.name.split(' ')[0] || 'Admin'}! <span className="ml-1">👋</span>
        </h2>
        
        <div className="relative group w-[320px]">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-vanguard-muted opacity-40">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search systems, bootcamps..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-10 bg-[#EDF2F7] rounded-lg text-[13px] border-none focus:ring-1 focus:ring-vanguard-blue transition-all"
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
        <div className="flex items-center space-x-3 mr-4">
          <button className="h-11 px-5 bg-[#00519E] hover:bg-[#003d7a] text-white rounded-lg text-xs font-bold uppercase tracking-widest flex items-center transition-colors">
            <Plus size={16} className="mr-2" /> Add Bootcamp
          </button>
          <button className="h-11 px-5 bg-[#E6F0FF] hover:bg-[#d4e5ff] text-[#00519E] border border-[#B3D1FF] rounded-lg text-xs font-bold uppercase tracking-widest flex items-center transition-colors">
            <Plus size={16} className="mr-2" /> Add Division
          </button>
        </div>

        <button className="text-[#8E9FBA] hover:text-[#131B2A] transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-[#00519E] rounded-full border border-white"></span>
        </button>
        <button className="text-[#8E9FBA] hover:text-[#131B2A] transition-colors">
          <HelpCircle size={20} />
        </button>
        
        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 cursor-pointer group">
          <div className="text-right">
            <p className="text-sm font-bold text-vanguard-gray-800">{user?.role === 'ADMIN' ? 'Administrator' : user?.name}</p>
            <p className="text-[10px] text-vanguard-muted uppercase tracking-widest font-bold">Vanguard BMS</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-vanguard-gray-200 overflow-hidden ring-2 ring-transparent group-hover:ring-vanguard-blue transition-all">
             <img 
               src={user?.avatar || "https://i.pravatar.cc/150?u=admin"} 
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
