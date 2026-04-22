import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import PermissionWrapper from '@/src/components/dashboard/instructor/PermissionWrapper';

const UpcomingSessions = () => {
  const { sessions, bootcamps } = useBootcampStore();
  const navigate = useNavigate();
  const upcomingSessions = [...sessions]
    .filter((session) => session.status === 'upcoming')
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())
    .slice(0, 4);

  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1E3A8A]">Upcoming Sessions</h2>
          <p className="mt-1 text-sm text-slate-500">Next delivery checkpoints across your active bootcamps.</p>
        </div>
        <div className="rounded-full bg-[#DBEAFE] px-3 py-1 text-xs font-semibold text-[#1E3A8A]">
          {bootcamps.filter((bootcamp) => bootcamp.status === 'active').length} active bootcamps
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {upcomingSessions.length > 0 ? upcomingSessions.map((session) => (
          <Link key={session.id} to={`/portal/sessions/${session.id}`} className="block rounded-xl border border-blue-100 bg-[#DBEAFE]/35 p-4 transition hover:border-blue-200 hover:bg-[#DBEAFE]/55">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-base font-semibold text-slate-900">{session.title}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {new Date(session.date).toLocaleDateString()} at {session.time} • {session.location}
                </p>
              </div>
              <PermissionWrapper permission="mark_attendance">
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(`/portal/attendance?sessionId=${session.id}`);
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Mark Attendance
                </button>
              </PermissionWrapper>
            </div>
          </Link>
        )) : (
          <div className="rounded-xl border border-dashed border-blue-200 bg-[#DBEAFE]/20 p-6 text-sm text-slate-500">
            No upcoming sessions are scheduled yet.
          </div>
        )}
      </div>
    </section>
  );
};

export default UpcomingSessions;
