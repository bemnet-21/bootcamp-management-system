export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    ME: '/auth/me',
    REQUEST_RESET: '/auth/password-reset-request',
    RESET_PASSWORD: '/auth/password-reset-confirm',
  },
  USERS: {
    BASE: '/admin/users',
    DETAIL: (id: string) => `/admin/users/${id}`,
    STATUS: (id: string) => `/admin/users/${id}/status`,
  },
  SESSIONS: {
    BASE: '/sessions',
    DETAIL: (id: string) => `/sessions/${id}`,
  },
  DIVISIONS: {
    BASE: '/divisions',
    DETAIL: (id: string) => `/divisions/${id}`,
    BOOTCAMPS: (id: string) => `/divisions/${id}/bootcamps`,
  },
  BOOTCAMPS: {
    BASE: '/admin/bootcamps', // Admin only listing
    DETAIL: (id: string) => `/admin/bootcamps/${id}`,
    RESOURCES: (bootcampId: string) => `/bootcamps/${bootcampId}/resources`,
    ATTENDANCE: (bootcampId: string) => `/student/bootcamps/${bootcampId}/attendance`,
    ATTENDANCE_STATS: (bootcampId: string) => `/student/bootcamps/${bootcampId}/attendance/stat`,
  },
} as const;
