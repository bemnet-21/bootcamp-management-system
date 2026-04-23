export type AppRole = 'admin' | 'student' | 'lead_instructor' | 'helper_instructor' | null;

const permissionAliases: Record<string, string> = {
  // Students
  create_student: 'add_student',
  create_students: 'add_student',
  add_students: 'add_student',

  // Sessions
  create_sessions: 'create_session',

  // Resources
  upload_resources: 'upload_resource',

  // Team / management
  manage_team: 'manage_groups',
  manage_helpers: 'manage_groups',
  edit_permissions: 'manage_groups',

  // Grading
  grade_assignment: 'grade_assignments',
  grade_submission: 'grade_assignments',
};

export function normalizePermission(permission: string) {
  const key = (permission || '').trim().toLowerCase();
  return permissionAliases[key] || key;
}

export function hasPermission(permissions: string[], permission: string) {
  const normalizedNeed = normalizePermission(permission);
  const normalizedHave = new Set((permissions || []).map(normalizePermission));
  return normalizedHave.has(normalizedNeed);
}

export function canPerform(args: { role: AppRole; permissions: string[] }, permission: string) {
  const normalizedNeed = normalizePermission(permission);

  // Hard role check: Helper instructors can never manage team/helpers.
  if (args.role === 'helper_instructor' && normalizedNeed === 'manage_groups') return false;

  // Students cannot perform any instructor/admin actions in portal.
  if (args.role === 'student') return false;

  return hasPermission(args.permissions || [], normalizedNeed);
}

