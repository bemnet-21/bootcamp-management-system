import { useState } from 'react';
import { StatCard } from '@/src/components/shared/StatCard';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { DataTable } from '@/src/components/shared/DataTable';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Calendar,
  MoreVertical,
  Pencil,
  ArrowLeft
} from 'lucide-react';
import PageShell from '@/src/components/layout/PageShell';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const BootcampWorkspace = () => {
  const [activeTab, setActiveTab] = useState('Curriculum');
  const navigate = useNavigate();

  const students = [
    { id: 1, name: 'Elena Rodriguez', project: 'Redux Project Template', time: '10m ago', enrollment: 'Mar 12, 2024', progress: 92, attendance: 98, status: 'active' as const, avatar: 'https://picsum.photos/seed/elena/200' },
    { id: 2, name: 'Marcus Thorne', project: 'State Management Quiz', time: '45m ago', enrollment: 'Mar 14, 2024', progress: 65, attendance: 82, status: 'at-risk' as const, avatar: 'https://picsum.photos/seed/marcus/200' },
    { id: 3, name: 'Julian Vane', project: 'API Endpoint Logic', time: '2h ago', enrollment: 'Mar 12, 2024', progress: 88, attendance: 94, status: 'active' as const, avatar: 'https://picsum.photos/seed/julian/200' },
    { id: 4, name: 'Sarah Jenkins', project: 'Portfolio Site V1', time: '1d ago', enrollment: 'Mar 12, 2024', progress: 100, attendance: 99, status: 'graduated' as const, avatar: 'https://picsum.photos/seed/sarah/200' },
  ];

  const modules = [
    { id: '04', name: 'Advanced State Management with Redux', duration: '2 Weeks', focus: 'RTK Query, Slices, Selectors', status: 'in progress' as const, lead: 'Sarah Jenkins', tasks: '4/6', end: 'May 24' },
    { id: '03', name: 'Backend Integration & API Design', duration: '3 Weeks', focus: 'Node.js, Express, PostgreSQL', status: 'completed' as const, lead: 'David Chen', tasks: 'All', end: 'May 10' },
    { id: '05', name: 'Testing, Deployment & CI/CD', duration: '2 Weeks', focus: 'Jest, Cypress, Docker', status: 'upcoming' as const, lead: null, tasks: '0/8', end: 'Jun 12' },
  ];

  const studentColumns = [
    {
      header: 'Student Name',
      key: 'name',
      render: (item: any) => (
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
             <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="font-black text-vanguard-gray-800 tracking-tight">{item.name}</h4>
            <p className="text-[10px] font-bold text-vanguard-gray-800 opacity-40 uppercase tracking-widest leading-tight">
               {item.project} • {item.time}
            </p>
          </div>
        </div>
      )
    },
    { header: 'Enrollment Date', key: 'enrollment', render: (item: any) => <span className="text-gray-500 font-medium">{item.enrollment}</span> },
    { 
      header: 'Overall Progress', 
      key: 'progress',
      render: (item: any) => (
        <div className="flex items-center space-x-3 w-32">
           <div className="flex-1 h-1.5 bg-vanguard-gray-100 rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full", item.status === 'at-risk' ? "bg-orange-800" : "bg-vanguard-blue")} 
                style={{ width: `${item.progress}%` }} 
              />
           </div>
           <span className="text-[10px] font-black">{item.progress}%</span>
        </div>
      )
    },
    { header: 'Attendance', key: 'attendance', render: (item: any) => <span className="font-black text-vanguard-gray-800">{item.attendance}%</span> },
    { header: 'Status', key: 'status', render: (item: any) => <Badge variant={item.status}>{item.status}</Badge> },
    { 
      header: '', 
      key: 'actions', 
      align: 'right' as const,
      render: () => <button className="text-vanguard-gray-800 opacity-40 hover:opacity-100"><MoreVertical size={18} /></button> 
    }
  ];

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate('/bootcamps')}
          className="flex items-center text-[10px] font-black uppercase tracking-widest text-vanguard-gray-800 opacity-40 hover:opacity-100 mb-4 transition-all"
        >
          <ArrowLeft size={14} className="mr-2" /> Back to Registry
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
           <div>
              <div className="flex items-center space-x-3 mb-2">
                 <Badge variant="upcoming">Cohort 2024.B</Badge>
                 <Badge variant="active" className="bg-green-100 text-green-700">Active</Badge>
              </div>
              <h1 className="text-5xl font-black text-vanguard-gray-800 tracking-tight leading-none mb-4">
                Full-Stack React Engineer
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-50">
                 <div className="flex items-center"><MapPin size={14} className="mr-2" /> Development Division</div>
                 <div className="flex items-center"><Calendar size={14} className="mr-2" /> Started March 12, 2024</div>
              </div>
           </div>
           <Button className="h-11 px-8 uppercase tracking-widest text-xs font-black shadow-lg">
              <Pencil size={16} className="mr-2" /> Edit Bootcamp
           </Button>
        </div>

        {/* Workspace Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           <StatCard label="Total Students" value="320" icon={<Users size={20} />} trend={{ value: "+12% from last cohort", isUp: true }} />
           <StatCard label="Avg. Attendance" value="94%" icon={<Clock size={20} />} progress={{ current: 94, total: 100 }} />
           <StatCard label="Course Progress" value="16/24" subtitle="8 weeks remaining" icon={<CheckCircle2 size={20} />} />
           <StatCard label="Completion Rate" value="88%" icon={<AlertCircle size={20} />} trend={{ value: "! 4 students at risk", isUp: false }} />
        </div>

        {/* Tabs */}
        <div className="flex space-x-12 border-b border-vanguard-gray-200 mb-10 overflow-x-auto scrollbar-hide">
           {['Curriculum', 'Students', 'Sessions', 'Resources'].map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={cn(
                 "pb-4 text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap",
                 activeTab === tab ? "text-vanguard-blue" : "text-vanguard-gray-800 opacity-40 hover:opacity-100"
               )}
             >
               {tab}
               {activeTab === tab && (
                 <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-vanguard-blue rounded-t-full" />
               )}
             </button>
           ))}
        </div>

        <AnimatePresence mode="wait">
           {activeTab === 'Students' && (
             <motion.div
               key="students"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.3 }}
             >
                <DataTable columns={studentColumns} data={students} />
                <div className="mt-8 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-vanguard-gray-800 opacity-40">
                   <span>Showing 1-10 of 320 students</span>
                   <div className="flex items-center space-x-2">
                      <button className="p-1 border border-vanguard-gray-200 rounded hover:bg-white"><ArrowLeft size={14} /></button>
                      <button className="p-1 border border-vanguard-gray-200 rounded hover:bg-white rotate-180"><ArrowLeft size={14} /></button>
                   </div>
                </div>
             </motion.div>
           )}

           {activeTab === 'Curriculum' && (
             <motion.div
               key="curriculum"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.3 }}
               className="space-y-6"
             >
                {modules.map((mod) => (
                  <Card key={mod.id} className="group hover:border-vanguard-blue/30 transition-all border-vanguard-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="flex items-center space-x-6">
                          <div className="w-16 h-16 rounded-xl bg-vanguard-blue-light flex items-center justify-center text-vanguard-blue text-2xl font-black shrink-0 group-hover:bg-vanguard-blue group-hover:text-white transition-colors">
                            {mod.id}
                          </div>
                          <div>
                             <div className="flex items-center space-x-3 mb-1">
                                <h3 className="text-xl font-black text-vanguard-gray-800 tracking-tight">{mod.name}</h3>
                                <Badge variant={mod.status === 'in progress' ? 'active' : mod.status as any}>{mod.status}</Badge>
                             </div>
                             <p className="text-[10px] font-bold text-vanguard-gray-800 opacity-40 uppercase tracking-widest">
                               Module Duration: {mod.duration} • Focus: {mod.focus}
                             </p>
                          </div>
                       </div>
                       
                       <div className="flex flex-wrap items-center gap-8 md:gap-12 border-t md:border-t-0 pt-4 md:pt-0 border-vanguard-gray-50 uppercase tracking-widest font-bold text-[10px] text-vanguard-gray-800">
                          {mod.lead && (
                            <div className="flex items-center space-x-3">
                               <div className="w-8 h-8 rounded-full bg-vanguard-gray-200 overflow-hidden">
                                  <img src={`https://picsum.photos/seed/${mod.lead}/100`} alt={mod.lead} className="w-full h-full object-cover" />
                               </div>
                               <span className="opacity-60">{mod.lead}</span>
                            </div>
                          )}
                          <div className="flex items-center opacity-60">
                             <CheckCircle2 size={14} className="mr-2 text-green-500" /> {mod.tasks} Tasks Completed
                          </div>
                          <div className="flex items-center opacity-60">
                             <Calendar size={14} className="mr-2" /> {mod.status === 'completed' ? 'Finished' : 'Ends'} {mod.end}
                          </div>
                       </div>
                    </div>
                  </Card>
                ))}
             </motion.div>
           )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
};

export default BootcampWorkspace;
