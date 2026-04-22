import React, { useState } from 'react';
import Modal from '@/src/components/ui/Modal';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { canPerform } from '@/src/lib/permissions';

type Props = { onClose: () => void };
type Kind = 'File' | 'Link';

const ResourceModal = ({ onClose }: Props) => {
  const { addResource } = useBootcampStore();
  const { role, permissions } = useAuthStore();
  const allowed = canPerform({ role, permissions }, 'upload_resource');
  const [kind, setKind] = useState<Kind>('File');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!allowed) return setError('You do not have permission to upload resources.');
    if (!title.trim()) return setError('Title is required.');

    let resourceUrl = url.trim();
    if (kind === 'File') {
      if (!file) return setError('Select a file to upload.');
      resourceUrl = URL.createObjectURL(file);
    } else {
      if (!resourceUrl) return setError('Paste a link URL.');
      if (!/^https?:\/\//i.test(resourceUrl)) resourceUrl = `https://${resourceUrl}`;
    }

    setBusy(true);
    try {
      addResource({
        title: title.trim(),
        description: description.trim() || undefined,
        kind,
        url: resourceUrl,
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
          Ask a lead instructor for access to `upload_resource`.
        </div>
      </Modal>
    ) : (
    <Modal
      open
      title="Upload Resource"
      description="Keep learners equipped with links and downloadable files."
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
            form="resource-form"
            disabled={busy}
            className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Saving…' : 'Save Resource'}
          </button>
        </div>
      }
    >
      <form id="resource-form" onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#2563EB]"
              placeholder="e.g., Week 2 Starter Files"
            />
          </label>

          <div className="space-y-2 md:col-span-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Resource Type</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setKind('File')}
                className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
                  kind === 'File' ? 'bg-[#2563EB] text-white' : 'bg-[#DBEAFE]/40 text-[#1E3A8A] hover:bg-[#DBEAFE]'
                }`}
              >
                File Upload
              </button>
              <button
                type="button"
                onClick={() => setKind('Link')}
                className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
                  kind === 'Link' ? 'bg-[#2563EB] text-white' : 'bg-[#DBEAFE]/40 text-[#1E3A8A] hover:bg-[#DBEAFE]'
                }`}
              >
                Link
              </button>
            </div>
          </div>

          {kind === 'File' ? (
            <label className="space-y-2 md:col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">File</span>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm"
              />
              {file ? <p className="text-xs text-slate-500">Selected: {file.name}</p> : null}
            </label>
          ) : (
            <label className="space-y-2 md:col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Link</span>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#2563EB]"
                placeholder="https://..."
              />
            </label>
          )}

          <label className="space-y-2 md:col-span-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-28 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#2563EB]"
              placeholder="Optional details for learners."
            />
          </label>
        </div>
      </form>
    </Modal>
    )
  );
};

export default ResourceModal;
