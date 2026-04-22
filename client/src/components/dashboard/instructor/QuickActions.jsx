import React from 'react';
import PermissionWrapper from '@/src/components/dashboard/instructor/PermissionWrapper';
import { useUIStore } from '@/src/store/useUIStore';

const actions = [
  { label: 'Create Session', permission: 'create_session', modal: 'createSession' },
  { label: 'Add Students', permission: 'add_student', modal: 'addStudents' },
  { label: 'Upload Resource', permission: 'upload_resource', modal: 'uploadResource' },
];

const QuickActions = () => {
  const { openModal } = useUIStore();
  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-xl font-bold text-[#1E3A8A]">Quick Actions</h2>
      <p className="mt-1 text-sm text-slate-500">Lead instructors get full access. Helpers only see actions allowed by their permissions.</p>
      <div className="mt-4 space-y-3">
        {actions.map((action) => (
          <PermissionWrapper key={action.label} permission={action.permission}>
            <button
              type="button"
              onClick={() => openModal(action.modal)}
              className="flex w-full items-center justify-between rounded-xl bg-blue-600 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <span className="inline-flex items-center gap-2">{action.label}</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </PermissionWrapper>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
