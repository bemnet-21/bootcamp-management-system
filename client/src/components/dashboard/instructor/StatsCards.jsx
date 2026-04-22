import React from 'react';
import { Link } from 'react-router-dom';
import { useBootcampStore } from '@/src/store/useBootcampStore';

const StatsCards = () => {
  const { students, sessions, assignments } = useBootcampStore();

  const totalStudents = students.length;
  const attendancePercent = sessions.length
    ? `${Math.round(sessions.reduce((total, session) => total + session.attendanceRate, 0) / sessions.length)}%`
    : '0%';
  const activeAssignments = assignments.filter((assignment) => assignment.status === 'active').length;

  const stats = [
    { label: 'Total Students', value: totalStudents, href: '/portal/students' },
    { label: 'Attendance %', value: attendancePercent, href: '/portal/attendance' },
    { label: 'Active Assignments', value: activeAssignments, href: '/portal/assignments' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Link key={stat.label} to={stat.href} className="rounded-xl bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm font-medium text-slate-500">{stat.label}</p>
          <p className="mt-3 text-3xl font-bold text-[#1E3A8A]">{stat.value}</p>
        </Link>
      ))}
    </div>
  );
};

export default StatsCards;
