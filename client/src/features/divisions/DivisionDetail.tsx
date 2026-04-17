import { useDivisionStore } from '@/src/store/useDivisionStore';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import { useUserStore } from '@/src/store/useUserStore';
import { StatCard } from '@/src/components/shared/StatCard';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Users, Layout, Star, ChevronRight, Video, Calendar, Mail, UserPlus, ShieldPlus } from 'lucide-react';
import PageShell from '@/src/components/layout/PageShell';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { cn } from '@/src/lib/utils';

const DivisionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDivisionById, setActiveDivision } = useDivisionStore();
  const { getBootcampsByDivision } = useBootcampStore();
  const { getMembersByDivision } = useUserStore();

  const div = getDivisionById(id || '');
  const bootcamps = id ? getBootcampsByDivision(id) : [];
  const members = id ? getMembersByDivision(id) : [];

  useEffect(() => {
    if (div) {
      setActiveDivision(div);
    }
  }, [div, setActiveDivision]);

  if (!div) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold mb-4">Division not found</h1>
          <Button onClick={() => navigate('/')}>Back to Overview</Button>
        </div>
      </PageShell>
    );
  }

  // Theme shift logic
  const themeColors = {
    ds: 'text-[#003B7A]',
    dev: 'text-vanguard-blue',
    cyber: 'text-red-700',
    cpd: 'text-vanguard-gray-800'
  };

  const accentColor = themeColors[div.id as keyof typeof themeColors] || 'text-vanguard-blue';

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-4 mb-4">
           <div className="w-1.5 h-10 bg-vanguard-blue rounded-full" />
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-vanguard-muted">Vanguard Pillar Ecosystem</p>
        </div>
        
        <h1 className={cn("text-5xl font-black tracking-tight mb-12", accentColor)}>
          {div.name} Division
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatCard 
            label="Total Members"
            value={div.stats.members.toString()}
            trend={{ value: div.stats.memberTrend, isUp: true }}
            icon={<Users size={24} />}
          />
          <StatCard 
            label="Active Programs"
            value={div.stats.activeBootcamps.toString()}
            icon={<Layout size={24} />}
            progress={{ current: div.stats.activeBootcamps, total: div.stats.activeBootcamps + 4, color: 'bg-vanguard-blue' }}
            subtitle={`${div.stats.activeBootcamps} cohorts currently in session`}
          />
          <StatCard 
            label="Avg. Satisfaction"
            value={`${div.stats.satisfaction}%`}
            icon={<Star size={24} />}
            subtitle="Based on recent student reviews"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Ongoing Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-vanguard-gray-800 tracking-tight">Ongoing Bootcamps</h2>
              <button className="text-[10px] font-black uppercase tracking-widest text-vanguard-blue hover:underline">View All Programs</button>
            </div>
            
            <Card noPadding>
              {bootcamps.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => navigate(`/bootcamps/${item.id}`)}
                  className="p-6 border-b border-vanguard-gray-100 last:border-none flex items-center justify-between group hover:bg-vanguard-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-vanguard-blue-light flex items-center justify-center text-vanguard-blue group-hover:bg-vanguard-blue group-hover:text-white transition-all">
                       <Layout size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-vanguard-gray-800 uppercase tracking-tight">{item.name}</h4>
                      <p className="text-[10px] font-bold text-vanguard-gray-800 opacity-40 uppercase tracking-widest">
                         Batch {item.batch} • {item.students} Students • {item.cohort}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-12">
                    <div className="text-right hidden sm:block">
                       <p className="text-[10px] font-black uppercase tracking-widest text-vanguard-blue">Progress</p>
                       <p className="text-lg font-black text-vanguard-gray-800">{item.progress}%</p>
                    </div>
                    <ChevronRight size={20} className="text-vanguard-gray-800 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </Card>

            <Button className="w-full h-12 uppercase tracking-widest font-black" size="lg">
              <ShieldPlus size={18} className="mr-2" /> Launch New {div.name} Program
            </Button>
          </div>

          {/* Right Sidebar widgets */}
          <div className="space-y-8">
             <Card className="bg-[#003B7A] text-white overflow-hidden relative border-none p-8">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-6">Live System Monitoring</p>
                <h3 className="text-2xl font-black tracking-tight mb-4">Pillar Status: Secure</h3>
                <div className="flex items-center space-x-4 text-[10px] font-bold uppercase tracking-widest opacity-80 mb-10">
                   <div className="flex items-center"><Calendar size={14} className="mr-1.5" /> Next Sync In 2h</div>
                </div>
                <Button variant="outline" className="w-full bg-white text-[#003B7A] border-none hover:bg-white/90 uppercase tracking-widest font-black text-[10px]">
                   View Resource Allocation
                </Button>
             </Card>

             <Card className="p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-vanguard-gray-800 opacity-40 mb-6">Upcoming {div.name} Events</p>
                <div className="space-y-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                      <div>
                        <h4 className="text-sm font-black text-vanguard-gray-800 tracking-tight group-hover:text-vanguard-blue transition-colors">Technical Review Q{i}</h4>
                        <p className="text-[10px] font-bold text-vanguard-gray-800 opacity-50 uppercase tracking-widest mt-1">10:00 AM - 12:30 PM</p>
                      </div>
                      <div className="w-10 h-10 border border-vanguard-gray-200 rounded-lg flex items-center justify-center text-vanguard-gray-800 opacity-40 group-hover:bg-vanguard-gray-50 transition-all">
                        <Calendar size={18} />
                      </div>
                    </div>
                  ))}
                </div>
             </Card>
          </div>
        </div>

        {/* Leadership Section */}
        <section className="bg-vanguard-blue-light/30 rounded-2xl p-10 border border-vanguard-blue/5">
           <h2 className="text-xl font-black text-vanguard-gray-800 tracking-tight mb-8">Pillar Leadership</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Division Head */}
              <Card className="group border-none shadow-sm h-full p-6">
                 <div className="flex space-x-6 h-full">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-vanguard-blue-light group-hover:ring-vanguard-blue/20 transition-all shrink-0">
                       <img src={div.head.avatar} alt={div.head.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-between py-1">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-vanguard-blue leading-none mb-1.5">{div.head.role}</p>
                          <h4 className="text-xl font-black text-vanguard-gray-800 tracking-tight mb-2 underline decoration-vanguard-gray-800/10 decoration-2 underline-offset-4">{div.head.name}</h4>
                          <p className="text-xs text-vanguard-gray-800 opacity-50 font-medium leading-relaxed">{div.head.bio}</p>
                       </div>
                       <div className="flex space-x-3 mt-4">
                          <button className="text-vanguard-blue hover:scale-110 transition-transform"><Mail size={18} /></button>
                          <button className="text-vanguard-blue hover:scale-110 transition-transform"><UserPlus size={18} /></button>
                       </div>
                    </div>
                 </div>
              </Card>

              {/* Other key member */}
              {members[1] && (
                <Card className="group border-none shadow-sm h-full p-6">
                   <div className="flex space-x-6 h-full">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-vanguard-blue-light group-hover:ring-vanguard-blue/20 transition-all shrink-0">
                         <img src={members[1].avatar} alt={members[1].name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col justify-between py-1">
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-vanguard-blue leading-none mb-1.5">{members[1].role === 'Instructor' ? 'Senior Expert' : 'Admin lead'}</p>
                            <h4 className="text-xl font-black text-vanguard-gray-800 tracking-tight mb-2 underline decoration-vanguard-gray-800/10 decoration-2 underline-offset-4">{members[1].name}</h4>
                            <p className="text-xs text-vanguard-gray-800 opacity-50 font-medium leading-relaxed">
                              Dedicated expert within the {div.name} ecosystem.
                            </p>
                         </div>
                         <div className="flex space-x-3 mt-4">
                            <button className="text-vanguard-blue hover:scale-110 transition-transform"><Mail size={18} /></button>
                            <button className="text-vanguard-blue hover:scale-110 transition-transform"><UserPlus size={18} /></button>
                         </div>
                      </div>
                   </div>
                </Card>
              )}
           </div>
        </section>
      </div>
    </PageShell>
  );
};

export default DivisionDetail;
