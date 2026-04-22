import React, { useMemo, useState } from 'react';
import Modal from '@/src/components/ui/Modal';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import { useUserStore } from '@/src/store/useUserStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { canPerform } from '@/src/lib/permissions';

type Props = { onClose: () => void };
type Mode = 'manual' | 'csv' | 'existing';

const tabClass = (active: boolean) =>
  `rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
    active ? 'bg-[#2563EB] text-white' : 'bg-[#DBEAFE]/40 text-[#1E3A8A] hover:bg-[#DBEAFE]'
  }`;

function parseCsv(text: string): Array<{ name: string; email?: string }> {
  const lines = text
    .split(/\r?\n/g)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];
  const startIndex = /name/i.test(lines[0]) && /email/i.test(lines[0]) ? 1 : 0;
  return lines.slice(startIndex).map((line) => {
    const [name, email] = line.split(',').map((cell) => cell.trim());
    return { name: name || '', email: email || undefined };
  }).filter((row) => row.name);
}

const StudentsModal = ({ onClose }: Props) => {
  const { bootcamps, addStudent } = useBootcampStore();
  const { members, isLoading, fetchMembers } = useUserStore();
  const { role, permissions } = useAuthStore();
  const allowed = canPerform({ role, permissions }, 'add_student');

  const [mode, setMode] = useState<Mode>('manual');
  const [bootcampId, setBootcampId] = useState(bootcamps[0]?.id ?? 'fs-react');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // manual
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // csv
  const [csvPreview, setCsvPreview] = useState<Array<{ name: string; email?: string }>>([]);

  // existing
  const studentMembers = useMemo(() => members.filter((m) => m.role === 'Student'), [members]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Record<string, boolean>>({});

  const addMany = (rows: Array<{ name: string; email?: string }>) => {
    rows.forEach((row) => addStudent({ name: row.name, email: row.email, bootcampId }));
  };

  const handleSubmitManual = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!allowed) return setError('You do not have permission to add students.');
    if (!name.trim()) return setError('Student name is required.');
    setBusy(true);
    try {
      addStudent({ name: name.trim(), email: email.trim() || undefined, bootcampId });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const handleCsvFile = async (file: File | null) => {
    setError(null);
    if (!file) return;
    const text = await file.text();
    const rows = parseCsv(text);
    if (!rows.length) {
      setCsvPreview([]);
      setError('No valid rows found. Expected CSV rows like: name,email');
      return;
    }
    setCsvPreview(rows.slice(0, 50));
  };

  const handleSubmitCsv = async () => {
    setError(null);
    if (!allowed) return setError('You do not have permission to add students.');
    if (!csvPreview.length) return setError('Upload a CSV first.');
    setBusy(true);
    try {
      addMany(csvPreview);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitExisting = async () => {
    setError(null);
    if (!allowed) return setError('You do not have permission to add students.');
    const chosen = Object.entries(selectedMemberIds).filter(([, v]) => v).map(([id]) => id);
    if (!chosen.length) return setError('Select at least one existing user.');
    setBusy(true);
    try {
      addMany(
        studentMembers
          .filter((m) => chosen.includes(m.id))
          .map((m) => ({ name: m.name, email: m.email }))
      );
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
      title="Add Students"
      description="Add learners manually, upload a CSV, or pull from existing users."
      onClose={busy ? () => undefined : onClose}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:items-center">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          {mode === 'manual' ? (
            <button
              type="submit"
              form="student-manual"
              disabled={busy}
              className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Add Student'}
            </button>
          ) : null}
          {mode === 'csv' ? (
            <button
              type="button"
              onClick={handleSubmitCsv}
              disabled={busy}
              className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Saving…' : `Add ${csvPreview.length} Students`}
            </button>
          ) : null}
          {mode === 'existing' ? (
            <button
              type="button"
              onClick={handleSubmitExisting}
              disabled={busy}
              className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Add Selected'}
            </button>
          ) : null}
        </div>
      }
    >
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setMode('manual')} className={tabClass(mode === 'manual')}>
          Manual Add
        </button>
        <button type="button" onClick={() => setMode('csv')} className={tabClass(mode === 'csv')}>
          CSV Upload
        </button>
        <button type="button" onClick={() => setMode('existing')} className={tabClass(mode === 'existing')}>
          Select Existing
        </button>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-5 rounded-2xl border border-blue-100 bg-[#F8FBFF] p-4">
        <label className="space-y-2">
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
      </div>

      {mode === 'manual' ? (
        <form id="student-manual" onSubmit={handleSubmitManual} className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 md:col-span-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#2563EB]"
              placeholder="Student name"
            />
          </label>
          <label className="space-y-2 md:col-span-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#2563EB]"
              placeholder="optional@email.com"
            />
          </label>
        </form>
      ) : null}

      {mode === 'csv' ? (
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">CSV File</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => handleCsvFile(e.target.files?.[0] || null)}
              className="mt-2 block w-full text-sm"
            />
          </label>
          <div className="rounded-2xl border border-blue-100 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Preview</p>
            <p className="mt-1 text-xs text-slate-500">Up to 50 rows. Format: name,email (header optional).</p>
            <div className="mt-4 space-y-2">
              {csvPreview.length ? (
                csvPreview.slice(0, 8).map((row, idx) => (
                  <div key={`${row.name}-${idx}`} className="flex items-center justify-between rounded-xl bg-[#DBEAFE]/30 px-3 py-2 text-sm">
                    <span className="font-semibold text-slate-900">{row.name}</span>
                    <span className="text-slate-600">{row.email || '—'}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-blue-200 bg-[#DBEAFE]/20 p-4 text-sm text-slate-600">
                  Upload a CSV to preview rows.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {mode === 'existing' ? (
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Existing Users</p>
              <p className="mt-1 text-xs text-slate-500">Loads from the Users store (role: Student).</p>
            </div>
            <button
              type="button"
              onClick={() => fetchMembers()}
              disabled={isLoading}
              className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-[#1E3A8A] transition hover:bg-[#DBEAFE] disabled:opacity-60"
            >
              {isLoading ? 'Loading…' : 'Load Users'}
            </button>
          </div>

          <div className="max-h-[45vh] space-y-2 overflow-auto rounded-2xl border border-blue-100 bg-white p-4">
            {studentMembers.length ? (
              studentMembers.map((member) => {
                const checked = !!selectedMemberIds[member.id];
                return (
                  <label
                    key={member.id}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3 transition hover:bg-[#F8FBFF]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelectedMemberIds((current) => ({ ...current, [member.id]: !checked }))
                      }
                      className="h-4 w-4 accent-[#2563EB]"
                    />
                  </label>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-blue-200 bg-[#DBEAFE]/20 p-4 text-sm text-slate-600">
                No users loaded yet.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
    )
  );
};

export default StudentsModal;
