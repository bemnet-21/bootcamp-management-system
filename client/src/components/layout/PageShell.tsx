import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useUIStore } from '@/src/store/useUIStore';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';

interface PageShellProps {
  children: ReactNode;
}

const PageShell = ({ children }: PageShellProps) => {
  const { sidebarCollapsed } = useUIStore();
  const location = useLocation();

  const isOverview = location.pathname === '/';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {!isOverview && <Sidebar />}
      <div 
        className={cn(
          "transition-all duration-300 min-h-screen flex flex-col",
          isOverview ? "pl-0" : (sidebarCollapsed ? "pl-20" : "pl-[240px]")
        )}
      >
        <Navbar />
        <motion.main 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn("p-8 flex-1 max-w-[1400px]", isOverview && "mx-auto w-full")}
        >
          {children}
        </motion.main>
        
        {/* Footer */}
        <footer className="px-8 py-6 border-t border-vanguard-gray-200 mt-auto bg-white/50">
          <div className="flex flex-col md:flex-row items-center justify-between text-[11px] font-bold uppercase tracking-wider text-vanguard-gray-800 opacity-40">
            <div className="flex items-center space-x-2">
               <div className="w-5 h-5 bg-vanguard-blue rounded flex items-center justify-center">
                  <span className="text-white text-[8px]">V</span>
               </div>
               <span>Vanguard Management Systems</span>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
               <a href="#" className="hover:text-vanguard-blue transition-colors">Privacy Policy</a>
               <a href="#" className="hover:text-vanguard-blue transition-colors">Terms of Service</a>
               <a href="#" className="hover:text-vanguard-blue transition-colors">Documentation</a>
               <a href="#" className="hover:text-vanguard-blue transition-colors">Support</a>
               <span>© 2024 Vanguard Education Group. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PageShell;
