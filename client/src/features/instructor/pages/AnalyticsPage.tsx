import React from 'react';
import { useBootcampStore } from '@/src/store/useBootcampStore';

const AnalyticsPage = () => {
  const { students, sessions, assignments } = useBootcampStore();
  const attendance = sessions.length
    ? `${Math.round(sessions.reduce((total, session) => total + session.attendanceRate, 0) / sessions.length)}%`
    : '0%';

  const cards = [
    { label: 'Average Attendance', value: attendance },
    { label: 'Learners Active', value: String(students.length) },
    { label: 'Assignments Running', value: String(assignments.filter((item) => item.status === 'active').length) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#2563EB]">Analytics</p>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Bootcamp Insights</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">Use this space for read-only trends, cohort health, and feedback rollups before drilling deeper later.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-black text-[#1E3A8A]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Insights Feed</h2>
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-[#DBEAFE]/40 p-4 text-sm text-slate-600">Attendance holds steady across the current session cadence.</div>
          <div className="rounded-2xl bg-[#DBEAFE]/40 p-4 text-sm text-slate-600">Assignment load is concentrated in active backend and frontend tracks.</div>
          <div className="rounded-2xl bg-[#DBEAFE]/40 p-4 text-sm text-slate-600">Helpers can use this page as read-only context before supporting delivery.</div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
