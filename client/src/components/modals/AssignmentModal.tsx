import React, { useMemo, useState } from 'react';
import Modal from '@/src/components/ui/Modal';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { canPerform } from '@/src/lib/permissions';

type Props = {
  onClose: () => void;
  mode?: 'create' | 'grade';
  assignmentId?: string | null;
};

const AssignmentModal = ({ onClose, mode = 'create', assignmentId }: Props) => {
  const { bootcamps, assignments, addAssignment } = useBootcampStore();
  const { role, permissions } = useAuthStore();
  const allowedCreate = canPerform({ role, permissions }, 'manage_groups');
  const allowedGrade = canPerform({ role, permissions }, 'grade_assignments');
  const assignment = useMemo(
    () => (assignmentId ? assignments.find((a) => a.id === assignmentId) : undefined),
    [assignmentId, assignments]
  );

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<'active' | 'review' | 'completed'>('active');
  const [bootcampId, setBootcampId] = useState(bootcamps[0]?.id ?? 'fs-react');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!allowedCreate) return setError('You do not have permission to create assignments.');
    if (!title.trim()) return setError('Title is required.');
    setBusy(true);
    try {
      addAssignment({ title: title.trim(), dueDate, status, bootcampId });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  if (mode === 'grade') {
    if (!allowedGrade) {
      return (
        <Modal
          open
          title="Not Allowed"
          description="Your role does not have access to this action."
          onClose={onClose}
          footer={
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3A8A]"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="rounded-2xl border border-dashed border-blue-200 bg-[#DBEAFE]/20 p-6 text-sm text-slate-600">
            Ask a lead instructor for access to `grade_assignments`.
          </div>
        </Modal>
      );
    }
    return (
      <Modal
        open
        title="Grading Panel"
        description={assignment ? `Grade submissions for: ${assignment.title}` : 'Grade submissions'}
        onClose={onClose}
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3A8A]"
            >
              Done
            </button>
          </div>
        }
      >
        <div className="rounded-2xl border border-blue-100 bg-[#DBEAFE]/30 p-6 text-sm text-slate-600">
          Grading UI is stubbed. This modal is wired so the button flow works; next step is connecting actual submissions.
        </div>
      </Modal>
    );
  }

  if (!allowedCreate) {
    return (
      <Modal
        open
        title="Not Allowed"
        description="Your role does not have access to this action."
        onClose={onClose}
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3A8A]"
            >
              Close
            </button>
          </div>
        }
      >
        <div className="rounded-2xl border border-dashed border-blue-200 bg-[#DBEAFE]/20 p-6 text-sm text-slate-600">
          This action requires `manage_groups` (lead instructor).
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open
      title="Create Assignment"
      description="Create a new cohort deliverable and keep the pipeline moving."
      onClose={busy ? () => undefined : onClose}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="assignment-form"
            disabled={busy}
            className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Saving…' : 'Save Assignment'}
          </button>
        </div>
      }
    >
      <form id="assignment-form" onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <label className="space-y-2 block">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#2563EB]"
            placeholder="e.g., REST API Capstone"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 block md:col-span-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Bootcamp</span>
            <select
              value={bootcampId}
              onChange={(e) => setBootcampId(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#2563EB]"
            >
              {bootcamps.map((bootcamp) => (
                <option key={bootcamp.id} value={bootcamp.id}>
                  {bootcamp.name} ({bootcamp.batch})
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 block">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Due Date</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#2563EB]"
            />
          </label>
        </div>

        <label className="space-y-2 block">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#2563EB]"
          >
            <option value="active">Active</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </label>
      </form>
    </Modal>
  );
};

export default AssignmentModal;
