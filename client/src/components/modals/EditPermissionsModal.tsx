import React, { useMemo, useState } from 'react';
import Modal from '@/src/components/ui/Modal';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { canPerform } from '@/src/lib/permissions';

type Props = {
  helperId: string | null;
  onClose: () => void;
};

const permissionOptions = [
  { key: 'create_session', label: 'Create Session' },
  { key: 'mark_attendance', label: 'Mark Attendance' },
  { key: 'add_student', label: 'Add Students' },
  { key: 'upload_resource', label: 'Upload Resources' },
];

const EditPermissionsModal = ({ helperId, onClose }: Props) => {
  const { helpers, updateHelperPermissions, removeHelper } = useBootcampStore();
  const { role, permissions: authPermissions } = useAuthStore();
  const allowed = canPerform({ role, permissions: authPermissions }, 'manage_groups');
  const helper = useMemo(() => helpers.find((h) => h.id === helperId), [helpers, helperId]);
  const [permissions, setPermissions] = useState<string[]>(helper?.permissions ?? []);
  const [busy, setBusy] = useState(false);

  const toggle = (key: string) => {
    setPermissions((current) => (current.includes(key) ? current.filter((p) => p !== key) : [...current, key]));
  };

  const handleSave = async () => {
    if (!helperId) return;
    if (!allowed) return;
    setBusy(true);
    try {
      updateHelperPermissions(helperId, permissions);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (!helperId) return;
    if (!allowed) return;
    setBusy(true);
    try {
      removeHelper(helperId);
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
      title="Edit Permissions"
      description={helper ? `Manage access for ${helper.name}.` : 'Select a helper to edit.'}
      onClose={busy ? () => undefined : onClose}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:items-center">
          <button
            type="button"
            onClick={handleRemove}
            disabled={busy || !helperId}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Remove Helper
          </button>
          <div className="flex gap-3 sm:justify-end">
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
              onClick={handleSave}
              disabled={busy || !helperId}
              className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Save Permissions'}
            </button>
          </div>
        </div>
      }
    >
      {!helper ? (
        <div className="rounded-2xl border border-dashed border-blue-200 bg-[#DBEAFE]/20 p-6 text-sm text-slate-600">
          Helper not found.
        </div>
      ) : (
        <div className="space-y-3">
          {permissionOptions.map((option) => {
            const checked = permissions.includes(option.key);
            return (
              <label
                key={option.key}
                className="flex cursor-pointer items-center justify-between rounded-2xl border border-blue-100 bg-white px-4 py-4 transition hover:bg-[#F8FBFF]"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{option.key}</p>
                </div>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(option.key)}
                  className="h-4 w-4 accent-[#2563EB]"
                />
              </label>
            );
          })}
        </div>
      )}
    </Modal>
    )
  );
};

export default EditPermissionsModal;
