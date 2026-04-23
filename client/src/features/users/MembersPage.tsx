import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageShell from '@/src/components/layout/PageShell';
import { Button } from '@/src/components/ui/Button';
import { Plus, Search, Filter, X, AlertTriangle } from 'lucide-react';
import MemberTable from './components/MemberTable';
import AddMemberForm from './components/AddMemberForm';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { Member, useUserStore } from '@/src/store/useUserStore';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import { useDivisionStore } from '@/src/store/useDivisionStore';
import { adminRoutes } from '@/src/constants/routes';

const MembersPage = () => {
  const { id: routeDivisionId } = useParams<{ id?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);

  const { deleteMember, fetchMembers, members, isLoading, error } = useUserStore();
  const { bootcamps, fetchBootcamps } = useBootcampStore();
  const { divisions, fetchDivisions, getDivisionById } = useDivisionStore();

  const activeDivisionId = routeDivisionId || divisionFilter || undefined;

  useEffect(() => {
    fetchDivisions().catch((e: any) => {
      toast.error(e?.response?.data?.message || e?.message || 'Failed to load divisions.');
    });
  }, [fetchDivisions]);

  useEffect(() => {
    fetchBootcamps().catch(() => {});
  }, [fetchBootcamps]);

  useEffect(() => {
    fetchMembers({ division: activeDivisionId, limit: 100 }).catch((e: any) => {
      toast.error(e?.response?.data?.message || e?.message || 'Failed to load members.');
    });
  }, [fetchMembers, activeDivisionId]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setIsDrawerOpen(true);
  };

  const handleDelete = (member: Member) => {
    setDeletingMember(member);
  };

  const confirmDelete = async () => {
    if (deletingMember) {
      try {
        await deleteMember(deletingMember.id);
        toast.success('Member removed from directory');
        setDeletingMember(null);
        await fetchMembers({ division: activeDivisionId, limit: 100 }).catch(() => {});
      } catch (e: any) {
        toast.error(e?.response?.data?.message || e?.message || 'Failed to delete member.');
      }
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingMember(null);
  };

  const scopedDivisionName = routeDivisionId ? getDivisionById(routeDivisionId)?.name : null;

  return (
    <PageShell>
      <Toaster position="top-right" />
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 text-[12px] font-semibold uppercase tracking-wider text-vanguard-muted">
              Organization
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-vanguard-gray-800">Member directory</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-vanguard-muted">
              Users are tied to <strong>divisions</strong>; cohort enrollment appears when a user is listed on a{' '}
              <strong>bootcamp</strong>. Manage pillars on{' '}
              <Link to={adminRoutes.manageDivisions} className="font-bold text-vanguard-blue hover:underline">
                Divisions
              </Link>
              , cohorts on{' '}
              <Link to={adminRoutes.manageBootcamps} className="font-bold text-vanguard-blue hover:underline">
                Bootcamps
              </Link>
              , and browse programs in the{' '}
              <Link to={adminRoutes.bootcamps} className="font-bold text-vanguard-blue hover:underline">
                registry
              </Link>
              .
            </p>
            {scopedDivisionName && (
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-vanguard-blue">
                Filtered: {scopedDivisionName}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setEditingMember(null);
                setIsDrawerOpen(true);
              }}
              className="h-10 px-6 text-[12px] font-bold uppercase tracking-wider"
            >
              <Plus size={16} className="mr-2" /> Add member
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-vanguard-muted opacity-40"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, email, role, division, or bootcamp…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white pl-10 pr-4 text-sm outline-none transition-all focus:ring-1 focus:ring-vanguard-blue"
            />
          </div>
          {!routeDivisionId && (
            <div className="flex flex-wrap items-center gap-2 md:min-w-[220px]">
              <Filter size={16} className="text-vanguard-muted opacity-60" />
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="h-10 flex-1 rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-vanguard-gray-800 outline-none focus:ring-1 focus:ring-vanguard-blue md:min-w-[200px]"
              >
                <option value="">All divisions</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {isLoading && <div className="mb-4 text-sm text-vanguard-muted">Loading members…</div>}

        <MemberTable
          members={members}
          bootcamps={bootcamps}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchQuery={searchQuery}
        />
      </div>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 360 }}
              className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-lg flex-col border-l border-vanguard-gray-200 bg-white shadow-[-12px_0_48px_rgba(0,59,122,0.12)]"
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
                        {editingMember ? 'Edit member' : 'Add member'}
                      </h2>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-vanguard-gray-800 opacity-60">
                        {editingMember
                          ? `Update ${editingMember.name}. Division changes stay in sync with the Divisions admin list.`
                          : 'Create accounts for staff or learners. Assign a division pillar; bootcamp enrollment is managed on each cohort.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="shrink-0 rounded-xl p-2.5 text-vanguard-gray-800 opacity-50 transition-all hover:bg-vanguard-gray-50 hover:opacity-100"
                    aria-label="Close"
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-8">
                <AddMemberForm
                  key={editingMember?.id ?? `new-${activeDivisionId ?? 'all'}`}
                  onSuccess={() => {
                    closeDrawer();
                    void fetchMembers({ division: activeDivisionId, limit: 100 });
                  }}
                  initialData={editingMember}
                  defaultDivisionId={routeDivisionId || divisionFilter || undefined}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingMember && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingMember(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <AlertTriangle size={24} />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-vanguard-gray-800">Delete member?</h2>
              <p className="mb-8 text-sm leading-relaxed text-vanguard-muted">
                You are about to remove{' '}
                <span className="font-bold text-vanguard-gray-800">{deletingMember.name}</span> from the directory.
                This revokes system access.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={() => setDeletingMember(null)}>
                  Cancel
                </Button>
                <Button className="flex-1 border-none bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
                  Delete member
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageShell>
  );
};

export default MembersPage;
