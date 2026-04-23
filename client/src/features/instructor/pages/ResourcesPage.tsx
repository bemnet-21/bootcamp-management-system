import React from 'react';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import { useUIStore } from '@/src/store/useUIStore';
import PermissionWrapper from '@/src/components/dashboard/instructor/PermissionWrapper';

const ResourcesPage = () => {
  const { resources } = useBootcampStore();
  const { openModal } = useUIStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#2563EB]">Resources</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Resource Library</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Keep materials close to delivery. Upload stays modal-first later; the page stays focused on browsing and quick actions.</p>
        </div>
        <PermissionWrapper permission="upload_resource">
          <button
            type="button"
            onClick={() => openModal('uploadResource')}
            className="rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3A8A]"
          >
            Upload Resource
          </button>
        </PermissionWrapper>
      </div>

      <div className="space-y-4">
        {resources.length ? resources.map((resource) => (
          <div key={resource.id} className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-slate-900">{resource.title}</p>
              <p className="mt-1 text-sm text-slate-500">
                {resource.kind} • {new Date(resource.createdAt).toLocaleDateString()}
              </p>
              {resource.description ? <p className="mt-2 text-sm text-slate-500">{resource.description}</p> : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-blue-200 px-4 py-3 text-sm font-semibold text-[#1E3A8A] transition hover:bg-[#DBEAFE]"
              >
                {resource.kind === 'Link' ? 'Open' : 'Download'}
              </a>
              <PermissionWrapper permission="upload_resource">
                <button
                  type="button"
                  onClick={() => openModal(`deleteResource:${resource.id}`)}
                  className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Delete
                </button>
              </PermissionWrapper>
            </div>
          </div>
        )) : (
          <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-8 text-sm text-slate-500">
            No resources uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;
