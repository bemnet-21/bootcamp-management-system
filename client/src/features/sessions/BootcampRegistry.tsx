import { useDivisionStore } from '@/src/store/useDivisionStore';
import { StatCard } from '@/src/components/shared/StatCard';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { DataTable } from '@/src/components/shared/DataTable';
import { Plus, Filter, Layout, Eye, MoreVertical, TrendingUp, Star, X, Pencil, Trash2, CheckCircle2, Ban } from 'lucide-react';
import PageShell from '@/src/components/layout/PageShell';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useSessionStore } from '@/src/store/useSessionStore';
import axiosInstance from '@/src/api/axiosInstance';
import { ENDPOINTS } from '@/src/api/endpoints';

const asDisplayStatus = (status: 'Scheduled' | 'Cancelled' | 'Completed') => {
  if (status === 'Completed') return 'completed';
  if (status === 'Cancelled') return 'upcoming';
  return 'active';
};

const formatDuration = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  const mins = Math.max(0, Math.round((e.getTime() - s.getTime()) / 60000));
  if (mins < 60) return `${mins} mins`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hrs}h ${rem}m` : `${hrs}h`;
};

const BootcampRegistry = () => {
  const { id: divisionId } = useParams();
  const navigate = useNavigate();
  const { getDivisionById } = useDivisionStore();
  const { sessions, fetchSessions, createSession, updateSession, updateSessionStatus, cancelSession, isLoading, error } = useSessionStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [divisions, setDivisions] = useState<Array<{ id: string; name: string }>>([]);
  const [instructors, setInstructors] = useState<Array<{ id: string; name: string }>>([]);
  const [bootcamps, setBootcamps] = useState<Array<{ id: string; name: string }>>([]);
  const [resolvedDivisionObjectId, setResolvedDivisionObjectId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    division: '',
    instructor: '',
    bootcamp: '',
    startTime: '',
    endTime: '',
    location: '',
  });
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    division: '',
    instructor: '',
    bootcamp: '',
    startTime: '',
    endTime: '',
    location: '',
    status: 'Scheduled' as 'Scheduled' | 'Cancelled' | 'Completed',
  });

  const currentDivision = divisionId ? getDivisionById(divisionId) : null;

  // When viewing inside a division, resolve its real Mongo _id and filter server-side.
  useEffect(() => {
    const matched =
      currentDivision?.name
        ? divisions.find((d) => d.name.toLowerCase() === currentDivision.name.toLowerCase())?.id || null
        : null;
    setResolvedDivisionObjectId(matched);
  }, [currentDivision?.name, divisions]);

  useEffect(() => {
    const params = resolvedDivisionObjectId ? { division: resolvedDivisionObjectId } : undefined;
    fetchSessions(params).catch((e: any) => {
      toast.error(e?.response?.data?.message || e?.message || 'Failed to load sessions');
    });
  }, [fetchSessions, resolvedDivisionObjectId]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    (async () => {
      try {
        const [dRes, iRes, bRes] = await Promise.all([
          axiosInstance.get(ENDPOINTS.DIVISIONS.BASE),
          // Sessions can be assigned to Admin or Instructor.
          axiosInstance.get(ENDPOINTS.USERS.BASE, { params: { limit: 200 } }),
          axiosInstance.get('/admin/bootcamps'),
        ]);
        setDivisions((dRes.data?.data ?? []).map((d: any) => ({ id: d._id, name: d.name })));
        setInstructors(
          (iRes.data?.data ?? [])
            .filter((u: any) => u?.role === 'Instructor' || u?.role === 'Admin')
            .map((u: any) => ({
              id: u._id,
              name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.username || u.email,
            }))
        );
        setBootcamps((bRes.data?.data ?? []).map((b: any) => ({ id: b._id, name: b.name })));
      } catch (e: any) {
        const message = e?.response?.data?.message || e?.message;
        if (message) toast.error(message);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isCreateOpen) return;
    const matchedDivisionId =
      divisions.find((d) => d.name.toLowerCase() === currentDivision?.name?.toLowerCase())?.id || '';
    setForm((prev) => ({
      ...prev,
      division: prev.division || matchedDivisionId || divisions[0]?.id || '',
      instructor: prev.instructor || instructors[0]?.id || '',
      bootcamp: prev.bootcamp || bootcamps[0]?.id || '',
    }));
  }, [isCreateOpen, currentDivision?.name, divisions, instructors, bootcamps]);

  const canSubmit = useMemo(
    () => form.title && form.division && form.instructor && form.bootcamp && form.startTime && form.endTime && form.location,
    [form]
  );
  const canSubmitEdit = useMemo(
    () =>
      editForm.title &&
      editForm.division &&
      editForm.instructor &&
      editForm.bootcamp &&
      editForm.startTime &&
      editForm.endTime &&
      editForm.location,
    [editForm]
  );

  // By requirement: show sessions ONLY for the active division route.
  // We fetch server-side with division=<ObjectId>, so the store is already scoped.
  const filteredBootcamps = sessions;

  const tableData = filteredBootcamps.map((s) => ({
    id: s.id,
    name: s.title,
    duration: formatDuration(s.startTime, s.endTime),
    cohort: new Date(s.startTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    status: asDisplayStatus(s.status),
    students: 0,
    progress: s.status === 'Completed' ? 100 : s.status === 'Cancelled' ? 0 : 50,
    rawStatus: s.status,
  }));

  const columns = [
    { 
      header: 'Program Details', 
      key: 'name',
      render: (item: any) => (
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white bg-vanguard-blue">
             <Layout size={18} />
          </div>
          <div>
            <h4 className="font-black text-vanguard-gray-800 tracking-tight">{item.name}</h4>
            <p className="text-[10px] font-bold text-vanguard-gray-800 opacity-40 uppercase tracking-widest">
               Duration: {item.duration} • Cohort {item.cohort}
            </p>
          </div>
        </div>
      )
    },
    { 
      header: 'Status', 
      key: 'status',
      render: (item: any) => <Badge variant={item.status}>{item.status}</Badge>
    },
    { 
      header: 'Students', 
      key: 'students',
      render: (item: any) => (
        <div className="text-center">
           <p className="font-black text-vanguard-gray-800">{item.students}</p>
           <p className="text-[10px] font-bold text-vanguard-gray-800 opacity-40 uppercase tracking-widest">Enrolled</p>
        </div>
      )
    },
    { 
      header: 'Progress', 
      key: 'progress',
      render: (item: any) => (
        <div className="flex items-center space-x-4 w-48">
          <div className="h-1.5 flex-1 bg-vanguard-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-vanguard-blue"
              style={{ width: `${item.progress}%` }}
            />
          </div>
          <span className="text-[10px] font-black text-vanguard-gray-800 min-w-[30px]">{item.progress}%</span>
        </div>
      )
    },
    { 
      header: 'Actions', 
      key: 'actions',
      align: 'center' as const,
      render: (item: any) => (
        <div className="flex items-center justify-center space-x-2 relative">
           <button 
             onClick={(e) => {
               e.stopPropagation();
               navigate(`/bootcamps/${item.id}`);
             }}
             className="p-2 hover:bg-vanguard-gray-100 rounded-lg text-vanguard-gray-800 opacity-40 hover:opacity-100 transition-all"
           >
              <Eye size={18} />
           </button>
           <button
             onClick={(e) => {
               e.stopPropagation();
               setActiveMenu(activeMenu === item.id ? null : item.id);
             }}
             className="p-2 hover:bg-vanguard-gray-100 rounded-lg text-vanguard-gray-800 opacity-40 hover:opacity-100 transition-all"
           >
              <MoreVertical size={18} />
           </button>

           {activeMenu === item.id && (
             <>
               <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
               <div className="absolute right-0 top-10 w-56 bg-white rounded-xl shadow-xl border border-vanguard-gray-100 py-2 z-20 text-left">
                 <button
                   onClick={() => {
                     navigate(`/bootcamps/${item.id}`);
                     setActiveMenu(null);
                   }}
                   className="w-full flex items-center px-4 py-2.5 text-sm text-vanguard-gray-800 hover:bg-vanguard-gray-50 transition-colors"
                 >
                   <Eye size={16} className="mr-3 text-vanguard-muted" /> View Session
                 </button>
                 <button
                   onClick={() => {
                     const s = sessions.find((x) => x.id === item.id);
                     if (s) {
                       setEditForm({
                         title: s.title,
                         description: s.description || '',
                         division: s.divisionId || '',
                         instructor: s.instructorId || '',
                         bootcamp: s.bootcampId || '',
                         startTime: s.startTime ? new Date(s.startTime).toISOString().slice(0, 16) : '',
                         endTime: s.endTime ? new Date(s.endTime).toISOString().slice(0, 16) : '',
                         location: s.location,
                         status: s.status,
                       });
                       setEditingId(item.id);
                     }
                     setActiveMenu(null);
                   }}
                   className="w-full flex items-center px-4 py-2.5 text-sm text-vanguard-gray-800 hover:bg-vanguard-gray-50 transition-colors"
                 >
                   <Pencil size={16} className="mr-3 text-vanguard-muted" /> Edit Session
                 </button>
                 <button
                   onClick={async () => {
                     try {
                       await updateSessionStatus(item.id, 'Completed');
                       toast.success('Session marked completed.');
                     } catch (e: any) {
                       toast.error(e?.response?.data?.message || e?.message || 'Failed to update status.');
                     } finally {
                       setActiveMenu(null);
                     }
                   }}
                   className="w-full flex items-center px-4 py-2.5 text-sm text-vanguard-gray-800 hover:bg-vanguard-gray-50 transition-colors"
                 >
                   <CheckCircle2 size={16} className="mr-3 text-vanguard-muted" /> Mark Completed
                 </button>
                 <div className="h-px bg-vanguard-gray-100 my-1" />
                 <button
                   onClick={async () => {
                     try {
                       await cancelSession(item.id);
                       toast.success('Session cancelled.');
                     } catch (e: any) {
                       toast.error(e?.response?.data?.message || e?.message || 'Failed to cancel session.');
                     } finally {
                       setActiveMenu(null);
                     }
                   }}
                   className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                 >
                   <Trash2 size={16} className="mr-3" /> Cancel (Delete)
                 </button>
               </div>
             </>
           )}
        </div>
      )
    },
  ];

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-vanguard-gray-800 opacity-50 mb-1">
              {currentDivision ? `${currentDivision.name} Pillar` : 'Vanguard Registry'}
            </p>
            <h1 className="text-4xl font-black text-vanguard-gray-800 tracking-tight tracking-tighter">Bootcamps</h1>
          </div>
          <div className="flex space-x-3">
             <Button className="rounded-lg h-10 px-6 uppercase tracking-widest text-xs font-black" onClick={() => setIsCreateOpen(true)}>
                <Plus size={16} className="mr-2" /> Add Program
             </Button>
             <Button variant="outline" className="rounded-lg h-10 px-4 flex items-center bg-vanguard-blue-light border-none text-vanguard-blue">
                <Filter size={16} className="mr-2" /> Filter
             </Button>
          </div>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
           <Card className="flex items-center justify-between p-8">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-vanguard-gray-800 opacity-50 mb-1">Pillar Capacity</p>
                 <h2 className="text-4xl font-black text-[#003B7A]">
                    {filteredBootcamps.length.toLocaleString()}
                 </h2>
              </div>
              <div className="w-12 h-12 bg-vanguard-blue-light rounded-xl flex items-center justify-center text-vanguard-blue">
                 <TrendingUp size={24} />
              </div>
           </Card>
           <div className="grid grid-cols-2 gap-8 lg:col-span-2">
              <Card className="flex flex-col justify-center items-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-vanguard-gray-800 opacity-50 mb-1">Avg. Retention</p>
                 <h2 className="text-3xl font-black text-vanguard-gray-800">94%</h2>
              </Card>
              <Card className="flex items-center justify-between">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-vanguard-gray-800 opacity-50 mb-1">Success Rate</p>
                    <h2 className="text-3xl font-black text-vanguard-gray-800">88%</h2>
                 </div>
                 <div className="w-12 h-12 bg-[#FFF0E6] rounded-xl flex items-center justify-center text-[#E67E22]">
                    <Star size={24} />
                 </div>
              </Card>
           </div>
        </div>

        <DataTable 
          columns={columns} 
          data={tableData}
          onRowClick={(item: any) => navigate(`/bootcamps/${item.id}`)}
        />
        {isLoading && <p className="text-sm text-vanguard-muted mt-4">Loading sessions...</p>}
        {!isLoading && currentDivision && filteredBootcamps.length === 0 && (
          <p className="text-[11px] font-bold uppercase tracking-widest text-vanguard-muted mt-4">
            No sessions found for this division.
          </p>
        )}

        {isCreateOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
            <div className="relative bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-vanguard-gray-100">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-vanguard-gray-800 opacity-50 mb-1">
                    Sessions Workspace
                  </p>
                  <h3 className="text-2xl font-black text-vanguard-gray-800 tracking-tight">Add Program Session</h3>
                </div>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-2 rounded-lg text-vanguard-muted hover:text-vanguard-gray-800 hover:bg-vanguard-gray-50 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-60">
                    Program / Session Title
                  </label>
                  <input
                    className="w-full h-11 px-4 bg-vanguard-blue-light/40 border border-vanguard-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue outline-none"
                    placeholder="e.g. Frontend Architecture Review"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-60">
                    Brief Description
                  </label>
                  <input
                    className="w-full h-11 px-4 bg-vanguard-blue-light/40 border border-vanguard-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue outline-none"
                    placeholder="Optional overview"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-60">Division</label>
                    <select className="w-full h-11 px-3 bg-vanguard-blue-light/40 border border-vanguard-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue outline-none" value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })}>
                      <option value="">Select division</option>
                      {divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-60">Instructor</label>
                    <select className="w-full h-11 px-3 bg-vanguard-blue-light/40 border border-vanguard-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue outline-none" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })}>
                      <option value="">Select instructor</option>
                      {instructors.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-60">Bootcamp</label>
                    <select className="w-full h-11 px-3 bg-vanguard-blue-light/40 border border-vanguard-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue outline-none" value={form.bootcamp} onChange={(e) => setForm({ ...form, bootcamp: e.target.value })}>
                      <option value="">Select bootcamp</option>
                      {bootcamps.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-60">Start Date & Time</label>
                    <input className="w-full h-11 px-3 bg-vanguard-blue-light/40 border border-vanguard-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue outline-none" type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-60">End Date & Time</label>
                    <input className="w-full h-11 px-3 bg-vanguard-blue-light/40 border border-vanguard-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue outline-none" type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-60">
                    Location
                  </label>
                  <input
                    className="w-full h-11 px-4 bg-vanguard-blue-light/40 border border-vanguard-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue outline-none"
                    placeholder="e.g. Lab A - Block 3"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-vanguard-gray-100">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="h-11 px-6 uppercase tracking-widest text-[11px] font-black">
                  Cancel
                </Button>
                <Button
                  disabled={!canSubmit}
                  className="h-11 px-6 uppercase tracking-widest text-[11px] font-black disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={async () => {
                    try {
                      const start = new Date(form.startTime);
                      const end = new Date(form.endTime);
                      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                        toast.error('Please provide a valid start/end date & time.');
                        return;
                      }
                      await createSession({
                        ...form,
                        startTime: start.toISOString(),
                        endTime: end.toISOString(),
                        status: 'Scheduled',
                      });
                      // Refetch so populated division/instructor names appear
                      // (create response doesn't populate refs, which breaks division filtering)
                      await fetchSessions();
                      toast.success('Program session created');
                      setIsCreateOpen(false);
                    } catch (e: any) {
                      toast.error(e?.response?.data?.message || e?.message || 'Failed to create program');
                    }
                  }}
                >
                  Initialize Program
                </Button>
              </div>
            </div>
          </div>
        )}

        {editingId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingId(null)} />
            <div className="relative bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-vanguard-gray-100">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-vanguard-gray-800 opacity-50 mb-1">
                    Sessions Workspace
                  </p>
                  <h3 className="text-2xl font-black text-vanguard-gray-800 tracking-tight">Edit Program Session</h3>
                </div>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-2 rounded-lg text-vanguard-muted hover:text-vanguard-gray-800 hover:bg-vanguard-gray-50 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-60">
                    Program / Session Title
                  </label>
                  <input
                    className="w-full h-11 px-4 bg-vanguard-blue-light/40 border border-vanguard-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue outline-none"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-60">
                    Brief Description
                  </label>
                  <input
                    className="w-full h-11 px-4 bg-vanguard-blue-light/40 border border-vanguard-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue outline-none"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-60">Division</label>
                    <select className="w-full h-11 px-3 bg-vanguard-blue-light/40 border border-vanguard-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue outline-none" value={editForm.division} onChange={(e) => setEditForm({ ...editForm, division: e.target.value })}>
                      <option value="">Select division</option>
                      {divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-60">Instructor</label>
                    <select className="w-full h-11 px-3 bg-vanguard-blue-light/40 border border-vanguard-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue outline-none" value={editForm.instructor} onChange={(e) => setEditForm({ ...editForm, instructor: e.target.value })}>
                      <option value="">Select instructor</option>
                      {instructors.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-60">Bootcamp</label>
                    <select className="w-full h-11 px-3 bg-vanguard-blue-light/40 border border-vanguard-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue outline-none" value={editForm.bootcamp} onChange={(e) => setEditForm({ ...editForm, bootcamp: e.target.value })}>
                      <option value="">Select bootcamp</option>
                      {bootcamps.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-60">Start Date & Time</label>
                    <input className="w-full h-11 px-3 bg-vanguard-blue-light/40 border border-vanguard-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue outline-none" type="datetime-local" value={editForm.startTime} onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-60">End Date & Time</label>
                    <input className="w-full h-11 px-3 bg-vanguard-blue-light/40 border border-vanguard-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue outline-none" type="datetime-local" value={editForm.endTime} onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-60">Location</label>
                    <input className="w-full h-11 px-4 bg-vanguard-blue-light/40 border border-vanguard-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue outline-none" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-60">Status</label>
                    <select className="w-full h-11 px-3 bg-vanguard-blue-light/40 border border-vanguard-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue outline-none" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-vanguard-gray-100">
                <Button variant="outline" onClick={() => setEditingId(null)} className="h-11 px-6 uppercase tracking-widest text-[11px] font-black">
                  Cancel
                </Button>
                <Button
                  disabled={!canSubmitEdit}
                  className="h-11 px-6 uppercase tracking-widest text-[11px] font-black disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={async () => {
                    try {
                      const start = new Date(editForm.startTime);
                      const end = new Date(editForm.endTime);
                      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                        toast.error('Please provide a valid start/end date & time.');
                        return;
                      }
                      await updateSession(editingId, {
                        title: editForm.title,
                        description: editForm.description || undefined,
                        division: editForm.division,
                        instructor: editForm.instructor,
                        bootcamp: editForm.bootcamp,
                        startTime: start.toISOString(),
                        endTime: end.toISOString(),
                        location: editForm.location,
                        status: editForm.status,
                      });
                      await fetchSessions();
                      toast.success('Session updated');
                      setEditingId(null);
                    } catch (e: any) {
                      toast.error(e?.response?.data?.message || e?.message || 'Failed to update session');
                    }
                  }}
                >
                  Commit Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default BootcampRegistry;
