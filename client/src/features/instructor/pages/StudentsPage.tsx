import React from 'react';
import { Link } from 'react-router-dom';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import { useUIStore } from '@/src/store/useUIStore';
import PermissionWrapper from '@/src/components/dashboard/instructor/PermissionWrapper';

const StudentsPage = () => {
  const { students } = useBootcampStore();
  const { openModal } = useUIStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#2563EB]">Students</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Cohort Roster</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Open any learner profile to review attendance, grading context, and intervention notes.</p>
        </div>
        <PermissionWrapper permission="add_student">
          <button
            type="button"
            onClick={() => openModal('addStudents')}
            className="rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3A8A]"
          >
            Add Students
          </button>
        </PermissionWrapper>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {students.map((student, index) => (
          <Link
            key={student.id}
            to={`/portal/students/${student.id}`}
            className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DBEAFE] text-[#1E3A8A]">
                <span className="material-symbols-outlined">person</span>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Student {index + 1}</span>
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">{student.name}</h2>
            <p className="mt-1 text-sm text-slate-500">Bootcamp: {student.bootcampId}</p>
            <p className="mt-4 text-sm font-semibold text-[#2563EB]">Open profile</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StudentsPage;
