import React from 'react';
import { Link } from 'react-router-dom';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import { useUIStore } from '@/src/store/useUIStore';
import PermissionWrapper from '@/src/components/dashboard/instructor/PermissionWrapper';

const AssignmentsPage = () => {
  const { assignments } = useBootcampStore();
  const { openModal } = useUIStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#2563EB]">Assignments</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Submission Pipeline</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Track active work, move into grading, and keep review loops tight for every cohort sprint.</p>
        </div>
        <PermissionWrapper permission="manage_groups">
          <button
            type="button"
            onClick={() => openModal('createAssignment')}
            className="rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3A8A]"
          >
            Create Assignment
          </button>
        </PermissionWrapper>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {assignments.map((assignment) => (
          <Link
            key={assignment.id}
            to={`/portal/assignments/${assignment.id}`}
            className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#1E3A8A]">
                {assignment.status}
              </span>
              <span className="text-sm font-semibold text-[#2563EB]">Open detail</span>
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">{assignment.title}</h2>
            <p className="mt-2 text-sm text-slate-500">Due {new Date(assignment.dueDate).toLocaleDateString()}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AssignmentsPage;
