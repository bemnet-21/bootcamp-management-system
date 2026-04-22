/** Staff (admin / instructor) UI lives under this prefix */
export const ADMIN_PATH = '/admin';

/** Student portal prefix */
export const PORTAL_BASE = '/portal';

export const adminRoutes = {
  home: ADMIN_PATH,
  /** Admin CRUD: divisions only */
  manageDivisions: `${ADMIN_PATH}/manage/divisions`,
  /** Admin CRUD: bootcamp cohorts only */
  manageBootcamps: `${ADMIN_PATH}/manage/bootcamps`,
  division: (id: string) => `${ADMIN_PATH}/divisions/${id}`,
  divisionMembers: (id: string) => `${ADMIN_PATH}/divisions/${id}/members`,
  divisionBootcamps: (id: string) => `${ADMIN_PATH}/divisions/${id}/bootcamps`,
  divisionMentors: (id: string) => `${ADMIN_PATH}/divisions/${id}/mentors`,
  divisionSettings: (id: string) => `${ADMIN_PATH}/divisions/${id}/settings`,
  bootcamps: `${ADMIN_PATH}/bootcamps`,
  bootcamp: (id: string) => `${ADMIN_PATH}/bootcamps/${id}`,
  members: `${ADMIN_PATH}/members`,
  member: (id: string) => `${ADMIN_PATH}/members/${id}`,
  mentors: `${ADMIN_PATH}/mentors`,
  settings: `${ADMIN_PATH}/settings`,
} as const;
