import React from 'react';
import PageShell from '@/src/components/layout/PageShell';
import { Card } from '@/src/components/ui/Card';
import { GraduationCap, Users, TrendingUp, Monitor, Code, Shield, Lightbulb, FileText, Download, UserPlus, AlertTriangle } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

const AdminDashboard = () => {
  const topMetrics = [
    { label: 'Total Bootcamps', value: '8', sub: 'LIFETIME', icon: GraduationCap, color: 'text-[#00519E]' },
    { label: 'Active Bootcamps', value: '5', sub: 'RUNNING', badge: 'bg-[#BFE9D4] text-[#0A7B42]', icon: Monitor, iconBg: 'bg-[#BFE9D4] text-[#0A7B42]' },
    { label: 'Total Members', value: '150', sub: 'AVATARS', icon: Users, iconBg: 'bg-[#E2E8F0] text-[#475569]' },
    { label: 'System Growth', value: '20%', sub: '↑ +4.2%', icon: TrendingUp, iconBg: 'bg-[#FFDCCB] text-[#D05624]' }
  ];

  const divisions = [
    { name: 'Development', icon: Code, students: 64, csat: '94%', bootcamps: 2, iconColor: 'text-[#00519E]' },
    { name: 'Data Science', icon: Monitor, students: 58, csat: '92%', bootcamps: 2, iconColor: 'text-[#00519E]' },
    { name: 'Cybersecurity', icon: Shield, students: 28, csat: '96%', bootcamps: 1, iconColor: 'text-[#00519E]' },
    { name: 'CPD', icon: Lightbulb, students: 1240, csat: '88%', bootcamps: 'Continuous', isCpd: true, iconColor: 'text-[#00519E]' }
  ];

  const activeBootcamps = [
    { name: 'Fullstack 2024-A', division: 'Development', instructor: 'David Chen', enrolled: 48, total: 50, progress: 65, status: 'ON TRACK', statusColor: 'bg-[#BFE9D4] text-[#0A7B42]' },
    { name: 'Data Viz Master', division: 'Data Science', instructor: 'Sarah Jenkins', enrolled: 25, total: 25, progress: 88, status: 'ACTIVE', statusColor: 'bg-[#D4E5FF] text-[#00519E]' },
    { name: 'Security+ Prep', division: 'Cybersecurity', instructor: 'Marcus Vane', enrolled: 12, total: 30, progress: 15, status: 'DELAYED', statusColor: 'bg-[#FFDCCB] text-[#D05624]' }
  ];

  const activities = [
    { type: 'task', title: 'New Task Submitted', desc: 'Fullstack Cohort - Module 4 Project', time: '14 MINS AGO', icon: FileText, color: 'text-[#00519E]' },
    { type: 'user', title: 'New Member Enrolled', desc: 'James Wilson joined Data Science Prep', time: '1 HOUR AGO', icon: UserPlus, color: 'text-[#0A7B42]' },
    { type: 'alert', title: 'Low Attendance Alert', desc: 'Security+ Prep session dropped below 40%', time: '2 HOURS AGO', icon: AlertTriangle, color: 'text-[#D05624]' }
  ];

  return (
    <PageShell>
      <div className="max-w-[1400px] mx-auto pb-12">
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {topMetrics.map((metric, i) => (
            <Card key={i} className="p-6 border-none shadow-sm flex flex-col justify-between h-[140px] bg-white">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-bold text-vanguard-muted uppercase tracking-widest">{metric.label}</p>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${metric.iconBg || 'bg-transparent text-[#00519E]'}`}>
                  <metric.icon size={18} />
                </div>
              </div>
              <div className="flex items-end justify-between mt-4">
                <h3 className="text-4xl font-black text-vanguard-gray-800 tracking-tight leading-none">{metric.value}</h3>
                {metric.badge ? (
                   <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest ${metric.badge}`}>{metric.sub}</span>
                ) : metric.sub === 'AVATARS' ? (
                   <div className="flex -space-x-2">
                     <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"></div>
                     <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></div>
                     <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white"></div>
                   </div>
                ) : metric.sub.startsWith('↑') ? (
                   <span className="text-[10px] font-bold tracking-widest text-[#0A7B42]">{metric.sub}</span>
                ) : (
                   <span className="text-[9px] font-bold text-vanguard-blue uppercase tracking-widest">{metric.sub}</span>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Strategic Divisions */}
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xl font-bold text-vanguard-gray-800 tracking-tight">Strategic Divisions</h2>
          <button className="text-sm font-bold text-vanguard-blue hover:underline flex items-center">
            View All <span className="ml-1">→</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {divisions.map((div, i) => (
            <Card key={i} className="p-6 border-none shadow-sm bg-[#F4F7FB] flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-4 shadow-sm">
                  <div className={div.iconColor}><div.icon size={20} /></div>
                </div>
                <h3 className="text-xl font-bold text-vanguard-gray-800 tracking-tight mb-6">{div.name}</h3>
              </div>
              
              <div className="flex justify-between items-end border-b border-gray-200 pb-4 mb-4">
                <p className="text-[10px] font-bold text-vanguard-muted uppercase tracking-widest">{div.isCpd ? 'TOTAL CREDITS' : 'ACTIVE STUDENTS'}</p>
                <p className="text-2xl font-black text-vanguard-gray-800 leading-none">{div.students}</p>
              </div>
              
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-bold text-[#0A7B42] uppercase tracking-widest">{div.isCpd ? 'ENGAGEMENT' : 'CSAT SCORE'}</p>
                <div className="text-right">
                  <p className="text-xl font-black text-vanguard-gray-800 leading-none mb-1">{div.csat}</p>
                  <p className="text-[9px] text-vanguard-muted uppercase tracking-widest font-medium">
                    {typeof div.bootcamps === 'number' ? `${div.bootcamps} Bootcamps` : div.bootcamps}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Bootcamp Status */}
          <div className="lg:col-span-2">
            <Card className="p-0 border-none shadow-sm bg-white overflow-hidden">
              <div className="p-6 flex justify-between items-center border-b border-gray-100">
                <h2 className="text-xl font-bold text-vanguard-gray-800 tracking-tight">Active Bootcamp Status</h2>
                <div className="flex space-x-3">
                  <Button variant="outline" className="h-9 px-4 text-xs font-bold text-[#00519E] bg-[#E6F0FF] border-none hover:bg-[#d4e5ff]">
                    Download PDF
                  </Button>
                  <Button className="h-9 px-4 text-xs font-bold bg-[#00519E] hover:bg-[#003d7a]">
                    Add Cohort
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] uppercase tracking-widest text-vanguard-muted">
                      <th className="px-6 py-4 font-bold">Cohort Name</th>
                      <th className="px-6 py-4 font-bold">Division</th>
                      <th className="px-6 py-4 font-bold">Lead Instructor</th>
                      <th className="px-6 py-4 font-bold">Enrollment Completion</th>
                      <th className="px-6 py-4 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activeBootcamps.map((bc, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-vanguard-gray-800">{bc.name}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-xs text-vanguard-muted font-medium">{bc.division}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-2">
                            <img src={`https://i.pravatar.cc/150?u=${bc.instructor}`} alt="" className="w-6 h-6 rounded-full" />
                            <p className="text-xs font-bold text-vanguard-gray-800">{bc.instructor}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-3">
                            <p className="text-xs font-bold text-vanguard-gray-800 w-10">{bc.enrolled}/{bc.total}</p>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex-1 max-w-[120px]">
                              <div 
                                className={`h-full ${bc.progress < 40 ? 'bg-[#D05624]' : 'bg-[#00519E]'}`} 
                                style={{ width: `${bc.progress}%` }}
                              ></div>
                            </div>
                            <p className="text-[10px] text-vanguard-muted w-8">{bc.progress}%</p>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className={`px-2 py-1 rounded text-[9px] font-bold tracking-widest inline-block text-center min-w-[60px] ${bc.statusColor}`}>
                            {bc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Activity Feed */}
          <div>
            <Card className="p-6 border-none shadow-sm bg-[#F8FAFC] h-full">
              <h2 className="text-xl font-bold text-vanguard-gray-800 tracking-tight mb-8">Activity Feed</h2>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gray-200">
                {activities.map((act, i) => (
                  <div key={i} className="relative flex items-start space-x-4">
                    <div className="relative z-10 w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                      <act.icon size={16} className={act.color} />
                    </div>
                    <div className="pt-1 flex-1">
                      <h4 className="text-sm font-bold text-vanguard-gray-800 mb-1">{act.title}</h4>
                      <p className="text-xs text-vanguard-muted leading-relaxed mb-2">{act.desc}</p>
                      <p className="text-[9px] font-bold text-vanguard-muted uppercase tracking-widest">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

        </div>
      </div>
    </PageShell>
  );
};

export default AdminDashboard;
