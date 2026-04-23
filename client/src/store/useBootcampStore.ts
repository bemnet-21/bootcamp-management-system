import { create } from 'zustand';
import axiosInstance from '@/src/api/axiosInstance';
import { ENDPOINTS } from '@/src/api/endpoints';

/** UI lifecycle (server has isActive + optional lead only). */
export type BootcampLifecycle = 'Draft' | 'Active' | 'Archived';

export interface Bootcamp {
  id: string;
  name: string;
  divisionId: string;
  description: string;
  batch: string;
  /** Count of enrolled students (same length as studentIds when API sends full roster). */
  students: number;
  /** User ObjectIds enrolled in this cohort (for member directory integration). */
  studentIds: string[];
  progress: number;
  /** Badge variant key used by BootcampRegistry */
  status: 'active' | 'upcoming' | 'completed';
  lifecycle: BootcampLifecycle;
  duration: string;
  cohort: string;
  startDate: string;
  endDate: string;
  leadInstructorId: string | null;
  leadName: string | null;
  isActive: boolean;
}

function formatDuration(start: Date, end: Date): string {
  const ms = end.getTime() - start.getTime();
  if (ms <= 0) return '—';
  const weeks = Math.max(1, Math.round(ms / (7 * 24 * 60 * 60 * 1000)));
  return `${weeks} wk`;
}

function deriveLifecycle(isActive: boolean, hasLead: boolean): BootcampLifecycle {
  if (!isActive) return 'Archived';
  if (!hasLead) return 'Draft';
  return 'Active';
}

function lifecycleToBadge(l: BootcampLifecycle): Bootcamp['status'] {
  if (l === 'Archived') return 'completed';
  if (l === 'Draft') return 'upcoming';
  return 'active';
}

function mapApiBootcamp(b: any): Bootcamp {
  const divRef = b.division_id;
  const divisionId =
    typeof divRef === 'object' && divRef != null
      ? String(divRef._id ?? divRef)
      : String(divRef ?? '');
  const lead = b.leadInstructor;
  const leadId =
    lead && typeof lead === 'object' && lead._id != null
      ? String(lead._id)
      : lead
        ? String(lead)
        : null;
  const leadName =
    lead && typeof lead === 'object' && (lead.firstName || lead.lastName)
      ? [lead.firstName, lead.lastName].filter(Boolean).join(' ').trim()
      : null;
  const start = new Date(b.startDate);
  const end = new Date(b.endDate);
  const now = Date.now();
  let progress = 0;
  if (now >= end.getTime()) progress = 100;
  else if (now <= start.getTime()) progress = 0;
  else {
    progress = Math.round(((now - start.getTime()) / (end.getTime() - start.getTime())) * 100);
  }
  const isActive = b.isActive !== false;
  const lifecycle = deriveLifecycle(isActive, !!leadId);
  const studentIds: string[] = [];
  if (Array.isArray(b.students)) {
    for (const s of b.students) {
      if (s != null && typeof s === 'object' && '_id' in s) studentIds.push(String((s as { _id: string })._id));
      else if (s != null) studentIds.push(String(s));
    }
  }
  const students = studentIds.length;
  return {
    id: String(b._id),
    name: b.name,
    divisionId,
    description: b.description || '',
    batch: String(start.getFullYear()),
    cohort: `${start.getFullYear()}.${String.fromCharCode(65 + (start.getMonth() % 6))}`,
    students,
    studentIds,
    progress,
    status: lifecycleToBadge(lifecycle),
    lifecycle,
    duration: formatDuration(start, end),
    startDate: b.startDate,
    endDate: b.endDate,
    leadInstructorId: leadId,
    leadName,
    isActive,
  };
}

interface BootcampState {
  bootcamps: Bootcamp[];
  isLoading: boolean;
  error: string | null;
  fetchBootcamps: () => Promise<void>;
  getBootcampsByDivision: (divisionId: string) => Bootcamp[];
  createBootcamp: (payload: {
    name: string;
    division_id: string;
    description?: string;
    startDate: string;
    endDate: string;
    leadInstructor: string;
  }) => Promise<void>;
  updateBootcamp: (
    id: string,
    payload: Partial<{
      name: string;
      division_id: string;
      description: string;
      startDate: string;
      endDate: string;
      leadInstructor: string;
    }>,
  ) => Promise<void>;
  deactivateBootcamp: (id: string) => Promise<void>;
  assignLeadInstructor: (id: string, instructorId: string) => Promise<void>;
}

export const useBootcampStore = create<BootcampState>((set, get) => ({
  bootcamps: [],
  isLoading: false,
  error: null,

  fetchBootcamps: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get(ENDPOINTS.BOOTCAMPS.BASE);
      const rows = res.data?.data ?? [];
      set({ bootcamps: rows.map(mapApiBootcamp), isLoading: false });
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || 'Failed to load bootcamps.';
      set({ isLoading: false, error: message });
      throw e;
    }
  },

  getBootcampsByDivision: (divisionId) =>
    get().bootcamps.filter((b) => b.divisionId === divisionId),

  createBootcamp: async (payload) => {
    set({ error: null });
    await axiosInstance.post(ENDPOINTS.BOOTCAMPS.BASE, payload);
    await get().fetchBootcamps();
  },

  updateBootcamp: async (id, payload) => {
    set({ error: null });
    await axiosInstance.put(ENDPOINTS.BOOTCAMPS.DETAIL(id), payload);
    await get().fetchBootcamps();
  },

  deactivateBootcamp: async (id) => {
    set({ error: null });
    await axiosInstance.patch(ENDPOINTS.BOOTCAMPS.DEACTIVATE(id));
    await get().fetchBootcamps();
  },

  assignLeadInstructor: async (id, instructorId) => {
    set({ error: null });
    await axiosInstance.patch(ENDPOINTS.BOOTCAMPS.ASSIGN_LEAD(id), { instructorId });
    await get().fetchBootcamps();
  },
}));
