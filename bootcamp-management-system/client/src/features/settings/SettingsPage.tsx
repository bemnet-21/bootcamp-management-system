import React, { useEffect, useState } from 'react';
import PageShell from '@/src/components/layout/PageShell';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { 
  User, 
  Shield, 
  Bell, 
  Settings as SettingsIcon, 
  Camera,
  CheckCircle2,
  Lock,
  Mail,
  Smartphone,
  Info
} from 'lucide-react';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useDivisionStore } from '@/src/store/useDivisionStore';
import { useParams } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import axiosInstance from '@/src/api/axiosInstance';
import { ENDPOINTS } from '@/src/api/endpoints';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { id: divisionId } = useParams();
  const { user } = useAuthStore();
  const { getDivisionById } = useDivisionStore();
  const division = getDivisionById(divisionId || '');
  
  const [activeTab, setActiveTab] = useState('profile');
  const isAdmin = user?.role === 'ADMIN';
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    if (!isAdmin) return;
    const fetchAdminProfile = async () => {
      setLoadingProfile(true);
      try {
        const response = await axiosInstance.get(ENDPOINTS.ADMIN_SETTINGS.PROFILE);
        const data = response.data?.data || {};
        setProfileForm({
          firstName: String(data.firstName || ''),
          lastName: String(data.lastName || ''),
          username: String(data.username || ''),
          email: String(data.email || ''),
        });
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to load admin settings profile.');
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchAdminProfile();
  }, [isAdmin]);

  const handleSaveProfile = async () => {
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim() || !profileForm.username.trim()) {
      toast.error('First name, last name and username are required.');
      return;
    }
    setSavingProfile(true);
    try {
      await axiosInstance.put(ENDPOINTS.ADMIN_SETTINGS.PROFILE, {
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        username: profileForm.username.trim(),
      });
      toast.success('Admin profile updated.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update admin profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Current and new passwords are required.');
      return;
    }
    setSavingPassword(true);
    try {
      await axiosInstance.post(ENDPOINTS.ADMIN_SETTINGS.PASSWORD, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '' });
      toast.success('Password updated successfully.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    ...(isAdmin ? [{ id: 'admin', label: 'Pillar Admin', icon: SettingsIcon }] : []),
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col md:flex-row gap-10">
               <div className="flex flex-col items-center">
                  <div className="relative group">
                     <div className="w-32 h-32 rounded-3xl bg-vanguard-gray-100 overflow-hidden ring-4 ring-vanguard-gray-50 group-hover:ring-vanguard-blue transition-all">
                        <img src={user?.avatar || "https://picsum.photos/seed/user/200"} alt="Profile" className="w-full h-full object-cover" />
                     </div>
                     <button className="absolute -right-2 -bottom-2 w-10 h-10 bg-vanguard-blue text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                        <Camera size={18} />
                     </button>
                  </div>
                  <p className="mt-4 text-[10px] font-bold text-vanguard-muted uppercase tracking-[0.2em]">User Identity</p>
               </div>
               
               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-vanguard-gray-800 uppercase tracking-widest">First Name</label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                      className="w-full h-11 px-4 bg-vanguard-gray-50 border border-vanguard-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue outline-none"
                      disabled={loadingProfile || savingProfile}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-vanguard-gray-800 uppercase tracking-widest">Last Name</label>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                      className="w-full h-11 px-4 bg-vanguard-gray-50 border border-vanguard-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue outline-none"
                      disabled={loadingProfile || savingProfile}
                    />
                  </div>
                  <div className="col-span-full space-y-1.5">
                    <label className="text-[11px] font-black text-vanguard-gray-800 uppercase tracking-widest">Username</label>
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, username: e.target.value }))}
                      className="w-full h-11 px-4 bg-vanguard-gray-50 border border-vanguard-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue outline-none"
                      disabled={loadingProfile || savingProfile}
                    />
                  </div>
                  <div className="col-span-full space-y-1.5">
                    <label className="text-[11px] font-black text-vanguard-gray-800 uppercase tracking-widest">Email Endpoint</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      className="w-full h-11 px-4 bg-vanguard-gray-50 border border-vanguard-gray-100 rounded-xl text-sm opacity-60 cursor-not-allowed"
                      disabled
                    />
                  </div>
               </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-vanguard-gray-100">
               <Button
                 className="h-11 px-8 uppercase tracking-widest text-[12px] font-black"
                 disabled={loadingProfile || savingProfile}
                 onClick={handleSaveProfile}
               >
                 {savingProfile ? 'Saving...' : 'Save Changes'}
               </Button>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <h3 className="text-sm font-black text-vanguard-gray-800 uppercase tracking-widest flex items-center">
                    <Lock size={16} className="mr-2 text-vanguard-blue" /> Credential Rotation
                  </h3>
                  <div className="space-y-4">
                     <div className="space-y-1.5">
                       <label className="text-[11px] font-bold text-vanguard-muted">CURRENT PASSWORD</label>
                       <input
                         type="password"
                         placeholder="••••••••"
                         value={passwordForm.currentPassword}
                         onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                         className="w-full h-11 px-4 bg-vanguard-gray-50 border border-vanguard-gray-100 rounded-xl text-sm"
                         disabled={savingPassword}
                       />
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-[11px] font-bold text-vanguard-muted">NEW PASSWORD</label>
                       <input
                         type="password"
                         placeholder="••••••••"
                         value={passwordForm.newPassword}
                         onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                         className="w-full h-11 px-4 bg-vanguard-gray-50 border border-vanguard-gray-100 rounded-xl text-sm"
                         disabled={savingPassword}
                       />
                     </div>
                     <Button
                       className="w-full h-11 uppercase text-[11px] font-black tracking-widest bg-vanguard-gray-800"
                       onClick={handleSavePassword}
                       disabled={savingPassword}
                     >
                       {savingPassword ? 'Saving...' : 'Commit New Credentials'}
                     </Button>
                  </div>
               </div>

               <div className="p-6 bg-vanguard-blue-light/20 rounded-2xl border border-vanguard-blue/10">
                  <div className="flex items-start mb-6">
                     <div className="w-10 h-10 bg-vanguard-blue text-white rounded-xl flex items-center justify-center shrink-0">
                        <Smartphone size={20} />
                     </div>
                     <div className="ml-4">
                        <h4 className="text-[13px] font-black text-vanguard-gray-800 uppercase tracking-tight">Two-Factor Authentication</h4>
                        <p className="text-[12px] text-vanguard-muted mt-1">Add an extra layer of security to your Vanguard account.</p>
                     </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-vanguard-blue/5">
                     <div>
                        <p className="text-[11px] font-bold text-vanguard-gray-800 tracking-tight">Email Verification (MFA)</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase mt-0.5">Highly Recommended</p>
                     </div>
                     <div className="w-11 h-6 bg-vanguard-blue rounded-full relative cursor-pointer p-1">
                        <div className="w-4 h-4 bg-white rounded-full translate-x-5 transition-transform"></div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
             {[
               { title: 'System Alerts', desc: 'Critical platform updates, security notices, and deployment alerts.', items: ['Email Notifications', 'Web Push Alerts', 'Slack Integration'] },
               { title: 'Training & Sessions', desc: 'Updates on bootcamps, squads, and mentor sessions you are following.', items: ['Upcoming Session Reminders', 'Squad Performance Reports', 'Bootcamp Enrollments'] }
             ].map((group, i) => (
               <div key={i} className="space-y-6">
                  <div>
                    <h3 className="text-sm font-black text-vanguard-gray-800 uppercase tracking-widest">{group.title}</h3>
                    <p className="text-[12px] text-vanguard-muted mt-1">{group.desc}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {group.items.map((item, j) => (
                       <div key={j} className="flex items-center justify-between p-4 bg-vanguard-gray-50 border border-vanguard-gray-100 rounded-2xl">
                          <span className="text-xs font-bold text-vanguard-gray-800 tracking-tight">{item}</span>
                          <div className="w-10 h-5 bg-vanguard-gray-200 rounded-full relative cursor-pointer p-0.5">
                             <div className="w-4 h-4 bg-white rounded-full transition-transform"></div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
             ))}
          </div>
        );
      case 'admin':
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="p-6 bg-vanguard-gray-800 rounded-3xl text-white relative overflow-hidden">
                <div className="relative z-10">
                   <h3 className="text-xl font-black tracking-tight mb-2">Pillar Administration Interface</h3>
                   <p className="text-vanguard-blue/80 text-[13px] font-medium max-w-lg mb-0 text-white opacity-80">
                     Authorized access to {division?.name} configuration. Changes here impact all members within this pillar.
                   </p>
                </div>
                <div className="absolute right-[-20px] top-[-20px] opacity-10">
                   <SettingsIcon size={120} />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <div className="flex items-center space-x-2 mb-2">
                      <div className="w-1.5 h-6 bg-vanguard-blue rounded-full"></div>
                      <h4 className="text-[11px] font-black text-vanguard-gray-800 uppercase tracking-widest">Leadership Configuration</h4>
                   </div>
                   <div className="space-y-4 p-6 border border-vanguard-gray-100 rounded-2xl">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-vanguard-muted">DIVISION HEAD NAME</label>
                        <input type="text" defaultValue={division?.head.name} className="w-full h-11 px-4 bg-vanguard-gray-50 border border-vanguard-gray-100 rounded-xl text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-vanguard-muted">HEAD TITLE/ROLE</label>
                        <input type="text" defaultValue={division?.head.role} className="w-full h-11 px-4 bg-vanguard-gray-50 border border-vanguard-gray-100 rounded-xl text-sm" />
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center space-x-2 mb-2">
                       <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                       <h4 className="text-[11px] font-black text-vanguard-gray-800 uppercase tracking-widest">Broadcast & Comm</h4>
                   </div>
                   <div className="space-y-4 p-6 border border-vanguard-gray-100 rounded-2xl">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-vanguard-muted">PILLAR ANNOUNCEMENT</label>
                        <textarea rows={4} className="w-full p-4 bg-vanguard-gray-50 border border-vanguard-gray-100 rounded-xl text-sm" defaultValue={`Welcome to the ${division?.name} division dashboard. New curricula updates are live.`} />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto">
         <div className="mb-10">
            <h1 className="text-4xl font-black text-vanguard-gray-800 tracking-tight">System Settings</h1>
            <p className="text-[13px] text-vanguard-muted mt-2 uppercase font-bold tracking-widest">
               Managing Identity & Control in <span className="text-vanguard-blue">{division?.name || 'Vanguard'}</span>
            </p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
            <aside className="space-y-2">
               {tabs.map((tab) => {
                 const Icon = tab.icon;
                 return (
                   <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={cn(
                       "w-full flex items-center px-6 py-4 rounded-2xl transition-all duration-300 group",
                       activeTab === tab.id 
                         ? "bg-vanguard-gray-800 text-white shadow-xl translate-x-2" 
                         : "bg-white border border-vanguard-gray-50 text-vanguard-muted hover:border-vanguard-blue/30"
                     )}
                   >
                     <Icon size={18} className={cn("mr-4", activeTab === tab.id ? "text-vanguard-blue" : "group-hover:text-vanguard-blue")} />
                     <span className="text-sm font-black tracking-tight">{tab.label}</span>
                   </button>
                 );
               })}
            </aside>

            <Card className="p-10 border-vanguard-gray-100 shadow-sm relative overflow-hidden">
               {renderTabContent()}
               <img src="/vanguard-watermark.svg" className="absolute -bottom-10 -right-10 w-64 opacity-[0.03] pointer-events-none" alt="" />
            </Card>
         </div>
      </div>
    </PageShell>
  );
};

export default SettingsPage;
