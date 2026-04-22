/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, isStaffRole } from './store/useAuthStore';
import Login from './features/auth/Login';
import ForgotPassword from './features/auth/ForgotPassword';
import ResetPassword from './features/auth/ResetPassword';
import DivisionOverview from './features/divisions/DivisionOverview';
import DivisionDetail from './features/divisions/DivisionDetail';
import BootcampRegistry from './features/sessions/BootcampRegistry';
import BootcampWorkspace from './features/sessions/BootcampWorkspace';
import MembersPage from './features/users/MembersPage';
import MemberProfile from './features/users/pages/MemberProfile';
import MentorsPage from './features/mentors/MentorsPage';
import SettingsPage from './features/settings/SettingsPage';
import AdminDivisionsPage from './features/admin/AdminDivisionsPage';
import AdminBootcampsManagePage from './features/admin/AdminBootcampsManagePage';
import StudentLayout from './features/student/layout/StudentLayout';
import StudentDashboard from './features/student/pages/StudentDashboard';
import StudentLogin from './features/student/pages/StudentLogin';
import StudentSessions from './features/student/pages/StudentSessions';
import StudentAssignments from './features/student/pages/StudentAssignments';
import StudentResources from './features/student/pages/StudentResources';
import StudentAttendance from './features/student/pages/StudentAttendance';
import StudentGrades from './features/student/pages/StudentGrades';
import { ADMIN_PATH, PORTAL_BASE, adminRoutes } from './constants/routes';

const StaffProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  if (!isStaffRole(user?.role)) {
    return <Navigate to={`${PORTAL_BASE}/dashboard`} replace />;
  }
  return <>{children}</>;
};

const StudentProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (isStaffRole(user?.role)) {
    return <Navigate to={ADMIN_PATH} replace />;
  }
  return <>{children}</>;
};

/** Staff login: already signed-in staff go to admin home; students use student portal */
const AdminLoginGate = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && isStaffRole(user?.role)) {
    return <Navigate to={ADMIN_PATH} replace />;
  }
  if (isAuthenticated && user?.role === 'STUDENT') {
    return <Navigate to={`${PORTAL_BASE}/dashboard`} replace />;
  }
  return <>{children}</>;
};

/** Student login: students go to portal; staff go to admin */
const StudentLoginGate = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user?.role === 'STUDENT') {
    return <Navigate to={`${PORTAL_BASE}/dashboard`} replace />;
  }
  if (isAuthenticated && isStaffRole(user?.role)) {
    return <Navigate to={ADMIN_PATH} replace />;
  }
  return <>{children}</>;
};

const RootRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role === 'STUDENT') {
    return <Navigate to={`${PORTAL_BASE}/dashboard`} replace />;
  }
  return <Navigate to={ADMIN_PATH} replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route path="/login" element={<StudentLoginGate><StudentLogin /></StudentLoginGate>} />
        <Route path="/admin/login" element={<AdminLoginGate><Login /></AdminLoginGate>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path={ADMIN_PATH} element={
          <StaffProtectedRoute>
            <DivisionOverview />
          </StaffProtectedRoute>
        } />

        <Route path={adminRoutes.manageDivisions} element={
          <StaffProtectedRoute>
            <AdminDivisionsPage />
          </StaffProtectedRoute>
        } />

        <Route path={adminRoutes.manageBootcamps} element={
          <StaffProtectedRoute>
            <AdminBootcampsManagePage />
          </StaffProtectedRoute>
        } />

        <Route path={`${ADMIN_PATH}/structure`} element={<Navigate to={adminRoutes.manageDivisions} replace />} />

        <Route path={`${ADMIN_PATH}/divisions/:id`} element={
          <StaffProtectedRoute>
            <DivisionDetail />
          </StaffProtectedRoute>
        } />

        <Route path={`${ADMIN_PATH}/divisions/:id/members`} element={
          <StaffProtectedRoute>
            <MembersPage />
          </StaffProtectedRoute>
        } />

        <Route path={`${ADMIN_PATH}/divisions/:id/bootcamps`} element={
          <StaffProtectedRoute>
            <BootcampRegistry />
          </StaffProtectedRoute>
        } />

        <Route path={`${ADMIN_PATH}/divisions/:id/mentors`} element={
          <StaffProtectedRoute>
            <MentorsPage />
          </StaffProtectedRoute>
        } />

        <Route path={`${ADMIN_PATH}/divisions/:id/settings`} element={
          <StaffProtectedRoute>
            <SettingsPage />
          </StaffProtectedRoute>
        } />

        <Route path={`${ADMIN_PATH}/bootcamps`} element={
          <StaffProtectedRoute>
            <BootcampRegistry />
          </StaffProtectedRoute>
        } />

        <Route path={`${ADMIN_PATH}/bootcamps/:id`} element={
          <StaffProtectedRoute>
            <BootcampWorkspace />
          </StaffProtectedRoute>
        } />

        <Route path={`${ADMIN_PATH}/members`} element={
          <StaffProtectedRoute>
            <MembersPage />
          </StaffProtectedRoute>
        } />

        <Route path={`${ADMIN_PATH}/members/:memberId`} element={
          <StaffProtectedRoute>
            <MemberProfile />
          </StaffProtectedRoute>
        } />

        <Route path={`${ADMIN_PATH}/mentors`} element={
          <StaffProtectedRoute>
            <MentorsPage />
          </StaffProtectedRoute>
        } />

        <Route path={`${ADMIN_PATH}/settings`} element={
          <StaffProtectedRoute>
            <SettingsPage />
          </StaffProtectedRoute>
        } />

        <Route path={PORTAL_BASE} element={
          <StudentProtectedRoute>
            <StudentLayout />
          </StudentProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="sessions" element={<StudentSessions />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="resources" element={<StudentResources />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="grades" element={<StudentGrades />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
