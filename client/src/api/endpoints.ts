export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    ME: '/auth/me',
    REQUEST_RESET: '/auth/password-reset-request',
    RESET_PASSWORD: '/auth/password-reset-confirm',
  },
  ADMIN_SETTINGS: {
    PROFILE: '/admin/settings/profile',
    PASSWORD: '/admin/settings/password',
  },
  USERS: {
    BASE: '/admin/users',
    DETAIL: (id: string) => `/admin/users/${id}`,
    STATUS: (id: string) => `/admin/users/${id}/status`,
  },
  DIVISIONS: {
    // Server mounts division routes under /admin/divisions
    BASE: '/admin/divisions',
    DETAIL: (id: string) => `/admin/divisions/${id}`,
    STATISTICS: (id: string) => `/admin/divisions/${id}/statistics`,
    BOOTCAMPS: (id: string) => `/admin/divisions/${id}/bootcamps`,
  },
  BOOTCAMPS: {
    BASE: '/admin/bootcamps', // Admin only listing
    DETAIL: (id: string) => `/admin/bootcamps/${id}`,
    ASSIGN_LEAD: (id: string) => `/admin/bootcamps/${id}/assign-lead`,
    DEACTIVATE: (id: string) => `/admin/bootcamps/${id}/deactivate`,
    RESOURCES: (bootcampId: string) => `/bootcamps/${bootcampId}/resources`,
    ATTENDANCE: (bootcampId: string) => `/student/bootcamps/${bootcampId}/attendance`,
    ATTENDANCE_STATS: (bootcampId: string) => `/student/bootcamps/${bootcampId}/attendance/stat`,
  },
  SESSIONS: {
    // Server mounts session routes under /bootcamps/sessions
    BASE: '/bootcamps/sessions',
    DETAIL: (id: string) => `/bootcamps/sessions/${id}`,
  }
} as const;
