import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// import { useUserStore } from './useUserStore';
import axiosInstance from '../api/axiosInstance';
import { ENDPOINTS } from '../api/endpoints';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MENTOR' | 'STUDENT';
  division?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  loginWithBackend: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
}

const DEFAULT_ADMIN = {
  id: '1',
  name: 'Admin Portal',
  email: 'admin@vanguard.edu',
  role: 'ADMIN' as const,
  avatar: 'https://picsum.photos/seed/admin/200',
  password: 'vanguard-admin',
};

const roleMap = {
  Admin: 'ADMIN',
  Instructor: 'MENTOR',
  Student: 'STUDENT',
} as const;

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
          const { user, token } = response.data;
          localStorage.setItem('vanguard_token', token);
          set({ user, token, isAuthenticated: true });
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
