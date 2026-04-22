import { create } from 'zustand';
import axiosInstance from '@/src/api/axiosInstance';
import { ENDPOINTS } from '@/src/api/endpoints';
import {
  divisionDefaultHead,
  divisionHeroImage,
  divisionVisualKeyFromName,
  type DivisionVisualKey,
} from '@/src/lib/divisionPresentation';

interface DivisionHead {
  name: string;
  avatar: string;
  role: string;
  bio: string;
}

interface DivisionStats {
  members: number;
  activeBootcamps: number;
  satisfaction: number;
  memberTrend: string;
}

export interface Division {
  id: string;
  name: string;
  description: string;
  image: string;
  head: DivisionHead;
  stats: DivisionStats;
  /** Derived from name for theming (Data Science, Development, Cybersecurity, CPD). */
  visualKey: DivisionVisualKey;
}

type ApiDivisionRow = {
  _id: string;
  name: string;
  description?: string;
  studentCount?: number;
  sessionCount?: number;
  groupCount?: number;
  resourceCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

function mapRowToDivision(row: ApiDivisionRow): Division {
  const id = String(row._id);
  const visualKey = divisionVisualKeyFromName(row.name || '');
  const head = divisionDefaultHead(visualKey);
  return {
    id,
    name: row.name,
    description: row.description?.trim() || '',
    image: divisionHeroImage(visualKey),
    head,
    visualKey,
    stats: {
      members: Number(row.studentCount ?? 0),
      activeBootcamps: 0,
      satisfaction: 94,
      memberTrend: '—',
    },
  };
}

interface DivisionState {
  divisions: Division[];
  activeDivision: Division | null;
  isLoading: boolean;
  error: string | null;
  setActiveDivision: (division: Division | null) => void;
  getDivisionById: (id: string) => Division | undefined;
  fetchDivisions: () => Promise<void>;
  ensureDivision: (id: string) => Promise<Division | undefined>;
  createDivision: (payload: { name: string; description?: string }) => Promise<void>;
  updateDivision: (id: string, payload: { name?: string; description?: string }) => Promise<void>;
  deleteDivision: (id: string) => Promise<void>;
}

export const useDivisionStore = create<DivisionState>((set, get) => ({
  divisions: [],
  activeDivision: null,
  isLoading: false,
  error: null,

  setActiveDivision: (division) => set({ activeDivision: division }),

  getDivisionById: (id) => get().divisions.find((d) => d.id === id),

  fetchDivisions: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get(ENDPOINTS.DIVISIONS.BASE, { params: { limit: 200 } });
      const rows: ApiDivisionRow[] = res.data?.data ?? [];
      set({
        divisions: rows.map(mapRowToDivision),
        isLoading: false,
      });
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || 'Failed to load divisions.';
      set({ isLoading: false, error: message });
      throw e;
    }
  },

  ensureDivision: async (id) => {
    const existing = get().getDivisionById(id);
    if (existing) return existing;
    try {
      const res = await axiosInstance.get(ENDPOINTS.DIVISIONS.DETAIL(id));
      const row: ApiDivisionRow | undefined = res.data?.data;
      if (!row || !row.name) return undefined;
      const div = mapRowToDivision({ ...row, _id: row._id || id });
      set((s) => {
        if (s.divisions.some((d) => d.id === div.id)) return s;
        return { divisions: [...s.divisions, div] };
      });
      return div;
    } catch {
      return undefined;
    }
  },

  createDivision: async ({ name, description }) => {
    set({ error: null });
    await axiosInstance.post(ENDPOINTS.DIVISIONS.BASE, {
      name: name.trim(),
      description: description?.trim(),
    });
    await get().fetchDivisions();
  },

  updateDivision: async (id, payload) => {
    set({ error: null });
    await axiosInstance.put(ENDPOINTS.DIVISIONS.DETAIL(id), {
      ...(payload.name != null ? { name: payload.name.trim() } : {}),
      ...(payload.description != null ? { description: payload.description.trim() } : {}),
    });
    await get().fetchDivisions();
    const updated = get().getDivisionById(id);
    if (updated && get().activeDivision?.id === id) {
      set({ activeDivision: updated });
    }
  },

  deleteDivision: async (id) => {
    set({ error: null });
    await axiosInstance.delete(ENDPOINTS.DIVISIONS.DETAIL(id));
    set((s) => ({
      divisions: s.divisions.filter((d) => d.id !== id),
      activeDivision: s.activeDivision?.id === id ? null : s.activeDivision,
    }));
  },
}));
