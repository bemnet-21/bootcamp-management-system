import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import { useUIStore } from '@/src/store/useUIStore';
import PermissionWrapper from '@/src/components/dashboard/instructor/PermissionWrapper';

const AssignmentDetailPage = () => {
  const { assignmentId } = useParams();
  const { assignments, students } = useBootcampStore();
  const { openModal } = useUIStore();
  const assignment = assignments.find((entry) => entry.id === assignmentId);

  if (!assignment) {
    return (
      <div className="space-y-4">
        <Link to="/portal/assignments" className="text-sm font-semibold text-[#2563EB]">Back to assignments</Link>
        <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-8 text-sm text-slate-500">Assignment not found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/portal/assignments" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB]">
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back to assignments
      </Link>

      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#2563EB]">Assignment Detail</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{assignment.title}</h1>
        <p className="mt-2 text-sm text-slate-500">Due {new Date(assignment.dueDate).toLocaleDateString()} • Status: {assignment.status}</p>
      </section>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Submission Queue</h2>
            <p className="mt-1 text-sm text-slate-500">Click a learner later to open a grading side panel when that flow is implemented.</p>
          </div>
          <PermissionWrapper permission="grade_assignments">
            <button
              type="button"
              onClick={() => openModal(`grading:${assignment.id}`)}
              className="rounded-xl border border-blue-200 px-4 py-3 text-sm font-semibold text-[#1E3A8A] transition hover:bg-[#DBEAFE]"
            >
              Open grading panel
            </button>
          </PermissionWrapper>
        </div>
        <div className="mt-6 space-y-3">
          {students.map((student) => (
            <div key={student.id} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
              <div>
                <p className="font-semibold text-slate-900">{student.name}</p>
                <p className="text-sm text-slate-500">Submission pending review</p>
              </div>
              <span className="text-sm font-semibold text-[#2563EB]">Grade</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailPage;
