import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  imageText: string;
}

const AuthLayout = ({ children, title, subtitle, imageText }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-vanguard-gray-100 p-4 md:p-6">
      <div className="w-full max-w-5xl bg-white rounded-[28px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[680px]">
        {/* Left Panel */}
        <div className="md:w-[44%] auth-gradient p-10 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-12">
               <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                  <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
               </div>
               <span className="font-bold tracking-tight text-lg">Bootcamp management system</span>
            </div>
            
            <h1 className="text-5xl font-black leading-[1.1] mb-8 tracking-tight">
              {title}
            </h1>
            
            <p className="text-lg opacity-80 leading-relaxed max-w-sm">
              {imageText}
            </p>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest opacity-60">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>Secure Admin Portal v4.2.0</span>
            </div>
          </div>
          
          {/* Abstract background shapes */}
          <div className="absolute top-[20%] -right-20 w-80 h-80 bg-vanguard-blue-light/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-[10%] -left-20 w-80 h-80 bg-vanguard-blue-light/5 blur-[100px] rounded-full" />
        </div>
        
        {/* Right Panel */}
        <div className="md:w-[56%] p-8 md:p-14 lg:p-16 flex flex-col justify-center">
          <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.5 }}
             className="mx-auto w-full max-w-md"
          >
            <h2 className="text-4xl font-black text-vanguard-gray-800 tracking-tight mb-2">
              {subtitle}
            </h2>
            <div className="mb-10 text-vanguard-gray-800 opacity-60">
              {children}
            </div>
          </motion.div>
          
          <div className="mx-auto mt-12 w-full max-w-md pt-8 flex items-center justify-center text-[11px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-30">
             <div className="flex space-x-4">
                <a href="#" className="hover:text-vanguard-blue">Privacy</a>
                <a href="#" className="hover:text-vanguard-blue">Terms</a>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
