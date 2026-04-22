import React from 'react';
import { useInstructorAccess } from '@/src/components/dashboard/instructor/PermissionWrapper';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import { useUIStore } from '@/src/store/useUIStore';
import PermissionWrapper from '@/src/components/dashboard/instructor/PermissionWrapper';

const templates = [
  { name: 'Session Support', permissions: 'mark_attendance, upload_resource' },
  { name: 'Content Ops', permissions: 'upload_resource' },
  { name: 'Delivery Assistant', permissions: 'mark_attendance, add_student, upload_resource' },
];

const TeamPage = () => {
  const { instructorRole, permissions } = useInstructorAccess();
  const isLead = instructorRole === 'lead_instructor';
  const { helpers } = useBootcampStore();
  const { openModal } = useUIStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#2563EB]">Team</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Helper Management</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Lead instructors own invitations and granular permissions. Helpers can still view how the workspace is structured.</p>
        </div>
        <PermissionWrapper permission="manage_groups">
          {isLead ? (
            <button
              type="button"
              onClick={() => openModal('addHelper')}
              className="rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3A8A]"
            >
              Add Helper
            </button>
          ) : null}
        </PermissionWrapper>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Current Access</h2>
        <p className="mt-2 text-sm text-slate-500">Your active permission set: {permissions.join(', ') || 'read-only'}</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Team Roster</h2>
            <p className="mt-2 text-sm text-slate-500">Manage helper access and keep responsibilities clear.</p>
          </div>
          <PermissionWrapper permission="manage_groups">
            {isLead ? (
              <button
                type="button"
                onClick={() => openModal('addHelper')}
                className="rounded-xl border border-blue-200 px-4 py-3 text-sm font-semibold text-[#1E3A8A] transition hover:bg-[#DBEAFE]"
              >
                Add Helper
              </button>
            ) : null}
          </PermissionWrapper>
        </div>

        <div className="mt-6 space-y-3">
          {helpers.length ? (
            helpers.map((helper) => (
              <div
                key={helper.id}
                className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-[#F8FBFF] px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{helper.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{helper.email} • {helper.role}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Permissions: <span className="font-semibold text-slate-700">{helper.permissions.join(', ') || 'none'}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <PermissionWrapper permission="manage_groups">
                    {isLead ? (
                      <button
                        type="button"
                        onClick={() => openModal(`editPermissions:${helper.id}`)}
                        className="rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3A8A]"
                      >
                        Edit Permissions
                      </button>
                    ) : null}
                  </PermissionWrapper>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-6 text-sm text-slate-500">
              No helpers added yet.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Permission Templates</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {templates.map((template) => (
            <div key={template.name} className="rounded-2xl border border-blue-100 bg-[#F8FBFF] p-4">
              <p className="font-semibold text-slate-900">{template.name}</p>
              <p className="mt-2 text-sm text-slate-500">{template.permissions}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
