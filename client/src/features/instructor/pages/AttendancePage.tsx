import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import { toast } from 'sonner';
import { useInstructorAccess } from '@/src/components/dashboard/instructor/PermissionWrapper';

const AttendancePage = () => {
  const { sessions, students, saveAttendance, getAttendance } = useBootcampStore();
  const { hasPermission } = useInstructorAccess();
  const canMarkAttendance = hasPermission('mark_attendance');
  const [searchParams] = useSearchParams();
  const initialSessionFromQuery = searchParams.get('sessionId') || '';
  const defaultSessionId = initialSessionFromQuery || sessions[0]?.id || '';
  const [selectedSessionId, setSelectedSessionId] = useState(defaultSessionId);

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId) || sessions[0],
    [sessions, selectedSessionId]
  );

  const buildDefaultDraft = () => Object.fromEntries(students.map((student) => [student.id, 'present'])) as Record<string, 'present' | 'absent'>;
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, 'present' | 'absent'>>(buildDefaultDraft());

  useEffect(() => {
    const sessionId = selectedSession?.id;
    if (!sessionId) return;
    const saved = getAttendance(sessionId);
    setAttendanceDraft(saved ? { ...buildDefaultDraft(), ...saved } : buildDefaultDraft());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSessionId, students.length]);

  const handleSave = () => {
    if (!selectedSession?.id) return;
    if (!canMarkAttendance) {
      toast.error('You do not have permission to mark attendance.');
      return;
    }
    saveAttendance(selectedSession.id, attendanceDraft);
    toast.success('Attendance saved.');
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#2563EB]">Attendance</p>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Fast Marking Workflow</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">Stay on one page, choose a session, mark learners, and save without breaking context.</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="w-full max-w-md">
            <label className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Session</label>
            <select
              value={selectedSessionId}
              onChange={(event) => setSelectedSessionId(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#2563EB]"
            >
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.title}
                </option>
              ))}
            </select>
          </div>

          {canMarkAttendance ? (
            <div className="flex gap-3">
              <button
                type="button"
                className="rounded-xl border border-blue-200 px-4 py-3 text-sm font-semibold text-[#1E3A8A] transition hover:bg-[#DBEAFE]"
                onClick={() => setAttendanceDraft(Object.fromEntries(students.map((student) => [student.id, 'present'])))}
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3A8A]"
              >
                Save Attendance
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-blue-100 bg-[#DBEAFE]/30 px-4 py-3 text-sm font-semibold text-[#1E3A8A]">
              Read-only: attendance marking is not permitted.
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl bg-[#F8FBFF] p-4">
          <p className="text-sm font-semibold text-slate-900">{selectedSession?.title || 'No session selected'}</p>
          <p className="mt-1 text-sm text-slate-500">Use quick toggles to mark attendance inline.</p>
        </div>

        <div className="mt-6 space-y-3">
          {students.map((student) => {
            const status = attendanceDraft[student.id] || 'present';

            return (
              <div key={student.id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{student.name}</p>
                  <p className="text-sm text-slate-500">Bootcamp: {student.bootcampId}</p>
                </div>
                {canMarkAttendance ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        status === 'present' ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                      onClick={() => setAttendanceDraft((current) => ({ ...current, [student.id]: 'present' }))}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        status === 'absent' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                      onClick={() => setAttendanceDraft((current) => ({ ...current, [student.id]: 'absent' }))}
                    >
                      Absent
                    </button>
                  </div>
                ) : (
                  <span className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                    status === 'present' ? 'bg-[#DBEAFE] text-[#1E3A8A]' : 'bg-red-50 text-red-700'
                  }`}>
                    {status === 'present' ? 'Present' : 'Absent'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
