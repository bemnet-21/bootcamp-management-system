import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/src/store/useAuthStore';
import { studentService, Session } from '@/src/api/studentService';
import { toast } from 'sonner';

const StudentSessions = () => {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendancePercent, setAttendancePercent] = useState<string>('0%');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionsData = async () => {
      try {
        setLoading(true);
        const divisionId = user?.divisions?.[0];
        const fetchedSessions = await studentService.getSessions(divisionId);
        setSessions(fetchedSessions);

        if (fetchedSessions.length > 0 && (fetchedSessions[0] as any).bootcamp) {
          const stats = await studentService.getAttendanceStats((fetchedSessions[0] as any).bootcamp);
          setAttendancePercent(stats);
        }
      } catch (error) {
        console.error('Sessions fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchSessionsData();
  }, [user]);

  // Group sessions by date
  const groupedSessions = sessions.reduce((acc: Record<string, Session[]>, session) => {
    const date = new Date(session.startTime).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {});

  if (loading) return <div className="p-20 text-center font-bold">Loading schedule...</div>;

  return (
    <div className="space-y-12 pb-12">
      <section className="space-y-2">
        <h2 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">Academic Schedule</h2>
        <p className="text-on-surface-variant max-w-2xl font-body">Manage your sessions and curriculum participation. Track your compliance with the academic roadmap.</p>
      </section>

      {Object.entries(groupedSessions).length > 0 ? Object.entries(groupedSessions).map(([date, dateSessions]) => (
        <section key={date} className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold font-headline">{date}</h3>
            <div className="flex-1 h-[2px] bg-surface-container"></div>
          </div>

          {dateSessions.map((session) => (
            <div key={session._id} className="group relative bg-surface-container-low rounded-3xl p-6 transition-all hover:translate-y-[-4px] border border-outline-variant/10 shadow-sm">
              <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-2xl font-bold text-primary font-headline">{session.title}</h4>
                    <p className="text-sm text-on-surface-variant font-medium font-body">{session.description || 'No description available'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-secondary font-medium">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant font-medium">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      {session.location}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-4 self-stretch md:self-auto">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider font-label ${new Date(session.startTime) > new Date() ? 'bg-secondary-fixed text-on-secondary-fixed-variant' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                    {new Date(session.startTime) > new Date() ? 'Upcoming' : 'Completed'}
                  </span>
                  <button className="bg-surface-container-high text-on-secondary-container px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-surface-dim transition-all flex items-center gap-2 font-label uppercase tracking-widest whitespace-nowrap">
                    <span className="material-symbols-outlined text-lg">description</span>
                    View Materials
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      )) : (
        <div className="py-20 text-center text-on-surface-variant opacity-40 font-bold uppercase tracking-widest border-2 border-dashed border-outline-variant/10 rounded-3xl">
          No sessions scheduled for your division
        </div>
      )}

      {/* Attendance Overview Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
        <div className="md:col-span-2 bg-surface-container-low border border-outline-variant/30 rounded-3xl p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-primary rounded-full"></div>
              <h3 className="text-2xl font-extrabold tracking-tight font-headline">Compliance Metrics</h3>
            </div>
            <p className="text-on-surface-variant max-w-lg leading-relaxed font-body">
              Your engagement frequency is tracked automatically via session participation logs. Maintain high attendance to ensure curriculum success.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12">
            <div className="space-y-2">
              <p className="text-xs uppercase font-bold text-on-surface-variant/60 tracking-widest font-label">Overall Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-primary font-headline">{attendancePercent}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-8 flex flex-col justify-center items-center text-center space-y-4 shadow-sm">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle className="text-surface-container-highest" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
              <circle className="text-primary transition-all duration-1000" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - parseFloat(attendancePercent)/100)} strokeLinecap="round" strokeWidth="8"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold font-headline">{attendancePercent}</span>
              <span className="text-[10px] uppercase font-bold opacity-50 font-label">Rate</span>
            </div>
          </div>
          <p className="font-bold text-on-surface font-headline">Technical Discipline</p>
        </div>
      </section>
    </div>
  );
};

export default StudentSessions;
