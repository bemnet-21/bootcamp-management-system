import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import { useUIStore } from '@/src/store/useUIStore';
import PermissionWrapper from '@/src/components/dashboard/instructor/PermissionWrapper';

const StudentProfilePage = () => {
  const { studentId } = useParams();
  const { students, sessions, assignments } = useBootcampStore();
  const { openModal } = useUIStore();
  const student = students.find((entry) => entry.id === studentId);

  if (!student) {
    return (
      <div className="space-y-4">
        <Link to="/portal/students" className="text-sm font-semibold text-[#2563EB]">Back to students</Link>
        <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-8 text-sm text-slate-500">Student profile not found.</div>
      </div>
    );
  }

  const averageAttendance = sessions.length
    ? `${Math.round(sessions.reduce((total, session) => total + session.attendanceRate, 0) / sessions.length)}%`
    : '0%';
  const activeAssignments = assignments.filter((assignment) => assignment.bootcampId === student.bootcampId).length;

  return (
    <div className="space-y-6">
      <Link to="/portal/students" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB]">
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back to students
      </Link>

      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#2563EB]">Student Profile</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{student.name}</h1>
            <p className="mt-2 text-sm text-slate-500">Bootcamp lane: {student.bootcampId}</p>
          </div>
          <div className="flex gap-3">
            <PermissionWrapper permission="add_student">
              <button
                type="button"
                onClick={() => openModal(`moveStudent:${student.id}`)}
                className="rounded-xl border border-blue-200 px-4 py-3 text-sm font-semibold text-[#1E3A8A] transition hover:bg-[#DBEAFE]"
              >
                Move Group
              </button>
            </PermissionWrapper>
            <PermissionWrapper permission="add_student">
              <button
                type="button"
                onClick={() => openModal(`removeStudent:${student.id}`)}
                className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Remove Student
              </button>
            </PermissionWrapper>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Attendance %</p>
          <p className="mt-3 text-3xl font-black text-[#1E3A8A]">{averageAttendance}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Grades</p>
          <p className="mt-3 text-3xl font-black text-[#1E3A8A]">B+</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Assignments</p>
          <p className="mt-3 text-3xl font-black text-[#1E3A8A]">{activeAssignments}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
