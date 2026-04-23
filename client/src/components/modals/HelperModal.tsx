import React, { useState } from 'react';
import Modal from '@/src/components/ui/Modal';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { canPerform } from '@/src/lib/permissions';

type Props = { onClose: () => void };
type Role = 'Lead' | 'Helper';

const defaultPermissionsByRole: Record<Role, string[]> = {
  Lead: ['create_session', 'mark_attendance', 'add_student', 'upload_resource'],
  Helper: ['upload_resource'],
};

const HelperModal = ({ onClose }: Props) => {
  const { addHelper } = useBootcampStore();
  const { role: authRole, permissions } = useAuthStore();
  const allowed = canPerform({ role: authRole, permissions }, 'manage_groups');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [helperRole, setHelperRole] = useState<Role>('Helper');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!allowed) return setError('You do not have permission to manage helpers.');
    if (!name.trim()) return setError('Name is required.');
    if (!email.trim()) return setError('Email is required.');
    setBusy(true);
    try {
      addHelper({
        name: name.trim(),
        email: email.trim(),
        role: helperRole,
        permissions: defaultPermissionsByRole[helperRole],
      });
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
          This action requires `manage_groups` and a lead instructor role.
        </div>
      </Modal>
    ) : (
    <Modal
      open
      title="Add Helper"
      description="Invite a helper and assign an initial role."
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
            form="helper-form"
            disabled={busy}
            className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Saving…' : 'Add Helper'}
          </button>
        </div>
      }
    >
      <form id="helper-form" onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#2563EB]"
              placeholder="Helper name"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#2563EB]"
              placeholder="helper@email.com"
            />
          </label>
        </div>

        <label className="space-y-2 block">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Role</span>
          <select
            value={helperRole}
            onChange={(e) => setHelperRole(e.target.value as Role)}
            className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#2563EB]"
          >
            <option value="Lead">Lead</option>
            <option value="Helper">Helper</option>
          </select>
          <p className="mt-2 text-xs text-slate-500">
            Initial permissions: <span className="font-semibold text-slate-700">{defaultPermissionsByRole[helperRole].join(', ')}</span>
          </p>
        </label>
      </form>
    </Modal>
    )
  );
};

export default HelperModal;
