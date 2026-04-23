import React, { useState } from 'react';
import Modal from '@/src/components/ui/Modal';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { canPerform } from '@/src/lib/permissions';

type ConfirmTone = 'primary' | 'danger';
type ActionType = 'removeStudent' | 'deleteResource';

type ConfirmModalProps = {
  title: string;
  description?: string;
  confirmLabel: string;
  tone?: ConfirmTone;
  actionType: ActionType;
  modalId: string | null;
  onClose: () => void;
  afterConfirm?: () => void;
};

const ConfirmModal = ({
  title,
  description,
  confirmLabel,
  tone = 'primary',
  actionType,
  modalId,
  onClose,
  afterConfirm,
}: ConfirmModalProps) => {
  const { removeStudent, removeResource } = useBootcampStore();
  const { role, permissions } = useAuthStore();
  const requiredPermission = actionType === 'removeStudent' ? 'add_student' : 'upload_resource';
  const allowed = canPerform({ role, permissions }, requiredPermission);
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    if (!modalId) return;
    if (!allowed) return;
    setBusy(true);
    try {
      if (actionType === 'removeStudent') {
        removeStudent(modalId);
      }
      if (actionType === 'deleteResource') {
        removeResource(modalId);
      }
      afterConfirm?.();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const confirmClass =
    tone === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700'
      : 'bg-[#2563EB] text-white hover:bg-[#1E3A8A]';

  return (
    <Modal
      open
      title={title}
      description={description}
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
            onClick={handleConfirm}
            disabled={busy || !modalId || !allowed}
            className={`rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmClass}`}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      }
    >
      <div className="rounded-2xl border border-blue-100 bg-[#DBEAFE]/30 p-5 text-sm text-slate-600">
        {allowed ? 'Confirm to continue.' : `You do not have permission (${requiredPermission}).`}
      </div>
    </Modal>
  );
};

export default ConfirmModal;
