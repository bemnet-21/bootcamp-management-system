import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageShell from '@/src/components/layout/PageShell';
import { useUserStore } from '@/src/store/useUserStore';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { Card } from '@/src/components/ui/Card';
import { 
  Mail, 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  Activity as ActivityIcon, 
  Shield, 
  Settings as SettingsIcon,
  CheckCircle2,
  Clock,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

const MemberProfile = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { members, fetchMembers } = useUserStore();
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    if (members.length === 0) fetchMembers().catch(() => {});
  }, [members.length, fetchMembers]);

  const member = members.find(m => m.id === memberId);

  if (!member) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold mb-4">Member not found</h1>
          <Button onClick={() => navigate('/members')}>Back to Directory</Button>
        </div>
      </PageShell>
    );
  }

  const tabs = ['Overview', 'Activity', 'Settings'];

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto pb-20">
        <button 
          onClick={() => navigate('/members')}
          className="flex items-center text-[11px] font-bold uppercase tracking-widest text-vanguard-muted hover:text-vanguard-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft size={14} className="mr-2" /> Back to Directory
        </button>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-12">
          <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-xl border-4 border-white shrink-0">
             <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-4xl font-bold text-vanguard-gray-800 tracking-tight">{member.name}</h1>
              <Badge variant={member.status === 'Active' ? 'active' : member.status === 'Suspended' ? 'suspended' : 'default'}>
                {member.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[13px] text-vanguard-muted font-medium">
              <div className="flex items-center"><Shield size={14} className="mr-2" /> {member.role}</div>
              <div className="flex items-center"><MapPin size={14} className="mr-2" /> {member.divisionId} Division</div>
              <div className="flex items-center"><Calendar size={14} className="mr-2" /> Joined {member.joinedDate}</div>
            </div>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="h-10 px-6">Message</Button>
             <Button className="h-10 px-6">Edit Profile</Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-10 border-b border-vanguard-gray-200 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-4 text-xs font-bold uppercase tracking-widest transition-all relative",
                activeTab === tab ? "text-vanguard-blue" : "text-vanguard-muted hover:text-vanguard-gray-800"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-vanguard-blue rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'Overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <Card className="md:col-span-2 space-y-8 p-8">
                <div>
                   <h3 className="text-sm font-bold text-vanguard-gray-800 uppercase tracking-widest mb-6">Contact Information</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-1">
                         <p className="text-[10px] font-bold text-vanguard-muted uppercase tracking-widest">Email Address</p>
                         <p className="text-[15px] font-medium text-vanguard-gray-800">{member.email}</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-bold text-vanguard-muted uppercase tracking-widest">Phone Number</p>
                         <p className="text-[15px] font-medium text-vanguard-gray-800">+1 (555) 000-0000</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-bold text-vanguard-muted uppercase tracking-widest">Office Location</p>
                         <p className="text-[15px] font-medium text-vanguard-gray-800">Main Campus, Wing A</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-bold text-vanguard-muted uppercase tracking-widest">Work Hours</p>
                         <p className="text-[15px] font-medium text-vanguard-gray-800">9:00 AM - 5:00 PM EST</p>
                      </div>
                   </div>
                </div>

                <div className="pt-8 border-t border-vanguard-gray-100">
                   <h3 className="text-sm font-bold text-vanguard-gray-800 uppercase tracking-widest mb-6">Professional Bio</h3>
                   <p className="text-[15px] text-vanguard-muted leading-relaxed">
                      Vanguard professional specializing in {member.divisionId.toLowerCase()} operations. 
                      Dedicated to promoting engineering excellence and sustainable learning pathways within the organization.
                   </p>
                </div>
              </Card>

              <div className="space-y-8">
                 <Card className="p-6">
                    <h3 className="text-[10px] font-bold text-vanguard-muted uppercase tracking-widest mb-4">Assigned Division</h3>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-vanguard-blue-light rounded-xl flex items-center justify-center text-vanguard-blue">
                          <Shield size={20} />
                       </div>
                       <div>
                          <p className="font-bold text-vanguard-gray-800">{member.divisionId}</p>
                          <p className="text-[11px] text-vanguard-muted font-medium uppercase tracking-wider">Level 3 Clearance</p>
                       </div>
                    </div>
                 </Card>

                 <Card className="p-6">
                    <h3 className="text-[10px] font-bold text-vanguard-muted uppercase tracking-widest mb-4">Account Stats</h3>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[13px] text-vanguard-muted font-medium">Bootcamps Lead</span>
                          <span className="text-sm font-bold">12</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[13px] text-vanguard-muted font-medium">Students Mentored</span>
                          <span className="text-sm font-bold">482</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[13px] text-vanguard-muted font-medium">Platform Rank</span>
                          <span className="text-sm font-bold text-vanguard-blue">Elite</span>
                       </div>
                    </div>
                 </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'Activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl"
            >
               <div className="relative pl-8 space-y-12 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-vanguard-gray-200">
                  {[
                    { title: 'Completed Bootcamp Update', time: '2 hours ago', icon: CheckCircle2, color: 'text-green-500' },
                    { title: 'Initiated Mentor Session', time: 'Yesterday, 4:12 PM', icon: Clock, color: 'text-vanguard-blue' },
                    { title: 'Modified Course Material', time: '3 days ago', icon: ActivityIcon, color: 'text-vanguard-muted' }
                  ].map((item, idx) => (
                    <div key={idx} className="relative">
                       <div className="absolute -left-[29px] top-1 p-1 bg-white">
                          <item.icon size={16} className={item.color} />
                       </div>
                       <div>
                          <p className="font-bold text-vanguard-gray-800 text-[15px] mb-1">{item.title}</p>
                          <p className="text-[12px] text-vanguard-muted font-medium uppercase tracking-wider">{item.time}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}

          {activeTab === 'Settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="max-w-2xl divide-y divide-vanguard-gray-100">
                 {[
                   { label: 'Public Profile Visibility', desc: 'Allow other students to view this directory profile', icon: User },
                   { label: 'System Notifications', desc: 'Receive automated alerts for division-level changes', icon: ActivityIcon },
                   { label: 'Two-Factor Authentication', desc: 'Enable advanced security for sensitive management access', icon: Shield }
                 ].map((item, idx) => (
                   <div key={idx} className="p-8 flex items-center justify-between">
                      <div className="flex gap-4">
                         <div className="text-vanguard-muted"><item.icon size={20} /></div>
                         <div>
                            <p className="font-bold text-vanguard-gray-800 text-[15px]">{item.label}</p>
                            <p className="text-[13px] text-vanguard-muted leading-relaxed">{item.desc}</p>
                         </div>
                      </div>
                      <div className="w-12 h-6 bg-vanguard-blue rounded-full p-1 flex justify-end">
                         <div className="w-4 h-4 bg-white rounded-full" />
                      </div>
                   </div>
                 ))}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
};

export default MemberProfile;
