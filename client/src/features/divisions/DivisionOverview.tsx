import { useDivisionStore } from '@/src/store/useDivisionStore';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { ArrowRight, Monitor, Code, Shield, Lightbulb, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageShell from '@/src/components/layout/PageShell';
import { useEffect } from 'react';

const iconMap: Record<string, any> = {
  ds: Monitor,
  dev: Code,
  cyber: Shield,
  cpd: Lightbulb,
};

const DivisionOverview = () => {
  const { divisions, setActiveDivision } = useDivisionStore();
  const navigate = useNavigate();

  useEffect(() => {
    setActiveDivision(null);
  }, [setActiveDivision]);

  const handleViewDivision = (div: any) => {
    setActiveDivision(div);
    navigate(`/divisions/${div.id}`);
  };

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black text-vanguard-gray-800 tracking-tight mb-2">
              Division Overview
            </h1>
            <p className="text-vanguard-gray-800 opacity-60 max-w-2xl leading-relaxed">
              Welcome to the Vanguard Strategic Hub. Manage independent bootcamp operations, 
              track vertical-specific metrics, and allocate resources across our four specialized 
              learning pillars.
            </p>
          </div>
          <Button variant="outline" className="rounded-full bg-vanguard-blue-light border-none text-vanguard-blue">
            <Activity size={16} className="mr-2" /> Live Monitoring
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {divisions.map((div, idx) => {
            const Icon = iconMap[div.id] || Monitor;
            return (
              <Card key={div.id} noPadding className="group hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => handleViewDivision(div)}>
                <div className="relative h-64 overflow-hidden">
                   <img src={div.image} alt={div.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                   <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
                   <div className="absolute top-6 left-6 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-vanguard-blue border border-vanguard-gray-100">
                      <Icon size={24} />
                   </div>
                </div>
                
                <div className="p-8 -mt-16 relative z-10 bg-white/60 backdrop-blur-sm rounded-b-xl border-t border-white/50">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-vanguard-blue mb-1">
                        Division 0{idx + 1}
                      </p>
                      <h2 className="text-3xl font-black text-vanguard-gray-800 tracking-tight">
                        {div.name}
                      </h2>
                    </div>
                    <div className="text-right">
                       <p className="text-3xl font-black text-vanguard-gray-800 leading-none">{div.stats.activeBootcamps}</p>
                       <p className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-40">Active Bootcamps</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-vanguard-gray-800 opacity-60 mb-8 leading-relaxed line-clamp-2">
                    {div.description}
                  </p>
                  
                  <Button variant="outline" className="w-full h-11 border-vanguard-gray-200 group-hover:bg-vanguard-blue group-hover:text-white transition-all">
                    View Division <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Statistics Footer */}
        <div className="mt-16 p-10 bg-vanguard-blue-light/50 rounded-2xl flex flex-wrap gap-x-20 gap-y-10 items-center justify-between border border-vanguard-blue/10">
           <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-50 mb-1">Total Enrollment</p>
              <h3 className="text-3xl font-black text-vanguard-gray-800">1,284 <span className="text-green-500 text-xs font-bold">+12%</span></h3>
           </div>
           <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-50 mb-1">Completion Rate</p>
              <h3 className="text-3xl font-black text-vanguard-gray-800">94.2% <span className="text-vanguard-blue text-[10px] uppercase ml-2 tracking-widest">Target 95%</span></h3>
           </div>
           <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-50 mb-1">Faculty Strength</p>
              <h3 className="text-3xl font-black text-vanguard-gray-800">86 <span className="text-vanguard-gray-800 opacity-30 text-xs uppercase font-bold ml-1">Certified</span></h3>
           </div>
           <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-50 mb-1">Quarterly Growth</p>
              <h3 className="text-3xl font-black text-vanguard-gray-800">$4.2M <span className="text-[#9C6137] text-[10px] uppercase ml-2 tracking-widest">Projected</span></h3>
           </div>
        </div>
      </div>
    </PageShell>
  );
};

export default DivisionOverview;
