import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import { useUIStore } from '@/src/store/useUIStore';
import PermissionWrapper from '@/src/components/dashboard/instructor/PermissionWrapper';

const SessionDetailPage = () => {
  const { sessionId } = useParams();
  const { sessions, students } = useBootcampStore();
  const { openModal } = useUIStore();
  const session = sessions.find((entry) => entry.id === sessionId);

  if (!session) {
    return (
      <div className="space-y-4">
        <Link to="/portal/sessions" className="text-sm font-semibold text-[#2563EB]">Back to sessions</Link>
        <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-8 text-sm text-slate-500">Session not found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/portal/sessions" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB]">
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back to sessions
      </Link>

      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#2563EB]">Session Detail</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{session.title}</h1>
            <p className="mt-2 text-sm text-slate-500">
              {new Date(session.date).toLocaleDateString()} at {session.time} • {session.location}
            </p>
          </div>
          <PermissionWrapper permission="create_session">
            <button
              type="button"
              onClick={() => openModal(`editSession:${session.id}`)}
              className="rounded-xl border border-blue-200 px-4 py-3 text-sm font-semibold text-[#1E3A8A] transition hover:bg-[#DBEAFE]"
            >
              Edit Session
            </button>
          </PermissionWrapper>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Attendance</p>
          <p className="mt-3 text-3xl font-black text-[#1E3A8A]">{session.attendanceRate}%</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Students to Mark</p>
          <p className="mt-3 text-3xl font-black text-[#1E3A8A]">{students.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Feedback</p>
          <p className="mt-3 text-3xl font-black text-[#1E3A8A]">4.8</p>
        </div>
      </div>
    </div>
  );
};

export default SessionDetailPage;
