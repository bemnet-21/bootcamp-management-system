import React, { useMemo, useState } from 'react';
import Modal from '@/src/components/ui/Modal';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { canPerform } from '@/src/lib/permissions';

type Props = {
  studentId: string | null;
  onClose: () => void;
};

const MoveStudentModal = ({ studentId, onClose }: Props) => {
  const { students, bootcamps, updateStudent } = useBootcampStore();
  const { role, permissions } = useAuthStore();
  const allowed = canPerform({ role, permissions }, 'add_student');
  const student = useMemo(() => students.find((s) => s.id === studentId), [students, studentId]);
  const [bootcampId, setBootcampId] = useState(student?.bootcampId ?? bootcamps[0]?.id ?? 'fs-react');
  const [busy, setBusy] = useState(false);

  const handleMove = async () => {
    if (!studentId) return;
    if (!allowed) return;
    setBusy(true);
    try {
      updateStudent(studentId, { bootcampId });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    !allowed ? (
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
          Ask a lead instructor for access to `add_student`.
        </div>
      </Modal>
    ) : (
    <Modal
      open
      title="Move Student"
      description={student ? `Move ${student.name} to a different bootcamp lane.` : 'Move student to a bootcamp lane.'}
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
            type="button"
            onClick={handleMove}
            disabled={busy || !studentId}
            className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Moving…' : 'Move Student'}
          </button>
        </div>
      }
    >
      {!student ? (
        <div className="rounded-2xl border border-dashed border-blue-200 bg-[#DBEAFE]/20 p-6 text-sm text-slate-600">
          Student not found.
        </div>
      ) : (
        <label className="space-y-2 block">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Target Bootcamp</span>
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
      )}
    </Modal>
    )
  );
};

export default MoveStudentModal;
