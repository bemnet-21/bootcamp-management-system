import React from 'react';
import { useAuthStore } from '@/src/store/useAuthStore';
import { canPerform } from '@/src/lib/permissions';

const defaultPermissionsByRole = {
  lead_instructor: ['create_session', 'mark_attendance', 'add_student', 'upload_resource', 'manage_groups', 'grade_assignments'],
  helper_instructor: ['upload_resource'],
};

export const resolveInstructorRole = (role, userRole) => {
  if (role === 'lead_instructor' || role === 'helper_instructor') {
    return role;
  }

  if (userRole === 'LEAD_INSTRUCTOR' || userRole === 'MENTOR') {
    return 'lead_instructor';
  }

  if (userRole === 'HELPER_INSTRUCTOR') {
    return 'helper_instructor';
  }

  return null;
};

export const useInstructorAccess = () => {
  const { role, permissions, user } = useAuthStore();
  const instructorRole = resolveInstructorRole(role, user?.role);
  const effectivePermissions = permissions.length > 0
    ? permissions
    : user?.permissions || (instructorRole ? defaultPermissionsByRole[instructorRole] : []);

  return {
    instructorRole,
    user,
    permissions: effectivePermissions,
    hasPermission: (permission) => canPerform({ role, permissions: effectivePermissions }, permission),
  };
};

const PermissionWrapper = ({ permission, children, fallback = null }) => {
  const { hasPermission } = useInstructorAccess();
  const allowed = hasPermission(permission);

  if (typeof children === 'function') {
    return children({ allowed });
  }

  return allowed ? children : fallback;
};

export default PermissionWrapper;
