import { type ComponentProps, useEffect, useMemo, useState } from 'react';
import { StatCard } from '@/src/components/shared/StatCard';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { DataTable } from '@/src/components/shared/DataTable';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  MoreVertical,
  Pencil,
  ArrowLeft,
  Video,
  FolderOpen,
} from 'lucide-react';
import PageShell from '@/src/components/layout/PageShell';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminRoutes } from '@/src/constants/routes';
import { useBootcampStore, type Bootcamp } from '@/src/store/useBootcampStore';
import { useDivisionStore } from '@/src/store/useDivisionStore';
import { toast } from 'sonner';
import { toastConfirm } from '@/src/lib/confirmToast';

const TABS = ['Curriculum', 'Students', 'Sessions', 'Resources'] as const;

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>['variant']>;

const modules = [
  {
    id: '04',
    name: 'Advanced State Management with Redux',
    duration: '2 Weeks',
    focus: 'RTK Query, Slices, Selectors',
    status: 'in progress' as const,
    lead: 'Sarah Jenkins',
    tasks: '4/6',
    end: 'May 24',
  },
  {
    id: '03',
    name: 'Backend Integration & API Design',
    duration: '3 Weeks',
    focus: 'Node.js, Express, PostgreSQL',
    status: 'completed' as const,
    lead: 'David Chen',
    tasks: 'All',
    end: 'May 10',
  },
  {
    id: '05',
    name: 'Testing, Deployment & CI/CD',
    duration: '2 Weeks',
    focus: 'Jest, Cypress, Docker',
    status: 'upcoming' as const,
    lead: null as string | null,
    tasks: '0/8',
    end: 'Jun 12',
  },
];

function lifecycleBadgeVariant(lifecycle: Bootcamp['lifecycle']): BadgeVariant {
  if (lifecycle === 'Archived') return 'completed';
  if (lifecycle === 'Draft') return 'upcoming';
  return 'active';
}

const BootcampWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Curriculum');

  const { bootcamps, fetchBootcamps, isLoading: bcLoading, error: bcError, deactivateBootcamp } = useBootcampStore();
  const { fetchDivisions, getDivisionById, ensureDivision } = useDivisionStore();

  useEffect(() => {
    if (!id) return;
    fetchBootcamps().catch((e: any) => {
      toast.error(e?.response?.data?.message || e?.message || 'Failed to load bootcamp.');
    });
    fetchDivisions().catch((e: any) => {
      toast.error(e?.response?.data?.message || e?.message || 'Failed to load divisions.');
    });
  }, [id, fetchBootcamps, fetchDivisions]);

  const bootcamp = useMemo(() => (id ? bootcamps.find((b) => b.id === id) : undefined), [bootcamps, id]);

  useEffect(() => {
    if (!bootcamp?.divisionId) return;
    if (getDivisionById(bootcamp.divisionId)) return;
    ensureDivision(bootcamp.divisionId).catch(() => {});
  }, [bootcamp?.divisionId, getDivisionById, ensureDivision]);

  useEffect(() => {
    if (bcError) toast.error(bcError);
  }, [bcError]);

  const divisionName = bootcamp ? getDivisionById(bootcamp.divisionId)?.name ?? 'Division' : '';

  const startDate = bootcamp ? new Date(bootcamp.startDate) : null;
  const endDate = bootcamp ? new Date(bootcamp.endDate) : null;

  const studentColumns = [
    {
      header: 'Student Name',
      key: 'name',
      render: (item: { name: string; project: string; time: string; avatar: string }) => (
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
            <img src={item.avatar} alt={item.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h4 className="font-black tracking-tight text-vanguard-gray-800">{item.name}</h4>
            <p className="text-[10px] font-bold uppercase leading-tight tracking-widest text-vanguard-gray-800 opacity-40">
              {item.project} • {item.time}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Enrollment Date',
      key: 'enrollment',
      render: (item: { enrollment: string }) => (
        <span className="font-medium text-gray-500">{item.enrollment}</span>
      ),
    },
    {
      header: 'Overall Progress',
      key: 'progress',
      render: (item: { progress: number; status: string }) => (
        <div className="flex w-32 items-center space-x-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-vanguard-gray-100">
            <div
              className={cn(
                'h-full rounded-full',
                item.status === 'at-risk' ? 'bg-orange-800' : 'bg-vanguard-blue',
              )}
              style={{ width: `${item.progress}%` }}
            />
          </div>
          <span className="text-[10px] font-black">{item.progress}%</span>
        </div>
      ),
    },
    {
      header: 'Attendance',
      key: 'attendance',
      render: (item: { attendance: number }) => (
        <span className="font-black text-vanguard-gray-800">{item.attendance}%</span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (item: { status: 'active' | 'at-risk' | 'graduated' }) => (
        <Badge variant={item.status}>{item.status}</Badge>
      ),
    },
    {
      header: '',
      key: 'actions',
      align: 'right' as const,
      render: () => (
        <button type="button" className="text-vanguard-gray-800 opacity-40 hover:opacity-100">
          <MoreVertical size={18} />
        </button>
      ),
    },
  ];

  const demoStudents = [
    {
      id: '1',
      name: 'Elena Rodriguez',
      project: 'Redux Project Template',
      time: '10m ago',
      enrollment: 'Mar 12, 2024',
      progress: 92,
      attendance: 98,
      status: 'active' as const,
      avatar: 'https://picsum.photos/seed/elena/200',
    },
    {
      id: '2',
      name: 'Marcus Thorne',
      project: 'State Management Quiz',
      time: '45m ago',
      enrollment: 'Mar 14, 2024',
      progress: 65,
      attendance: 82,
      status: 'at-risk' as const,
      avatar: 'https://picsum.photos/seed/marcus/200',
    },
    {
      id: '3',
      name: 'Julian Vane',
      project: 'API Endpoint Logic',
      time: '2h ago',
      enrollment: 'Mar 12, 2024',
      progress: 88,
      attendance: 94,
      status: 'active' as const,
      avatar: 'https://picsum.photos/seed/julian/200',
    },
    {
      id: '4',
      name: 'Sarah Jenkins',
      project: 'Portfolio Site V1',
      time: '1d ago',
      enrollment: 'Mar 12, 2024',
      progress: 100,
      attendance: 99,
      status: 'graduated' as const,
      avatar: 'https://picsum.photos/seed/sarah/200',
    },
  ];

  if (bcLoading && !bootcamp) {
    return (
      <PageShell>
        <div className="mx-auto max-w-7xl text-sm text-vanguard-muted">Loading bootcamp workspace…</div>
      </PageShell>
    );
  }

  if (!id || !bootcamp) {
    return (
      <PageShell>
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm text-vanguard-muted">Bootcamp not found.</p>
          <Button onClick={() => navigate(adminRoutes.bootcamps)}>Back to registry</Button>
        </div>
      </PageShell>
    );
  }

  const cohortLabel = bootcamp.cohort || bootcamp.batch;
  const progressPct =
    bootcamp.lifecycle === 'Archived' ? 100 : bootcamp.lifecycle === 'Draft' ? 15 : bootcamp.progress;

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate(adminRoutes.bootcamps)}
          className="mb-4 flex items-center text-[10px] font-black uppercase tracking-widest text-vanguard-gray-800 opacity-40 transition-all hover:opacity-100"
        >
          <ArrowLeft size={14} className="mr-2" /> Back to registry
        </button>

        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              {startDate && (
                <Badge variant="upcoming">
                  {startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </Badge>
              )}
              <Badge variant={cohortLabel ? 'upcoming' : 'default'}>{cohortLabel || 'Cohort'}</Badge>
              <Badge variant={lifecycleBadgeVariant(bootcamp.lifecycle)}>{bootcamp.lifecycle}</Badge>
            </div>
            <h1 className="mb-4 text-5xl font-black leading-none tracking-tight text-vanguard-gray-800">
              {bootcamp.name}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-50">
              <div className="flex items-center">
                <MapPin size={14} className="mr-2" /> {divisionName}
              </div>
              {startDate && (
                <div className="flex items-center">
                  <Calendar size={14} className="mr-2" /> Starts {startDate.toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              className="h-11 px-6 text-xs font-black uppercase tracking-widest shadow-lg"
              onClick={() => navigate(adminRoutes.manageBootcamps)}
            >
              <Pencil size={16} className="mr-2" /> Edit cohort
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 px-6 text-xs font-black uppercase tracking-widest"
              disabled={bootcamp.lifecycle === 'Archived'}
              onClick={() => {
                toastConfirm(
                  `Deactivate “${bootcamp.name}”?`,
                  'It will disappear from active lists.',
                  async () => {
                    try {
                      await deactivateBootcamp(bootcamp.id);
                      toast.success('Bootcamp archived.');
                      navigate(adminRoutes.bootcamps);
                    } catch (err: any) {
                      toast.error(err?.response?.data?.message || err?.message || 'Failed.');
                    }
                  },
                  { confirm: 'Deactivate', cancel: 'Cancel' },
                );
              }}
            >
              Archive cohort
            </Button>
          </div>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Learners (reported)"
            value={bootcamp.students}
            icon={<Users size={20} />}
            subtitle={divisionName ? `${divisionName} pillar` : undefined}
          />
          <StatCard
            label="Timeline progress"
            value={`${bootcamp.progress}%`}
            icon={<Clock size={20} />}
            progress={{ current: progressPct, total: 100 }}
          />
          <StatCard
            label="Lead instructor"
            value={bootcamp.leadName ?? '—'}
            subtitle={bootcamp.lifecycle === 'Draft' ? 'Assign a lead to move out of draft' : 'Assigned facilitator'}
            icon={<CheckCircle2 size={20} />}
          />
          <StatCard
            label="Program window"
            value={endDate ? endDate.toLocaleDateString() : '—'}
            icon={<AlertCircle size={20} />}
            subtitle={
              startDate && endDate
                ? `${startDate.toLocaleDateString()} → ${endDate.toLocaleDateString()} • ${bootcamp.duration}`
                : bootcamp.duration
            }
          />
        </div>

        <div className="mb-10 flex space-x-12 overflow-x-auto border-b border-vanguard-gray-200 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                'relative whitespace-nowrap pb-4 text-xs font-black uppercase tracking-widest transition-all',
                activeTab === tab ? 'text-vanguard-blue' : 'text-vanguard-gray-800 opacity-40 hover:opacity-100',
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="bootcamp-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-vanguard-blue"
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'Students' && (
            <motion.div
              key="students"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-vanguard-muted">
                Cohort size (API): {bootcamp.students} — table below is sample layout only
              </p>
              <DataTable columns={studentColumns} data={demoStudents} />
              <div className="mt-8 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-vanguard-gray-800 opacity-40">
                <span>Showing sample rows (instructor tools own roster)</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="rounded border border-vanguard-gray-200 p-1 hover:bg-white"
                    aria-label="Previous page"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <button
                    type="button"
                    className="rotate-180 rounded border border-vanguard-gray-200 p-1 hover:bg-white"
                    aria-label="Next page"
                  >
                    <ArrowLeft size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Curriculum' && (
            <motion.div
              key="curriculum"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {modules.map((mod) => (
                <Card
                  key={mod.id}
                  className="group border-vanguard-gray-100 transition-all hover:border-vanguard-blue/30"
                >
                  <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                    <div className="flex items-center space-x-6">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-vanguard-blue-light text-2xl font-black text-vanguard-blue transition-colors group-hover:bg-vanguard-blue group-hover:text-white">
                        {mod.id}
                      </div>
                      <div>
                        <div className="mb-1 flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-black tracking-tight text-vanguard-gray-800">{mod.name}</h3>
                          <Badge variant={mod.status === 'in progress' ? 'active' : (mod.status as BadgeVariant)}>
                            {mod.status}
                          </Badge>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-40">
                          Module duration: {mod.duration} • Focus: {mod.focus}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-8 border-t border-vanguard-gray-50 pt-4 text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 md:border-t-0 md:pt-0 md:gap-12">
                      {mod.lead && (
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 overflow-hidden rounded-full bg-vanguard-gray-200">
                            <img
                              src={`https://picsum.photos/seed/${encodeURIComponent(mod.lead)}/100`}
                              alt={mod.lead}
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="opacity-60">{mod.lead}</span>
                        </div>
                      )}
                      <div className="flex items-center opacity-60">
                        <CheckCircle2 size={14} className="mr-2 text-green-500" /> {mod.tasks} tasks
                      </div>
                      <div className="flex items-center opacity-60">
                        <Calendar size={14} className="mr-2" /> {mod.status === 'completed' ? 'Finished' : 'Ends'}{' '}
                        {mod.end}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </motion.div>
          )}

          {activeTab === 'Sessions' && (
            <motion.div
              key="sessions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-vanguard-gray-100 p-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-vanguard-blue-light text-vanguard-blue">
                  <Video size={28} />
                </div>
                <h3 className="text-lg font-black text-vanguard-gray-800">Live sessions</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-vanguard-muted">
                  Scheduling and session records stay with the lead instructor workspace — not in admin.
                </p>
              </Card>
            </motion.div>
          )}

          {activeTab === 'Resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-vanguard-gray-100 p-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-vanguard-blue-light text-vanguard-blue">
                  <FolderOpen size={28} />
                </div>
                <h3 className="text-lg font-black text-vanguard-gray-800">Resources</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-vanguard-muted">
                  Materials and files for this cohort are maintained by instructors and helpers.
                </p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
};

export default BootcampWorkspace;
