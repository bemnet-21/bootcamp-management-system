import { create } from 'zustand';
import axiosInstance from '@/src/api/axiosInstance';
import { ENDPOINTS } from '@/src/api/endpoints';

export interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Instructor' | 'Student';
  divisionId: string; // UI-friendly label (division name if available)
  divisionIds?: string[]; // raw backend division ObjectIds
  joinedDate: string;
  status: 'Active' | 'Suspended' | 'Graduated';
  avatar: string;
  specialization?: string;
  rating?: number;
  experience?: number;
  temporaryPassword?: string;
  mustResetPassword?: boolean;
}

interface UserState {
  members: Member[];
  isLoading: boolean;
  error: string | null;
  /** Pass `division` to filter server-side (ObjectId). Omit for all members. */
  fetchMembers: (params?: { division?: string; role?: string; limit?: number }) => Promise<void>;
  addMember: (member: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    role: Member['role'];
    divisions: string[]; // backend division ObjectIds
    status?: Member['status'];
  }) => Promise<Member>;
  updateMember: (
    id: string,
    updates: Partial<{
      firstName: string;
      lastName: string;
      username: string;
      email: string;
      role: Member['role'];
      divisions: string[];
      status: Member['status'];
      password: string;
    }>
  ) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  toggleStatus: (id: string) => Promise<void>;
  getMembersByDivision: (divisionId: string) => Member[];
}

type BackendDivision = { _id: string; name?: string };
type BackendUser = {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: Member['role'];
  status: Member['status'];
  divisions?: (string | BackendDivision)[];
  createdAt?: string;
};

function formatJoinedDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function mapBackendUserToMember(u: BackendUser): Member {
  const divisions = Array.isArray(u.divisions) ? u.divisions : [];
  const divisionIds = divisions
    .map((d) => (typeof d === 'string' ? d : d?._id))
    .filter(Boolean) as string[];
  const divisionNames = divisions
    .map((d) => (typeof d === 'string' ? undefined : d?.name))
    .filter(Boolean) as string[];
  const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.username || u.email;
  const divisionLabel =
    divisionNames.length > 0 ? divisionNames.join(', ') : divisionIds.length > 0 ? divisionIds.join(', ') : '—';

  return {
    id: u._id,
    name,
    email: u.email,
    role: u.role,
    divisionId: divisionLabel,
    divisionIds,
    joinedDate: formatJoinedDate(u.createdAt),
    status: u.status,
    avatar: `https://picsum.photos/seed/${encodeURIComponent(u.username || u.email)}/200`,
  };
}

export const useUserStore = create<UserState>((set, get) => ({
  members: [],
  isLoading: false,
  error: null,

  fetchMembers: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const limit = params?.limit ?? 100;
      const res = await axiosInstance.get(ENDPOINTS.USERS.BASE, {
        params: {
          limit,
          ...(params?.division ? { division: params.division } : {}),
          ...(params?.role ? { role: params.role } : {}),
        },
      });
      const users: BackendUser[] = res.data?.data ?? [];
      set({ members: users.map(mapBackendUserToMember), isLoading: false });
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load members.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  addMember: async (payload) => {
    set({ error: null });
    const body = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      divisions: payload.divisions,
      status: payload.status || 'Active',
    };
    const res = await axiosInstance.post(ENDPOINTS.USERS.BASE, body);
    const created: BackendUser = res.data?.data;
    const member = mapBackendUserToMember(created);
    set((state) => ({ members: [member, ...state.members] }));
    return member;
  },

  updateMember: async (id, updates) => {
    set({ error: null });
    const res = await axiosInstance.patch(ENDPOINTS.USERS.DETAIL(id), updates);
    const updated: BackendUser = res.data?.data;
    const member = mapBackendUserToMember(updated);
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, ...member } : m)),
    }));
  },

  deleteMember: async (id) => {
    set({ error: null });
    await axiosInstance.delete(ENDPOINTS.USERS.DETAIL(id));
    set((state) => ({ members: state.members.filter((m) => m.id !== id) }));
  },

  toggleStatus: async (id) => {
    const current = get().members.find((m) => m.id === id);
    if (!current) return;
    const nextStatus: Member['status'] = current.status === 'Suspended' ? 'Active' : 'Suspended';
    const res = await axiosInstance.patch(ENDPOINTS.USERS.STATUS(id), { status: nextStatus });
    const updated: BackendUser = res.data?.data;
    const member = mapBackendUserToMember(updated);
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, ...member } : m)),
    }));
  },

  getMembersByDivision: (divisionId) =>
    get().members.filter((m) => m.divisionIds?.includes(divisionId) || m.divisionId === divisionId),
}));
