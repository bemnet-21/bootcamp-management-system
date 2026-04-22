import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../api/axiosInstance';
import { ENDPOINTS } from '../api/endpoints';

export interface AuthUser {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'ADMIN' | 'MENTOR' | 'STUDENT';
  division?: string;
  divisions?: any[];
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  loginWithBackend: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
}

const roleMap = {
  Admin: 'ADMIN',
  Instructor: 'MENTOR',
  Student: 'STUDENT',
} as const;

function mapApiUserToAuthUser(raw: any): AuthUser {
  const id = String(raw?.id ?? raw?._id ?? '');
  const firstName = raw?.firstName ? String(raw.firstName) : undefined;
  const lastName = raw?.lastName ? String(raw.lastName) : undefined;
  const name =
    [firstName, lastName].filter(Boolean).join(' ').trim() ||
    raw?.username ||
    raw?.email ||
    'User';
  const backendRole = raw?.role as keyof typeof roleMap | string | undefined;
  const role = (backendRole && roleMap[backendRole as keyof typeof roleMap]) || 'STUDENT';
  return {
    id,
    name,
    firstName,
    lastName,
    email: raw?.email || '',
    role,
    division: raw?.division ?? undefined,
    divisions: raw?.divisions ?? undefined,
    avatar: `https://picsum.photos/seed/${encodeURIComponent(raw?.username || raw?.email || 'user')}/200`,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        localStorage.setItem('vanguard_token', token);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('vanguard_token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      loginWithBackend: async (username: string, password: string) => {
        try {
          const response = await axiosInstance.post(ENDPOINTS.AUTH.LOGIN, { username, password });
          const { user: userData, accessToken } = response.data;
          if (!accessToken) {
            return { success: false, message: 'Login response did not include a valid token.' };
          }
          const mappedUser = mapApiUserToAuthUser(userData);
          localStorage.setItem('vanguard_token', accessToken);
          set({ user: mappedUser, token: accessToken, isAuthenticated: true });
          return { success: true };
        } catch (error: any) {
          let message = 'Login failed. Please try again.';
          if (error.response) {
            if (error.response.status === 401) {
              message = 'Incorrect username or password. Please check your credentials.';
            } else if (error.response.status === 403) {
              message = 'Your account is not authorized to access this system.';
            } else if (error.response.status === 429) {
              message = 'Too many login attempts. Please wait and try again.';
            } else if (error.response.data?.message) {
              message = error.response.data.message;
            }
          } else if (error.request) {
            message = 'Unable to connect to the server. Please check your internet connection.';
          }
          return { success: false, message };
        }
      },
    }),
    {
      name: 'vanguard-auth-storage',
    }
  )
);

export const isStaffRole = (role: AuthUser['role'] | undefined) => role === 'ADMIN' || role === 'MENTOR';
