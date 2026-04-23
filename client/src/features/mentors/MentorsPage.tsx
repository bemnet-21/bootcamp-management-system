import React from 'react';
import { useParams } from 'react-router-dom';
import PageShell from '@/src/components/layout/PageShell';
import { useUserStore } from '@/src/store/useUserStore';
import { useDivisionStore } from '@/src/store/useDivisionStore';
import MentorCard from './components/MentorCard';
import { Search, Filter, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';

const MentorsPage = () => {
  const { id: divisionId } = useParams();
  const { getMembersByDivision } = useUserStore();
  const { getDivisionById } = useDivisionStore();

  const division = getDivisionById(divisionId || '');
  const members = getMembersByDivision(divisionId || '');
  const mentors = members.filter(m => m.role === 'Instructor');

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center space-x-2 mb-3">
             <div className="p-1.5 bg-vanguard-blue rounded-lg text-white">
                <UserCheck size={18} />
             </div>
             <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-vanguard-blue">
                Mentor Registry / {division?.name}
             </p>
          </div>
          <h1 className="text-4xl font-black text-vanguard-gray-800 tracking-tight leading-none">
            Professional Mentors
          </h1>
          <p className="text-vanguard-muted text-sm mt-3 max-w-xl leading-relaxed">
            Connect with industry-leading experts allocated to the {division?.name} pillar. 
            Book structured sessions or request direct code reviews from certified Vanguard instructors.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vanguard-muted/50" size={18} />
            <input 
              type="text" 
              placeholder="Search by expertise (e.g. OpenAI, DevOps, Pentesting)..." 
              className="w-full h-12 pl-12 pr-4 bg-white border border-vanguard-gray-100 rounded-2xl text-[13px] focus:ring-2 focus:ring-vanguard-blue/10 focus:border-vanguard-blue outline-none transition-all"
            />
          </div>
          <button className="h-12 px-6 bg-vanguard-gray-50 border border-vanguard-gray-100 rounded-2xl flex items-center hover:bg-vanguard-gray-100 transition-colors">
            <Filter size={16} className="text-vanguard-gray-800 mr-2" />
            <span className="text-[11px] font-bold text-vanguard-muted uppercase tracking-widest leading-none">Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {mentors.length > 0 ? (
            mentors.map((mentor, idx) => (
              <motion.div
                key={mentor.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <MentorCard mentor={mentor} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
               <div className="w-20 h-20 bg-vanguard-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-vanguard-muted border border-vanguard-gray-100">
                  <Search size={32} />
               </div>
               <h3 className="text-2xl font-bold text-vanguard-gray-800 tracking-tight">No Domain Mentors Found</h3>
               <p className="text-vanguard-muted text-[13px] mt-2 max-w-md mx-auto">
                 The registry for {division?.name} is currently being updated. Check back soon for new expert arrivals.
               </p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default MentorsPage;
