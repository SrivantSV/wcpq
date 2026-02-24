import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  hasPermission: (resource: string, action: string) => boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, Record<string, string[]>> = {
  admin: { all: ['create', 'read', 'update', 'delete', 'approve'] },
  approver: {
    job_orders: ['read', 'approve'],
    estimates: ['read', 'approve'],
    approvals: ['read', 'approve'],
    reports: ['read'],
    settings: ['read'],
  },
  finance: {
    invoices: ['create', 'read', 'update'],
    payments: ['create', 'read', 'update'],
    reports: ['read'],
    settings: ['read'],
  },
  maker: {
    job_orders: ['create', 'read', 'update'],
    estimates: ['create', 'read', 'update'],
    execution: ['read', 'update'],
    reports: ['read'],
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => {
        localStorage.setItem('auth_token', token);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (updates) => {
        const current = get().user;
        if (current) set({ user: { ...current, ...updates } });
      },

      hasPermission: (resource, action) => {
        const { user } = get();
        if (!user) return false;
        const perms = ROLE_PERMISSIONS[user.role];
        if (perms.all) return true;
        const resourcePerms = perms[resource];
        return resourcePerms ? resourcePerms.includes(action) : false;
      },
    }),
    { name: 'cqmr-auth' }
  )
);
