import React, { useMemo, useState } from 'react';
import Modal from '@/src/components/ui/Modal';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { canPerform } from '@/src/lib/permissions';

type Props = {
  mode: 'create' | 'edit';
  sessionId: string | null;
  onClose: () => void;
};

const venueOptions = ['Online', 'Lab A', 'Lab B'];

const SessionModal = ({ mode, sessionId, onClose }: Props) => {
  const { sessions, bootcamps, addSession, updateSession } = useBootcampStore();
  const { role, permissions } = useAuthStore();
  const allowed = canPerform({ role, permissions }, 'create_session');
  const session = useMemo(
    () => (mode === 'edit' && sessionId ? sessions.find((s) => s.id === sessionId) : undefined),
    [mode, sessionId, sessions]
  );

  const [title, setTitle] = useState(session?.title ?? '');
  const [date, setDate] = useState(session?.date ?? new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(session?.time ?? '09:00 AM');
  const [venue, setVenue] = useState(
    venueOptions.includes(session?.location || '') ? (session?.location as string) : venueOptions[0]
  );
  const [customVenue, setCustomVenue] = useState(
    session?.location && !venueOptions.includes(session.location) ? session.location : ''
  );
  const [description, setDescription] = useState(session?.description ?? '');
  const [bootcampId, setBootcampId] = useState(session?.bootcampId ?? bootcamps[0]?.id ?? 'fs-react');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveVenue = venue === '__custom__' ? customVenue : venue;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!allowed) return setError('You do not have permission to create or edit sessions.');
    if (!title.trim()) return setError('Title is required.');
    if (!date.trim()) return setError('Date is required.');
    if (!time.trim()) return setError('Time is required.');
    if (!effectiveVenue.trim()) return setError('Venue is required.');

    setBusy(true);
    try {
      if (mode === 'create') {
        addSession({
          title: title.trim(),
          date,
          time,
          location: effectiveVenue.trim(),
          description: description.trim() || undefined,
          bootcampId,
        });
      } else if (sessionId) {
        updateSession(sessionId, {
          title: title.trim(),
          date,
          time,
          location: effectiveVenue.trim(),
          description: description.trim() || undefined,
          bootcampId,
        });
      }
      onClose();
    } finally {
      setBusy(false);
    }
  };

  if (!allowed) {
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
          Ask a lead instructor for access to `create_session`.
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open
      title={mode === 'create' ? 'Create Session' : 'Edit Session'}
      description="Set the core delivery details and keep the schedule up to date."
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
            form="session-form"
            disabled={busy}
            className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Saving…' : 'Save Session'}
          </button>
        </div>
      }
    >
      <form id="session-form" onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#2563EB]"
              placeholder="e.g., React State Patterns"
            />
          </label>

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

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#2563EB]"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Time</span>
            <input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#2563EB]"
              placeholder="09:00 AM"
            />
          </label>

          <div className="space-y-2">
            <label className="block space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Venue</span>
              <select
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#2563EB]"
              >
                {venueOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
                <option value="__custom__">Other…</option>
              </select>
            </label>
            {venue === '__custom__' ? (
              <input
                value={customVenue}
                onChange={(e) => setCustomVenue(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#2563EB]"
                placeholder="Enter venue"
              />
            ) : null}
          </div>
        </div>

        <label className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-28 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#2563EB]"
            placeholder="Optional context for instructors and helpers."
          />
        </label>
      </form>
    </Modal>
  );
};

export default SessionModal;
