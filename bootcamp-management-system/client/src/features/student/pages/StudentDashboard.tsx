import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/src/store/useAuthStore';
import { studentService, Session } from '@/src/api/studentService';
import { toast } from 'sonner';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendancePercent, setAttendancePercent] = useState<string>('0%');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 1. Fetch sessions
        const fetchedSessions = await studentService.getSessions(user?.divisions?.[0]);
        setSessions(fetchedSessions.slice(0, 3)); // Only show top 3

        // 2. Identify bootcampId from the first session to fetch stats
        if (fetchedSessions.length > 0 && (fetchedSessions[0] as any).bootcamp) {
           const bootcampId = (fetchedSessions[0] as any).bootcamp;
           const stats = await studentService.getAttendanceStats(bootcampId);
           setAttendancePercent(stats);
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading && !user) return <div className="p-20 text-center font-bold">Loading your dashboard...</div>;

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Hero */}
      <section className="bg-primary rounded-[2.5rem] p-10 text-on-primary shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-tertiary/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 font-label">Academic Terminal</span>
          <h1 className="text-6xl font-black font-manrope tracking-tighter mt-4 leading-none">
            Welcome Back, <br />
            <span className="text-secondary-container">{user?.firstName || 'Scholar'}</span>
          </h1>
          <p className="mt-8 text-lg font-medium opacity-90 font-body leading-relaxed">
            You have <span className="underline decoration-secondary decoration-4 underline-offset-4">{sessions.length} sessions listed</span> for your current module. Your current academic velocity is looking exceptional.
          </p>
        </div>
      </section>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Stats and Sessions */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          
          {/* Quick Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/10 shadow-sm group hover:bg-primary hover:text-on-primary transition-all duration-500 cursor-pointer">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 font-label group-hover:text-on-primary/80">Attendance Rate</p>
              <div className="flex items-baseline gap-2 mt-2">
                <h4 className="text-4xl font-black font-manrope">{attendancePercent}</h4>
              </div>
            </div>
            {/* Mocking other stats for now as they are not in backend yet */}
            <div className="bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/10 shadow-sm group hover:bg-tertiary hover:text-on-tertiary transition-all duration-500 cursor-pointer">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 font-label group-hover:text-on-tertiary/80">Pending Tasks</p>
              <h4 className="text-4xl font-black font-manrope mt-2">--</h4>
            </div>
            <div className="bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/10 shadow-sm group hover:bg-secondary hover:text-on-secondary transition-all duration-500 cursor-pointer">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 font-label group-hover:text-on-secondary/80">Average Grade</p>
              <h4 className="text-4xl font-black font-manrope mt-2">--</h4>
            </div>
          </div>

          {/* Upcoming Sessions Section */}
          <section>
            <div className="flex justify-between items-end mb-8 px-2">
              <div>
                <h3 className="text-3xl font-black font-headline text-on-surface">Upcoming Sessions</h3>
                <p className="text-sm font-medium text-on-surface-variant font-body">Don't miss your next curriculum milestones</p>
              </div>
              <button className="px-6 py-2 bg-surface-container-high text-primary rounded-xl font-bold text-xs font-label uppercase tracking-widest hover:brightness-95 transition-all">View All</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {sessions.length > 0 ? sessions.map((session) => (
                <div key={session._id} className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">event</span>
                  </div>
                  <h4 className="text-lg font-black font-manrope text-on-surface leading-tight">{session.title}</h4>
                  <p className="text-xs font-medium text-on-surface-variant mt-2 font-body">
                    {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.location}
                  </p>
                  <div className="mt-6 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest border-2 border-surface-container-lowest overflow-hidden flex items-center justify-center">
                       <span className="material-symbols-outlined text-xs">person</span>
                    </div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label">
                      {session.instructor?.firstName} {session.instructor?.lastName}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="col-span-3 py-10 text-center text-on-surface-variant opacity-40 font-bold uppercase tracking-widest border-2 border-dashed border-outline-variant/10 rounded-3xl">
                  No upcoming sessions found
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Action Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-sm">
            <h3 className="text-xl font-black font-headline text-on-surface mb-6">Recent Activity</h3>
            <div className="space-y-8">
              {/* Activity placeholders for now */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div>
                   <p className="text-sm font-bold text-on-surface font-body">Resources Updated</p>
                   <p className="text-xs text-on-surface-variant font-medium mt-1">New modules added to Web Development</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined">notifications</span>
                </div>
                <div>
                   <p className="text-sm font-bold text-on-surface font-body">System Update</p>
                   <p className="text-xs text-on-surface-variant font-medium mt-1">CSEC ASTU portal migration completed</p>
                </div>
              </div>
            </div>
            <button className="w-full mt-8 py-3 bg-surface-container-highest text-on-surface-variant rounded-xl font-bold text-xs font-label uppercase tracking-widest hover:brightness-95 transition-all">
              Full Feed
            </button>
          </div>

          <div className="bg-secondary p-8 rounded-[2.5rem] text-on-secondary shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-20 scale-150 group-hover:scale-125 transition-transform">
               <span className="material-symbols-outlined text-[100px]">military_tech</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 font-label">Achievement Tracking</p>
            <h3 className="text-2xl font-black font-headline mt-4">Candidate for Technical Distinction</h3>
            <p className="mt-6 text-sm font-medium opacity-90 font-body leading-relaxed">
              Your current profile ranks in the top 5% of this division. Maintain consistency to unlock Honours status.
            </p>
            <button className="mt-8 px-6 py-2 bg-surface-container-lowest text-secondary rounded-xl font-bold text-xs font-label uppercase tracking-widest shadow-lg">View Mastery</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StudentDashboard;
