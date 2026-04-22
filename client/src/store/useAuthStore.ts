import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../api/axiosInstance';
import { ENDPOINTS } from '../api/endpoints';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MENTOR' | 'STUDENT' | 'LEAD_INSTRUCTOR' | 'HELPER_INSTRUCTOR';
  division?: string;
  avatar?: string;
  permissions?: string[];
}

type AppRole = 'admin' | 'student' | 'lead_instructor' | 'helper_instructor';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  role: AppRole | null;
  permissions: string[];
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  loginWithBackend: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
}

const roleMap = {
  Admin: 'ADMIN',
  Instructor: 'MENTOR',
  Student: 'STUDENT',
} as const;

const defaultPermissionsByRole: Record<AppRole, string[]> = {
  admin: ['create_session', 'mark_attendance', 'add_student', 'upload_resource', 'manage_groups', 'grade_assignments'],
  student: [],
  lead_instructor: ['create_session', 'mark_attendance', 'add_student', 'upload_resource', 'manage_groups', 'grade_assignments'],
  helper_instructor: ['upload_resource'],
};

const normalizeAuthProfile = (rawRole?: string, rawPermissions?: string[]) => {
  const normalizedRole = rawRole?.toLowerCase();

  if (normalizedRole === 'admin') {
    return {
      userRole: 'ADMIN' as const,
      role: 'admin' as const,
      permissions: rawPermissions?.length ? rawPermissions : defaultPermissionsByRole.admin,
    };
  }

  if (normalizedRole === 'lead_instructor' || normalizedRole === 'lead instructor') {
    return {
      userRole: 'LEAD_INSTRUCTOR' as const,
      role: 'lead_instructor' as const,
      permissions: rawPermissions?.length ? rawPermissions : defaultPermissionsByRole.lead_instructor,
    };
  }

  if (normalizedRole === 'helper_instructor' || normalizedRole === 'helper instructor') {
    return {
      userRole: 'HELPER_INSTRUCTOR' as const,
      role: 'helper_instructor' as const,
      permissions: rawPermissions?.length ? rawPermissions : defaultPermissionsByRole.helper_instructor,
    };
  }

  if (normalizedRole === 'instructor' || normalizedRole === 'mentor') {
    return {
      userRole: 'MENTOR' as const,
      role: 'lead_instructor' as const,
      permissions: rawPermissions?.length ? rawPermissions : defaultPermissionsByRole.lead_instructor,
    };
  }

  return {
    userRole: 'STUDENT' as const,
    role: 'student' as const,
    permissions: rawPermissions?.length ? rawPermissions : defaultPermissionsByRole.student,
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,
      permissions: [],
      login: (user, token) => {
        const normalizedProfile = normalizeAuthProfile(user.role, user.permissions);
        localStorage.setItem('vanguard_token', token);
        set({
          user: { ...user, permissions: normalizedProfile.permissions },
          token,
          isAuthenticated: true,
          role: normalizedProfile.role,
          permissions: normalizedProfile.permissions,
        });
      },
      logout: () => {
        localStorage.removeItem('vanguard_token');
        set({ user: null, token: null, isAuthenticated: false, role: null, permissions: [] });
      },

      loginWithBackend: async (username: string, password: string) => {
        try {
          const response = await axiosInstance.post(ENDPOINTS.AUTH.LOGIN, { username, password });
          const { user, token, accessToken } = response.data;
          const resolvedToken = token || accessToken;
          const normalizedProfile = normalizeAuthProfile(user?.role, user?.permissions);
          if (!resolvedToken) {
            return { success: false, message: 'Login response did not include a valid token.' };
          }

          const mappedUser = {
            id: user?.id || '',
            name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || 'User',
            email: user?.email || '',
            role: normalizedProfile.userRole || roleMap[user?.role as keyof typeof roleMap] || 'STUDENT',
            permissions: normalizedProfile.permissions,
            avatar: `https://picsum.photos/seed/${encodeURIComponent(user?.username || user?.email || 'user')}/200`,
          };
          localStorage.setItem('vanguard_token', resolvedToken);
          set({
            user: mappedUser,
            token: resolvedToken,
            isAuthenticated: true,
            role: normalizedProfile.role,
            permissions: normalizedProfile.permissions,
          });
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
