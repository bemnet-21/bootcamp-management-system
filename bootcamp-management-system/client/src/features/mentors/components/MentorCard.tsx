import React from 'react';
import { Member } from '@/src/store/useUserStore';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Star, Award, Calendar, ExternalLink } from 'lucide-react';

interface MentorCardProps {
  mentor: Member;
}

const MentorCard = ({ mentor }: MentorCardProps) => {
  return (
    <Card className="overflow-hidden group border-vanguard-gray-100 bg-white hover:border-vanguard-blue/30 transition-all duration-500">
      <div className="relative h-40 overflow-hidden">
        <img 
          src={`https://picsum.photos/seed/${mentor.id}/600/400`} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 opacity-80" 
          alt="Mentor Background"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-6 flex items-end">
          <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-vanguard-gray-100">
            <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
          </div>
          <div className="ml-4 mb-1">
             <div className="flex items-center space-x-1 text-yellow-400 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} fill={i < Math.floor(mentor.rating || 0) ? "currentColor" : "none"} strokeWidth={i < Math.floor(mentor.rating || 0) ? 0 : 2} />
                ))}
                <span className="text-[10px] font-black ml-1 text-white border-b border-yellow-400/50">{mentor.rating}</span>
             </div>
             <h3 className="text-lg font-black text-white leading-none tracking-tight">{mentor.name}</h3>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-5">
        <div>
          <p className="text-[10px] font-bold text-vanguard-blue uppercase tracking-widest mb-1.5 flex items-center">
            <Award size={10} className="mr-1" /> Core Specialization
          </p>
          <p className="text-[14px] font-extrabold text-vanguard-gray-800 leading-tight">
            {mentor.specialization}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-vanguard-gray-50 rounded-xl">
             <p className="text-[9px] font-bold text-vanguard-muted uppercase tracking-tighter mb-0.5">Experience</p>
             <p className="text-sm font-black text-vanguard-gray-800">{mentor.experience}+ Years</p>
          </div>
          <div className="p-3 bg-vanguard-gray-50 rounded-xl">
             <p className="text-[9px] font-bold text-vanguard-muted uppercase tracking-tighter mb-0.5">Clearance</p>
             <p className="text-sm font-black text-vanguard-gray-800">Lvl 4 Instructor</p>
          </div>
        </div>

        <div className="flex gap-2">
           <Button className="flex-1 h-10 text-[11px] font-bold uppercase tracking-widest bg-vanguard-gray-800 hover:bg-vanguard-blue">
              Schedule Session
           </Button>
           <button className="w-10 h-10 rounded-lg border border-vanguard-gray-200 flex items-center justify-center text-vanguard-muted hover:text-vanguard-blue hover:border-vanguard-blue transition-all">
              <ExternalLink size={18} />
           </button>
        </div>
      </div>
    </Card>
  );
};

export default MentorCard;
