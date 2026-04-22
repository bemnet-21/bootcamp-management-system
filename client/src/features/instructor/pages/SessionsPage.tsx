import React from 'react';
import { Link } from 'react-router-dom';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import { useUIStore } from '@/src/store/useUIStore';
import PermissionWrapper from '@/src/components/dashboard/instructor/PermissionWrapper';

const SessionsPage = () => {
  const { sessions } = useBootcampStore();
  const { openModal } = useUIStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#2563EB]">Sessions</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Delivery Schedule</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Keep upcoming sessions tight, then jump into detail views for attendance and feedback work.</p>
        </div>
        <PermissionWrapper permission="create_session">
          <button
            type="button"
            onClick={() => openModal('createSession')}
            className="rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3A8A]"
          >
            Create Session
          </button>
        </PermissionWrapper>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <Link
            key={session.id}
            to={`/portal/sessions/${session.id}`}
            className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:border-blue-200 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-lg font-bold text-slate-900">{session.title}</p>
              <p className="mt-1 text-sm text-slate-500">
                {new Date(session.date).toLocaleDateString()} at {session.time} • {session.location}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#1E3A8A]">
                {session.status}
              </span>
              <span className="text-sm font-semibold text-[#2563EB]">Open detail</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SessionsPage;
