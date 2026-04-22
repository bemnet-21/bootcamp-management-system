import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminRoutes } from '@/src/constants/routes';
import PageShell from '@/src/components/layout/PageShell';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Input } from '@/src/components/ui/Input';
import { useDivisionStore, type Division } from '@/src/store/useDivisionStore';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import { Toaster, toast } from 'sonner';
import { Plus, Pencil, Trash2, ArrowRight, Monitor, Code, Shield, Lightbulb, Activity, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { DivisionVisualKey } from '@/src/lib/divisionPresentation';
import { toastConfirm } from '@/src/lib/confirmToast';

const iconMap: Record<DivisionVisualKey, typeof Monitor> = {
  ds: Monitor,
  dev: Code,
  cyber: Shield,
  cpd: Lightbulb,
  generic: Monitor,
};

const AdminDivisionsPage = () => {
  const navigate = useNavigate();
  const {
    divisions,
    setActiveDivision,
    fetchDivisions,
    createDivision,
    updateDivision,
    deleteDivision,
    isLoading: divLoading,
    error,
  } = useDivisionStore();
  const { bootcamps, fetchBootcamps } = useBootcampStore();

  const [divDrawer, setDivDrawer] = useState(false);
  const [divEditingId, setDivEditingId] = useState<string | null>(null);
  const [divName, setDivName] = useState('');
  const [divDescription, setDivDescription] = useState('');

  useEffect(() => {
    fetchDivisions().catch((e) => toast.error(e?.response?.data?.message || 'Could not load divisions.'));
    fetchBootcamps().catch(() => {});
  }, [fetchDivisions, fetchBootcamps]);

  const activeBootcampCountByDivision = useMemo(() => {
    const m: Record<string, number> = {};
    for (const b of bootcamps) {
      if (b.lifecycle === 'Archived') continue;
      m[b.divisionId] = (m[b.divisionId] || 0) + 1;
    }
    return m;
  }, [bootcamps]);

  const totalMembers = useMemo(
    () => divisions.reduce((acc, d) => acc + (d.stats?.members ?? 0), 0),
    [divisions],
  );

  const activeBootcampsTotal = useMemo(
    () => bootcamps.filter((b) => b.lifecycle !== 'Archived').length,
    [bootcamps],
  );

  const openCreateDivision = () => {
    setDivEditingId(null);
    setDivName('');
    setDivDescription('');
    setDivDrawer(true);
  };

  const openEditDivision = (id: string, name: string, description: string) => {
    setDivEditingId(id);
    setDivName(name);
    setDivDescription(description);
    setDivDrawer(true);
  };

  const submitDivision = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (divEditingId) {
        await updateDivision(divEditingId, { name: divName, description: divDescription });
        toast.success('Division updated.');
      } else {
        await createDivision({ name: divName, description: divDescription });
        toast.success('Division created.');
      }
      setDivDrawer(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Division save failed.');
    }
  };

  const requestArchiveDivision = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    toastConfirm(
      `Archive “${name}”?`,
      'Soft-delete from the catalog. This cannot be undone from the student UI.',
      async () => {
        try {
          await deleteDivision(id);
          toast.success('Division archived.');
        } catch (err: any) {
          toast.error(err?.response?.data?.message || err?.message || 'Delete failed.');
        }
      },
      { confirm: 'Archive', cancel: 'Cancel' },
    );
  };

  const handleViewDivision = (div: Division) => {
    setActiveDivision(div);
    navigate(adminRoutes.division(div.id));
  };

  return (
    <PageShell>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-vanguard-gray-800 tracking-tight mb-2">Divisions</h1>
            <p className="text-vanguard-gray-800 opacity-60 max-w-2xl leading-relaxed">
              Welcome to the Vanguard Strategic Hub. Manage independent bootcamp operations, track vertical-specific
              metrics, and allocate resources across our four specialized learning pillars. Bootcamp cohorts are managed
              on the{' '}
              <Link to={adminRoutes.manageBootcamps} className="text-vanguard-blue font-bold hover:underline">
                Bootcamps
              </Link>{' '}
              admin page. Staff and learners live in the{' '}
              <Link to={adminRoutes.members} className="text-vanguard-blue font-bold hover:underline">
                Member directory
              </Link>
              .
            </p>
            {error && <p className="text-sm text-red-600 mt-2 font-medium">{error}</p>}
            {divLoading && <p className="text-sm text-vanguard-muted mt-2">Loading divisions…</p>}
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              to={adminRoutes.home}
              className="inline-flex items-center justify-center rounded-full px-4 py-2 text-[13px] font-semibold bg-vanguard-blue-light border-none text-vanguard-blue hover:opacity-90 transition-opacity"
            >
              <Activity size={16} className="mr-2" /> Live Monitoring
            </Link>
            <Button
              type="button"
              onClick={openCreateDivision}
              className="rounded-full h-10 text-[13px] font-semibold bg-vanguard-blue text-white hover:bg-vanguard-blue-dark"
            >
              <Plus size={16} className="mr-2" /> New division
            </Button>
          </div>
        </div>

        {!divLoading && divisions.length === 0 && (
          <Card className="p-10 mb-10 text-center">
            <p className="text-vanguard-gray-800 font-bold mb-2">No divisions yet</p>
            <p className="text-sm text-vanguard-muted mb-6">
              Create your pillars here. You can match Data Science, Development, Cybersecurity, and CPD, or define your
              own set.
            </p>
            <Button type="button" onClick={openCreateDivision} className="font-bold">
              <Plus size={16} className="mr-2" /> New division
            </Button>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {divisions.map((div, idx) => {
            const Icon = iconMap[div.visualKey] ?? Monitor;
            const activePrograms = activeBootcampCountByDivision[div.id] ?? 0;
            return (
              <Card
                key={div.id}
                noPadding
                className="group hover:-translate-y-1 transition-transform cursor-pointer relative"
                onClick={() => handleViewDivision(div)}
              >
                <div
                  className="absolute top-6 right-6 z-20 flex gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="p-2 rounded-xl bg-white/95 shadow-md border border-vanguard-gray-100 text-vanguard-blue hover:bg-vanguard-blue-light transition-colors"
                    title="Edit division"
                    onClick={() => openEditDivision(div.id, div.name, div.description)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-xl bg-white/95 shadow-md border border-vanguard-gray-100 text-red-600 hover:bg-red-50 transition-colors"
                    title="Archive division"
                    onClick={(e) => requestArchiveDivision(e, div.id, div.name)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="relative h-64 overflow-hidden">
                  <img
                    src={div.image}
                    alt={div.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
                  <div className="absolute top-6 left-6 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-vanguard-blue border border-vanguard-gray-100">
                    <Icon size={24} />
                  </div>
                </div>

                <div className="p-8 -mt-16 relative z-10 bg-white/60 backdrop-blur-sm rounded-b-xl border-t border-white/50">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-vanguard-blue mb-1">
                        Division {String(idx + 1).padStart(2, '0')}
                      </p>
                      <h2 className="text-3xl font-black text-vanguard-gray-800 tracking-tight">{div.name}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-vanguard-gray-800 leading-none">{activePrograms}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-40">
                        Active bootcamps
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-vanguard-gray-800 opacity-60 mb-8 leading-relaxed line-clamp-2">
                    {div.description?.trim() || '—'}
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 border-vanguard-gray-200 group-hover:bg-vanguard-blue group-hover:text-white transition-all pointer-events-none"
                  >
                    View Division <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 p-10 bg-vanguard-blue-light/50 rounded-2xl flex flex-wrap gap-x-20 gap-y-10 items-center justify-between border border-vanguard-blue/10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-50 mb-1">
              Total enrollment (divisions)
            </p>
            <h3 className="text-3xl font-black text-vanguard-gray-800">{totalMembers.toLocaleString()}</h3>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-50 mb-1">
              Active bootcamps
            </p>
            <h3 className="text-3xl font-black text-vanguard-gray-800">{activeBootcampsTotal}</h3>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-50 mb-1">
              Divisions (database)
            </p>
            <h3 className="text-3xl font-black text-vanguard-gray-800">{divisions.length}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-vanguard-blue opacity-60" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-50">
              Live from API
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {divDrawer && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[80]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDivDrawer(false)}
            />
            <motion.div
              className="fixed right-0 top-0 z-[90] flex h-full w-full max-w-lg flex-col border-l border-vanguard-gray-200 bg-white shadow-[-12px_0_48px_rgba(0,59,122,0.12)]"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 360 }}
            >
              <div className="shrink-0 border-b border-vanguard-gray-100 bg-gradient-to-b from-vanguard-blue-light/40 to-white px-6 pt-8 pb-6 sm:px-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-4">
                    <div className="mt-1 h-12 w-1.5 shrink-0 rounded-full bg-vanguard-blue" aria-hidden />
                    <div>
                      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-vanguard-muted">
                        Admin
                      </p>
                      <h2 className="text-2xl font-black tracking-tight text-vanguard-gray-800 sm:text-3xl">
                        {divEditingId ? 'Edit division' : 'New division'}
                      </h2>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-vanguard-gray-800 opacity-60">
                        {divEditingId
                          ? 'Update this pillar’s name and description. To remove it from the catalog, archive it from the division card.'
                          : 'Create a permanent learning pillar for the Vanguard hub. Names such as Data Science or CPD pick up the right theme and imagery automatically.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDivDrawer(false)}
                    className="shrink-0 rounded-xl p-2.5 text-vanguard-gray-800 opacity-50 transition-all hover:bg-vanguard-gray-50 hover:opacity-100"
                    aria-label="Close"
                  >
                    <X size={22} strokeWidth={2} />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-8">
                <Card className="rounded-2xl border border-vanguard-gray-100 p-6 shadow-sm sm:p-8">
                  <form onSubmit={submitDivision} className="space-y-6">
                    <div>
                      <label
                        htmlFor="admin-div-name"
                        className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-vanguard-muted"
                      >
                        Division name
                      </label>
                      <Input
                        id="admin-div-name"
                        value={divName}
                        onChange={(e) => setDivName(e.target.value)}
                        required
                        placeholder="e.g. Data Science, Cybersecurity"
                        className="mt-0"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="admin-div-desc"
                        className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-vanguard-muted"
                      >
                        Description
                      </label>
                      <textarea
                        id="admin-div-desc"
                        value={divDescription}
                        onChange={(e) => setDivDescription(e.target.value)}
                        rows={5}
                        placeholder="Short summary shown on division cards and the overview."
                        className="mt-0 w-full resize-y rounded-lg border-none bg-vanguard-blue-light/50 px-3 py-3 text-sm text-vanguard-gray-800 placeholder:text-vanguard-gray-800/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vanguard-blue focus-visible:ring-offset-0"
                      />
                    </div>
                    <div className="flex flex-col gap-3 border-t border-vanguard-gray-100 pt-6 sm:flex-row sm:gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 flex-1 rounded-full border-vanguard-gray-200 font-semibold text-vanguard-gray-800"
                        onClick={() => setDivDrawer(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="h-11 flex-1 rounded-full bg-vanguard-blue text-xs font-black uppercase tracking-widest text-white hover:bg-vanguard-blue-dark"
                      >
                        {divEditingId ? 'Save changes' : 'Create division'}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PageShell>
  );
};

export default AdminDivisionsPage;
