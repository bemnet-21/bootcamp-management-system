import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUserStore } from './useUserStore';

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
  authenticate: (email: string, password: string) => boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
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
      authenticate: (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();

        if (
          normalizedEmail === DEFAULT_ADMIN.email &&
          password === DEFAULT_ADMIN.password
        ) {
          localStorage.setItem('vanguard_token', 'default_admin_token');
          set({
            user: {
              id: DEFAULT_ADMIN.id,
              name: DEFAULT_ADMIN.name,
              email: DEFAULT_ADMIN.email,
              role: DEFAULT_ADMIN.role,
              avatar: DEFAULT_ADMIN.avatar,
            },
            token: 'default_admin_token',
            isAuthenticated: true,
          });
          return true;
        }

        const matchedMember = useUserStore.getState().members.find(
          (member) =>
            member.email.toLowerCase() === normalizedEmail &&
            member.temporaryPassword === password
        );

        if (!matchedMember) {
          return false;
        }

        const token = `member_${matchedMember.id}_token`;
        localStorage.setItem('vanguard_token', token);
        set({
          user: {
            id: matchedMember.id,
            name: matchedMember.name,
            email: matchedMember.email,
            role: roleMap[matchedMember.role],
            division: matchedMember.divisionId,
            avatar: matchedMember.avatar,
          },
          token,
          isAuthenticated: true,
        });
        return true;
      },
      login: (user, token) => {
        localStorage.setItem('vanguard_token', token);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('vanguard_token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'vanguard-auth-storage',
    }
  )
);
