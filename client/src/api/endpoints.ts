export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    ME: '/auth/me',
  },
  DIVISIONS: {
    BASE: '/divisions',
    DETAIL: (id: string) => `/divisions/${id}`,
    BOOTCAMPS: (id: string) => `/divisions/${id}/bootcamps`,
  },
  BOOTCAMPS: {
    DETAIL: (id: string) => `/bootcamps/${id}`,
    STUDENTS: (id: string) => `/bootcamps/${id}/students`,
    SESSIONS: (id: string) => `/bootcamps/${id}/sessions`,
  },
} as const;
