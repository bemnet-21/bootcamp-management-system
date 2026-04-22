import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PageShell from '@/src/components/layout/PageShell';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Input } from '@/src/components/ui/Input';
import { useDivisionStore } from '@/src/store/useDivisionStore';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import axiosInstance from '@/src/api/axiosInstance';
import { ENDPOINTS } from '@/src/api/endpoints';
import { adminRoutes } from '@/src/constants/routes';
import { toastConfirm } from '@/src/lib/confirmToast';
import { Toaster, toast } from 'sonner';
import { Plus, Pencil, Archive, UserCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type InstructorOption = { id: string; label: string };

const AdminBootcampsManagePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { divisions, fetchDivisions } = useDivisionStore();
  const {
    bootcamps,
    fetchBootcamps,
    createBootcamp,
    updateBootcamp,
    deactivateBootcamp,
    assignLeadInstructor,
    isLoading: bcLoading,
  } = useBootcampStore();

  const [instructors, setInstructors] = useState<InstructorOption[]>([]);

  const [bcDrawer, setBcDrawer] = useState(false);
  const [bcEditingId, setBcEditingId] = useState<string | null>(null);
  const [bcName, setBcName] = useState('');
  const [bcDivisionId, setBcDivisionId] = useState('');
  const [bcDescription, setBcDescription] = useState('');
  const [bcStart, setBcStart] = useState('');
  const [bcEnd, setBcEnd] = useState('');
  const [bcLeadId, setBcLeadId] = useState('');

  const [assignBootcampId, setAssignBootcampId] = useState<string | null>(null);
  const [assignInstructorId, setAssignInstructorId] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Draft' | 'Archived'>('all');

  useEffect(() => {
    fetchDivisions().catch((e) => toast.error(e?.response?.data?.message || 'Could not load divisions.'));
    fetchBootcamps().catch((e) => toast.error(e?.response?.data?.message || 'Could not load bootcamps.'));
  }, [fetchDivisions, fetchBootcamps]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axiosInstance.get(ENDPOINTS.USERS.BASE, {
          params: { role: 'Instructor', status: 'Active', limit: 100 },
        });
        const users = res.data?.data ?? [];
        if (cancelled) return;
        setInstructors(
          users.map((u: any) => ({
            id: String(u._id),
            label: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.username || u.email,
          })),
        );
      } catch {
        if (!cancelled) setInstructors([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openCreateBootcamp = () => {
    setBcEditingId(null);
    setBcName('');
    setBcDescription('');
    setBcStart('');
    setBcEnd('');
    setBcLeadId('');
    const fromQuery = searchParams.get('division');
    const validFromQuery = fromQuery && divisions.some((x) => x.id === fromQuery);
    setBcDivisionId(validFromQuery ? fromQuery : divisions[0]?.id ?? '');
    setBcDrawer(true);
  };

  const openEditBootcamp = (id: string) => {
    const b = bootcamps.find((x) => x.id === id);
    if (!b) return;
    setBcEditingId(id);
    setBcName(b.name);
    setBcDescription(b.description);
    setBcDivisionId(b.divisionId);
    setBcStart(b.startDate?.slice(0, 10) ?? '');
    setBcEnd(b.endDate?.slice(0, 10) ?? '');
    setBcLeadId(b.leadInstructorId ?? '');
    setBcDrawer(true);
  };

  const submitBootcamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcDivisionId) {
      toast.error('Choose a division.');
      return;
    }
    if (!bcLeadId) {
      toast.error('Lead instructor is required when creating or updating from this form.');
      return;
    }
    try {
      if (bcEditingId) {
        await updateBootcamp(bcEditingId, {
          name: bcName,
          division_id: bcDivisionId,
          description: bcDescription,
          startDate: bcStart,
          endDate: bcEnd,
          leadInstructor: bcLeadId,
        });
        toast.success('Bootcamp updated.');
      } else {
        await createBootcamp({
          name: bcName,
          division_id: bcDivisionId,
          description: bcDescription,
          startDate: bcStart,
          endDate: bcEnd,
          leadInstructor: bcLeadId,
        });
        toast.success('Bootcamp created.');
      }
      setBcDrawer(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Bootcamp save failed.');
    }
  };

  const sortedBootcamps = useMemo(() => {
    const normalizedName = nameFilter.trim().toLowerCase();
    return [...bootcamps]
      .filter((bootcamp) => {
        const matchesName = !normalizedName || bootcamp.name.toLowerCase().includes(normalizedName);
        const matchesDivision = divisionFilter === 'all' || bootcamp.divisionId === divisionFilter;
        const matchesStatus = statusFilter === 'all' || bootcamp.lifecycle === statusFilter;
        return matchesName && matchesDivision && matchesStatus;
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [bootcamps, nameFilter, divisionFilter, statusFilter]);

  return (
    <PageShell>
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-vanguard-muted mb-2">Admin</p>
          <h1 className="text-3xl font-black text-vanguard-gray-800 tracking-tight">Bootcamps</h1>
          <p className="text-sm text-vanguard-muted mt-2 max-w-3xl leading-relaxed">
            Time-bound cohorts: name, division, dates, and lead instructor. Divisions are managed on the{' '}
            <Link to={adminRoutes.manageDivisions} className="text-vanguard-blue font-bold hover:underline">
              Divisions
            </Link>{' '}
            page. For a read-only registry view with charts, open{' '}
            <Link to={adminRoutes.bootcamps} className="text-vanguard-blue font-bold hover:underline">
              Bootcamp registry
            </Link>
            . Open{' '}
            <Link to={adminRoutes.members} className="text-vanguard-blue font-bold hover:underline">
              Member directory
            </Link>{' '}
            to see users and which cohorts enroll them. Server lists only active bootcamps; archiving removes a cohort from this list.
          </p>
        </div>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-vanguard-gray-800">Manage cohorts</h2>
            <Button
              type="button"
              onClick={openCreateBootcamp}
              disabled={!divisions.length}
              className="h-10 text-xs font-black uppercase tracking-widest"
            >
              <Plus size={16} className="mr-2" /> New bootcamp
            </Button>
          </div>
          <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Input
              id="bootcamp-name-filter"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Search by bootcamp name"
              className="mt-0"
            />
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="h-11 w-full rounded-lg border border-vanguard-gray-200 bg-white px-3 text-sm text-vanguard-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vanguard-blue"
            >
              <option value="all">All divisions</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Active' | 'Draft' | 'Archived')}
              className="h-11 w-full rounded-lg border border-vanguard-gray-200 bg-white px-3 text-sm text-vanguard-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vanguard-blue"
            >
              <option value="all">All statuses</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
          {bcLoading && <p className="text-sm text-vanguard-muted">Loading…</p>}
          <div className="overflow-x-auto border border-vanguard-gray-100 rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-vanguard-gray-50 text-left text-[10px] font-black uppercase tracking-widest text-vanguard-muted">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Division</th>
                  <th className="p-3">Dates</th>
                  <th className="p-3">Lead</th>
                  <th className="p-3">Lifecycle</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedBootcamps.map((b) => (
                  <tr
                    key={b.id}
                    className="border-t border-vanguard-gray-100 hover:bg-vanguard-gray-50 cursor-pointer"
                    onClick={() => navigate(adminRoutes.bootcamp(b.id))}
                  >
                    <td className="p-3 font-bold text-vanguard-gray-800">{b.name}</td>
                    <td className="p-3 text-vanguard-muted">
                      {divisions.find((d) => d.id === b.divisionId)?.name ?? b.divisionId}
                    </td>
                    <td className="p-3 text-vanguard-muted whitespace-nowrap">
                      {b.startDate?.slice(0, 10)} → {b.endDate?.slice(0, 10)}
                    </td>
                    <td className="p-3 text-vanguard-muted">{b.leadName ?? '—'}</td>
                    <td className="p-3">{b.lifecycle}</td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        type="button"
                        className="inline-flex p-2 rounded-lg hover:bg-vanguard-gray-100 text-vanguard-blue"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEditBootcamp(b.id);
                        }}
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="inline-flex p-2 rounded-lg hover:bg-vanguard-gray-100 text-vanguard-gray-800"
                        onClick={(event) => {
                          event.stopPropagation();
                          setAssignBootcampId(b.id);
                          setAssignInstructorId(b.leadInstructorId ?? '');
                        }}
                        title="Assign lead"
                      >
                        <UserCircle size={16} />
                      </button>
                      <button
                        type="button"
                        className="inline-flex p-2 rounded-lg hover:bg-amber-50 text-amber-800"
                        onClick={(event) => {
                          event.stopPropagation();
                          toastConfirm(
                            `Deactivate “${b.name}”?`,
                            'It will disappear from active lists.',
                            async () => {
                              try {
                                await deactivateBootcamp(b.id);
                                toast.success('Bootcamp archived.');
                              } catch (err: any) {
                                toast.error(err?.response?.data?.message || err?.message || 'Failed.');
                              }
                            },
                            { confirm: 'Deactivate', cancel: 'Cancel' },
                          );
                        }}
                        title="Archive"
                      >
                        <Archive size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!bcLoading && sortedBootcamps.length === 0 && (
              <p className="p-6 text-sm text-vanguard-muted">
                No active bootcamps. Create one or check archived records on the server.
              </p>
            )}
          </div>
        </Card>
      </div>

      <AnimatePresence>
        {bcDrawer && (
          <>
            <motion.div
              className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setBcDrawer(false)}
            />
            <motion.div
              className="fixed right-0 top-0 z-[90] flex h-full w-full max-w-lg flex-col border-l border-vanguard-gray-200 bg-white shadow-[-12px_0_48px_rgba(0,59,122,0.12)]"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 360 }}
            >
              <div className="shrink-0 border-b border-vanguard-gray-100 bg-gradient-to-b from-vanguard-blue-light/40 to-white px-6 pb-6 pt-8 sm:px-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-4">
                    <div className="mt-1 h-12 w-1.5 shrink-0 rounded-full bg-vanguard-blue" aria-hidden />
                    <div>
                      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-vanguard-muted">
                        Admin
                      </p>
                      <h2 className="text-2xl font-black tracking-tight text-vanguard-gray-800 sm:text-3xl">
                        {bcEditingId ? 'Edit bootcamp' : 'New bootcamp'}
                      </h2>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-vanguard-gray-800 opacity-60">
                        {bcEditingId
                          ? 'Update cohort details, dates, division, or lead instructor. Archiving stays on the table row.'
                          : 'Create a time-bound cohort: pick a division, schedule start and end, and assign an active lead instructor.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBcDrawer(false)}
                    className="shrink-0 rounded-xl p-2.5 text-vanguard-gray-800 opacity-50 transition-all hover:bg-vanguard-gray-50 hover:opacity-100"
                    aria-label="Close"
                  >
                    <X size={22} strokeWidth={2} />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-8">
                <Card className="rounded-2xl border border-vanguard-gray-100 p-6 shadow-sm sm:p-8">
                  <form onSubmit={submitBootcamp} className="space-y-6">
                    <div>
                      <label
                        htmlFor="admin-bc-name"
                        className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-vanguard-muted"
                      >
                        Cohort name
                      </label>
                      <Input
                        id="admin-bc-name"
                        value={bcName}
                        onChange={(e) => setBcName(e.target.value)}
                        required
                        placeholder="e.g. Full-Stack React — Spring 2026"
                        className="mt-0"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="admin-bc-division"
                        className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-vanguard-muted"
                      >
                        Division
                      </label>
                      <select
                        id="admin-bc-division"
                        value={bcDivisionId}
                        onChange={(e) => setBcDivisionId(e.target.value)}
                        required
                        className="mt-0 h-11 w-full rounded-lg border-none bg-vanguard-blue-light/50 px-3 text-sm text-vanguard-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vanguard-blue focus-visible:ring-offset-0"
                      >
                        <option value="">Select division</option>
                        {divisions.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="admin-bc-desc"
                        className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-vanguard-muted"
                      >
                        Description
                      </label>
                      <textarea
                        id="admin-bc-desc"
                        value={bcDescription}
                        onChange={(e) => setBcDescription(e.target.value)}
                        rows={4}
                        placeholder="Optional summary for staff and registry views."
                        className="mt-0 w-full resize-y rounded-lg border-none bg-vanguard-blue-light/50 px-3 py-3 text-sm text-vanguard-gray-800 placeholder:text-vanguard-gray-800/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vanguard-blue focus-visible:ring-offset-0"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="admin-bc-start"
                          className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-vanguard-muted"
                        >
                          Start date
                        </label>
                        <Input
                          id="admin-bc-start"
                          type="date"
                          value={bcStart}
                          onChange={(e) => setBcStart(e.target.value)}
                          required
                          className="mt-0"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="admin-bc-end"
                          className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-vanguard-muted"
                        >
                          End date
                        </label>
                        <Input
                          id="admin-bc-end"
                          type="date"
                          value={bcEnd}
                          onChange={(e) => setBcEnd(e.target.value)}
                          required
                          className="mt-0"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="admin-bc-lead"
                        className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-vanguard-muted"
                      >
                        Lead instructor
                      </label>
                      <select
                        id="admin-bc-lead"
                        value={bcLeadId}
                        onChange={(e) => setBcLeadId(e.target.value)}
                        required
                        className="mt-0 h-11 w-full rounded-lg border-none bg-vanguard-blue-light/50 px-3 text-sm text-vanguard-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vanguard-blue focus-visible:ring-offset-0"
                      >
                        <option value="">Select instructor</option>
                        {instructors.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-3 border-t border-vanguard-gray-100 pt-6 sm:flex-row sm:gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 flex-1 rounded-full border-vanguard-gray-200 font-semibold text-vanguard-gray-800"
                        onClick={() => setBcDrawer(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="h-11 flex-1 rounded-full bg-vanguard-blue text-xs font-black uppercase tracking-widest text-white hover:bg-vanguard-blue-dark"
                      >
                        {bcEditingId ? 'Save changes' : 'Create bootcamp'}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {assignBootcampId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAssignBootcampId(null)}
            />
            <motion.div
              className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-xl z-[110]"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h3 className="text-lg font-black text-vanguard-gray-800 mb-4">Assign lead instructor</h3>
              <select
                value={assignInstructorId}
                onChange={(e) => setAssignInstructorId(e.target.value)}
                className="w-full h-11 rounded-lg border border-vanguard-gray-200 px-3 text-sm mb-4"
              >
                <option value="">Select instructor</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.label}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setAssignBootcampId(null)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={async () => {
                    if (!assignBootcampId || !assignInstructorId) {
                      toast.error('Pick an instructor.');
                      return;
                    }
                    try {
                      await assignLeadInstructor(assignBootcampId, assignInstructorId);
                      toast.success('Lead updated.');
                      setAssignBootcampId(null);
                    } catch (err: any) {
                      toast.error(err?.response?.data?.message || err?.message || 'Failed.');
                    }
                  }}
                >
                  Save
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageShell>
  );
};

export default AdminBootcampsManagePage;
