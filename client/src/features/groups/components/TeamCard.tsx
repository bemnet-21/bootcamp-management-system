import React from 'react';
import { Team } from '@/src/store/useTeamStore';
import { Card } from '@/src/components/ui/Card';
import { Progress } from '@/src/components/ui/Progress';
import { Users, ChevronRight } from 'lucide-react';

interface TeamCardProps {
  team: Team;
}

const TeamCard = ({ team }: TeamCardProps) => {
  return (
    <Card className="p-6 hover:shadow-xl transition-all group border-vanguard-gray-100">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-vanguard-gray-800 tracking-tight group-hover:text-vanguard-blue transition-colors">
            {team.name}
          </h3>
          <p className="text-[13px] text-vanguard-muted font-medium mt-1 uppercase tracking-wider opacity-60">
            {team.projectTitle}
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-vanguard-blue-light/30 flex items-center justify-center text-vanguard-blue">
          <Users size={18} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-[11px] font-bold text-vanguard-muted uppercase tracking-widest">
          <span>Project Progress</span>
          <span className="text-vanguard-gray-800">{team.progress}%</span>
        </div>
        <Progress value={team.progress} className="h-1.5" />
      </div>

      <div className="mt-8 pt-6 border-t border-vanguard-gray-50 flex items-center justify-between">
        <div className="flex -space-x-2">
          {team.avatars.map((avatar, i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-vanguard-gray-100 overflow-hidden ring-1 ring-vanguard-gray-50">
              <img src={avatar} alt="Member" className="w-full h-full object-cover" />
            </div>
          ))}
          {team.memberCount > team.avatars.length && (
            <div className="w-8 h-8 rounded-full border-2 border-white bg-vanguard-gray-800 flex items-center justify-center text-[10px] text-white font-bold ring-1 ring-vanguard-gray-50">
              +{team.memberCount - team.avatars.length}
            </div>
          )}
        </div>
        
        <div className="text-right">
          <p className="text-[10px] text-vanguard-muted font-bold uppercase tracking-tighter">Assigned Mentor</p>
          <p className="text-xs font-bold text-vanguard-gray-800">{team.mentorName}</p>
        </div>
      </div>

      <button className="w-full mt-6 py-2.5 rounded-lg bg-vanguard-gray-50 text-vanguard-gray-800 text-[11px] font-bold uppercase tracking-widest hover:bg-vanguard-blue hover:text-white transition-all flex items-center justify-center group/btn">
        View Squad Details
        <ChevronRight size={14} className="ml-1 transform group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </Card>
  );
};

export default TeamCard;
