import { create } from 'zustand';
import axiosInstance from '@/src/api/axiosInstance';
import { ENDPOINTS } from '@/src/api/endpoints';

export type SessionStatus = 'Scheduled' | 'Cancelled' | 'Completed';

export interface SessionItem {
  id: string;
  title: string;
  description?: string;
  instructorName: string;
  instructorId?: string;
  divisionName: string;
  divisionId?: string;
  bootcampId?: string;
  startTime: string;
  endTime: string;
  location: string;
  status: SessionStatus;
}

type BackendRef = string | { _id?: string; name?: string; firstName?: string; lastName?: string; username?: string };
type BackendSession = {
  _id: string;
  title: string;
  description?: string;
  instructor?: BackendRef;
  division?: BackendRef;
  bootcamp?: BackendRef;
  startTime: string;
  endTime: string;
  location: string;
  status: SessionStatus;
};

interface SessionState {
  sessions: SessionItem[];
  currentSession: SessionItem | null;
  isLoading: boolean;
  error: string | null;
  fetchSessions: (params?: { division?: string }) => Promise<void>;
  createSession: (payload: {
    title: string;
    description?: string;
    instructor: string;
    division: string;
    bootcamp: string;
    startTime: string;
    endTime: string;
    location: string;
    status?: SessionStatus;
  }) => Promise<void>;
  fetchSessionById: (id: string) => Promise<void>;
  updateSession: (
    id: string,
    updates: Partial<{
      title: string;
      description?: string;
      instructor: string;
      division: string;
      bootcamp: string;
      startTime: string;
      endTime: string;
      location: string;
      status: SessionStatus;
    }>
  ) => Promise<void>;
  updateSessionStatus: (id: string, status: SessionStatus) => Promise<void>;
  cancelSession: (id: string) => Promise<void>;
}

function refId(ref?: BackendRef) {
  return typeof ref === 'string' ? ref : ref?._id;
}

function instructorName(ref?: BackendRef) {
  if (!ref) return 'Unassigned';
  if (typeof ref === 'string') return ref;
  const full = [ref.firstName, ref.lastName].filter(Boolean).join(' ').trim();
  return full || ref.username || 'Unassigned';
}

function divisionName(ref?: BackendRef) {
  if (!ref) return 'Unknown Division';
  return typeof ref === 'string' ? ref : ref.name || 'Unknown Division';
}

function mapSession(s: BackendSession): SessionItem {
  return {
    id: s._id,
    title: s.title,
    description: s.description,
    instructorName: instructorName(s.instructor),
    instructorId: refId(s.instructor),
    divisionName: divisionName(s.division),
    divisionId: refId(s.division),
    bootcampId: refId(s.bootcamp),
    startTime: s.startTime,
    endTime: s.endTime,
    location: s.location,
    status: s.status,
  };
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,

  fetchSessions: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get(ENDPOINTS.SESSIONS.BASE, { params });
      const sessions: BackendSession[] = res.data?.sessions ?? [];
      set({ sessions: sessions.map(mapSession), isLoading: false });
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load sessions.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  createSession: async (payload) => {
    const res = await axiosInstance.post(ENDPOINTS.SESSIONS.BASE, {
      ...payload,
      status: payload.status || 'Scheduled',
    });
    const created: BackendSession | undefined = res.data?.data;
    if (!created) return;
    const mapped = mapSession(created);
    set((state) => ({ sessions: [mapped, ...state.sessions] }));
  },

  fetchSessionById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get(ENDPOINTS.SESSIONS.DETAIL(id));
      const session: BackendSession | undefined = res.data?.session;
      set({ currentSession: session ? mapSession(session) : null, isLoading: false });
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load session.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  updateSession: async (id, updates) => {
    const res = await axiosInstance.patch(ENDPOINTS.SESSIONS.DETAIL(id), updates);
    const updated: BackendSession | undefined = res.data?.session;
    if (!updated) return;
    const mapped = mapSession(updated);
    set((state) => ({
      currentSession: state.currentSession?.id === id ? mapped : state.currentSession,
      sessions: state.sessions.map((s) => (s.id === id ? mapped : s)),
    }));
  },

  updateSessionStatus: async (id, status) => {
    const res = await axiosInstance.patch(ENDPOINTS.SESSIONS.DETAIL(id), { status });
    const updated: BackendSession | undefined = res.data?.session;
    if (!updated) return;
    const mapped = mapSession(updated);
    set((state) => ({
      currentSession: state.currentSession?.id === id ? mapped : state.currentSession,
      sessions: state.sessions.map((s) => (s.id === id ? mapped : s)),
    }));
  },

  cancelSession: async (id) => {
    const res = await axiosInstance.delete(ENDPOINTS.SESSIONS.DETAIL(id));
    const cancelled: BackendSession | undefined = res.data?.session;
    if (!cancelled) return;
    const mapped = mapSession(cancelled);
    set((state) => ({
      currentSession: state.currentSession?.id === id ? mapped : state.currentSession,
      sessions: state.sessions.map((s) => (s.id === id ? mapped : s)),
    }));
  },
}));

