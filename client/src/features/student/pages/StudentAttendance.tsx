import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/src/store/useAuthStore';
import { studentService, AttendanceRecord } from '@/src/api/studentService';
import { toast } from 'sonner';

const StudentAttendance = () => {
  const { user } = useAuthStore();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [attendancePercent, setAttendancePercent] = useState<string>('0%');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const divisionId = user?.divisions?.[0];
        const sessions = await studentService.getSessions(divisionId);
        
        if (sessions.length > 0 && (sessions[0] as any).bootcamp) {
          const bootcampId = (sessions[0] as any).bootcamp;
          const [fetchedRecords, stats] = await Promise.all([
            studentService.getAttendance(bootcampId),
            studentService.getAttendanceStats(bootcampId)
          ]);
          setRecords(fetchedRecords);
          setAttendancePercent(stats);
        }
      } catch (error) {
        console.error('Attendance fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchAttendanceData();
  }, [user]);

  if (loading) return <div className="p-20 text-center font-bold">Calculating participation metrics...</div>;

  const presentCount = records.filter(r => r.status === 'Present').length;
  const absenceRate = (100 - parseFloat(attendancePercent)).toFixed(1) + '%';

  return (
    <div className="pb-12">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary mb-2 block font-label">Participation Hub</span>
          <h2 className="font-headline font-extrabold text-4xl text-on-surface tracking-tight">Attendance</h2>
          <p className="text-on-surface-variant font-medium mt-1 font-body">Track your session participation and punctuality across the curriculum.</p>
        </div>
      </section>

      {/* Bento Summary Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {/* Progress Card */}
        <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-3xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between shadow-sm border border-outline-variant/10">
          <div className="z-10 text-center sm:text-left">
            <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-4 font-label">Overall Performance</p>
            <h3 className="text-3xl font-headline font-black text-on-surface mb-2">{attendancePercent} Score</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-[200px] font-body">Your consistency is key to technical mastery. Keep up the precision.</p>
          </div>
          <div className="relative w-40 h-40 flex items-center justify-center mt-6 sm:mt-0">
             <div className="bg-surface-container-lowest w-full h-full rounded-full flex items-center justify-center z-10 shadow-inner border-8 border-primary/20">
                <span className="text-2xl font-headline font-black text-primary">{attendancePercent}</span>
             </div>
          </div>
        </div>

        {/* Metric Stats */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface-container p-6 rounded-3xl flex justify-between items-center h-full border border-outline-variant/5 shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-label">Total Logs</p>
              <p className="text-4xl font-headline font-black text-on-surface mt-1">{records.length}</p>
            </div>
            <div className="w-12 h-12 bg-surface-container-highest rounded-2xl flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
          </div>
          <div className="bg-surface-container p-6 rounded-3xl flex justify-between items-center h-full border border-outline-variant/5 shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-label">Present</p>
              <p className="text-4xl font-headline font-black text-on-surface mt-1">{presentCount}</p>
            </div>
            <div className="w-12 h-12 bg-surface-container-highest rounded-2xl flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined">person_check</span>
            </div>
          </div>
        </div>

        {/* Absence Rate */}
        <div className="bg-surface-container-high p-8 rounded-3xl flex flex-col justify-between border-l-4 border-tertiary shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-tertiary uppercase tracking-widest font-label">Absence Rate</p>
            <p className="text-5xl font-headline font-black text-tertiary mt-2">{absenceRate}</p>
          </div>
          <div className="mt-4">
            <div className="w-full bg-surface-dim h-1.5 rounded-full overflow-hidden">
              <div className="bg-tertiary h-full transition-all duration-1000" style={{ width: absenceRate }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Records Section */}
      <section className="bg-surface-container-lowest rounded-3xl shadow-sm p-8 border border-outline-variant/10">
        <h4 className="font-headline font-bold text-xl mb-8">Participation History</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.15em] text-on-surface-variant font-bold font-label">
                <th className="px-6 py-3">Session Topic</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Schedule</th>
                <th className="px-6 py-3 text-right pr-10">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium font-body">
              {records.length > 0 ? records.map((rec, i) => (
                <tr key={i} className="bg-surface-container-low hover:bg-surface-container transition-colors group cursor-pointer border border-outline-variant/5">
                  <td className="px-6 py-5 rounded-l-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary shrink-0 shadow-sm group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        <span className="material-symbols-outlined text-sm">event</span>
                      </div>
                      <p className="font-headline font-bold text-on-surface">{rec.sessionTitle}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-on-surface-variant">
                    {new Date(rec.sessionStart).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5 text-on-surface-variant">
                    {new Date(rec.sessionStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-5 rounded-r-2xl text-right pr-8">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-label ${
                      rec.status === 'Present' ? 'bg-secondary-container/20 text-on-secondary-container' : 
                      rec.status === 'Late' ? 'bg-secondary-fixed text-on-secondary-fixed-variant' : 
                      'bg-error-container text-on-error-container'
                    }`}>
                      {rec.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={4} className="py-20 text-center opacity-40 font-bold uppercase tracking-widest">No attendance records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default StudentAttendance;
