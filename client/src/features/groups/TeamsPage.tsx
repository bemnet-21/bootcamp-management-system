import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageShell from '@/src/components/layout/PageShell';
import { useTeamStore } from '@/src/store/useTeamStore';
import { useDivisionStore } from '@/src/store/useDivisionStore';
import TeamCard from './components/TeamCard';
import { Button } from '@/src/components/ui/Button';
import { Plus, Search, Filter, Users } from 'lucide-react';
import { motion } from 'motion/react';

const TeamsPage = () => {
  const { id: divisionId } = useParams();
  const { getTeamsByDivision } = useTeamStore();
  const { getDivisionById } = useDivisionStore();
  
  const division = getDivisionById(divisionId || '');
  const teams = getTeamsByDivision(divisionId || '');

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-8 h-px bg-vanguard-blue"></span>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-vanguard-blue">
                {division?.name || 'Vanguard'} Pillars
              </p>
            </div>
            <h1 className="text-4xl font-black text-vanguard-gray-800 tracking-tight">
              Squad Directory
            </h1>
          </div>
          <Button className="h-11 px-6 uppercase tracking-widest text-[12px] font-black group">
            <Plus size={16} className="mr-2 group-hover:rotate-90 transition-transform" /> 
            Form New Squad
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-vanguard-muted opacity-40 group-focus-within:text-vanguard-blue transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Filter by squad name or project target..." 
              className="w-full h-11 pl-10 pr-4 bg-white border border-vanguard-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="h-11 px-5 border-vanguard-gray-100 text-vanguard-muted hover:text-vanguard-gray-800">
                <Filter size={16} className="mr-2" /> Parameters
             </Button>
             <div className="h-11 px-4 bg-vanguard-gray-50 border border-vanguard-gray-100 rounded-xl flex items-center">
                <p className="text-[11px] font-bold text-vanguard-muted uppercase tracking-widest">
                  Total Squads: <span className="text-vanguard-gray-800 ml-1">{teams.length}</span>
                </p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.length > 0 ? (
            teams.map((team, idx) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <TeamCard team={team} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-vanguard-gray-50 rounded-3xl border border-dashed border-vanguard-gray-200">
               <Users size={48} className="mx-auto text-vanguard-gray-300 mb-4" />
               <h3 className="text-xl font-bold text-vanguard-gray-800">No Squads Active</h3>
               <p className="text-vanguard-muted text-sm mt-1">This division currently has no operational squads registered.</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default TeamsPage;
