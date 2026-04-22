/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { canPerform } from './lib/permissions';
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
import TeamsPage from './features/groups/TeamsPage';
import SettingsPage from './features/settings/SettingsPage';
import PageShell from './components/layout/PageShell';
import StudentLayout from './features/student/layout/StudentLayout';
import StudentDashboard from './features/student/pages/StudentDashboard';
import StudentLogin from './features/student/pages/StudentLogin';
import StudentSessions from './features/student/pages/StudentSessions';
import StudentAssignments from './features/student/pages/StudentAssignments';
import StudentResources from './features/student/pages/StudentResources';
import StudentAttendance from './features/student/pages/StudentAttendance';
import StudentGrades from './features/student/pages/StudentGrades';
import InstructorLayout from './features/instructor/layout/InstructorLayout';
import InstructorDashboard from './features/instructor/pages/InstructorDashboard';
import StudentsPage from './features/instructor/pages/StudentsPage';
import StudentProfilePage from './features/instructor/pages/StudentProfilePage';
import SessionsPage from './features/instructor/pages/SessionsPage';
import SessionDetailPage from './features/instructor/pages/SessionDetailPage';
import AssignmentsPage from './features/instructor/pages/AssignmentsPage';
import AssignmentDetailPage from './features/instructor/pages/AssignmentDetailPage';
import AttendancePage from './features/instructor/pages/AttendancePage';
import ResourcesPage from './features/instructor/pages/ResourcesPage';
import AnalyticsPage from './features/instructor/pages/AnalyticsPage';
import TeamPage from './features/instructor/pages/TeamPage';
import CreateSessionPage from './features/instructor/pages/CreateSessionPage';
import AddStudentsPage from './features/instructor/pages/AddStudentsPage';
import UploadResourcePage from './features/instructor/pages/UploadResourcePage';
import AddHelperPage from './features/instructor/pages/AddHelperPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const Placeholder = ({ title }: { title: string }) => (
  <PageShell>
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-black text-vanguard-gray-800 tracking-tight mb-4">{title}</h1>
      <p className="text-vanguard-gray-800 opacity-40 uppercase tracking-widest font-bold text-xs">Module Under Construction</p>
    </div>
  </PageShell>
);

const resolvePortalRole = (role: string | null, userRole?: string) => {
  if (role === 'lead_instructor' || role === 'helper_instructor') {
    return role;
  }

  if (userRole === 'LEAD_INSTRUCTOR' || userRole === 'MENTOR') {
    return 'lead_instructor';
  }

  if (userRole === 'HELPER_INSTRUCTOR') {
    return 'helper_instructor';
  }

  return 'student';
};

const PortalLayout = () => {
  const { role, user } = useAuthStore();
  const portalRole = resolvePortalRole(role, user?.role);

  return portalRole === 'lead_instructor' || portalRole === 'helper_instructor'
    ? <InstructorLayout />
    : <StudentLayout />;
};

const PortalRouteElement = ({
  studentElement,
  instructorElement,
  studentAllowed = true,
  instructorAllowed = true,
}: {
  studentElement?: React.ReactNode;
  instructorElement?: React.ReactNode;
  studentAllowed?: boolean;
  instructorAllowed?: boolean;
}) => {
  const { role, user } = useAuthStore();
  const portalRole = resolvePortalRole(role, user?.role);
  const isInstructor = portalRole === 'lead_instructor' || portalRole === 'helper_instructor';

  if (isInstructor) {
    if (!instructorAllowed || !instructorElement) {
      return <Navigate to="/portal/dashboard" replace />;
    }
    return <>{instructorElement}</>;
  }

  if (!studentAllowed || !studentElement) {
    return <Navigate to="/portal/dashboard" replace />;
  }

  return <>{studentElement}</>;
};

const RequirePermission = ({
  permission,
  children,
  fallbackTo = '/portal/dashboard',
}: {
  permission: string;
  children: React.ReactNode;
  fallbackTo?: string;
}) => {
  const { role, permissions } = useAuthStore();
  const allowed = canPerform({ role, permissions }, permission);
  return allowed ? <>{children}</> : <Navigate to={fallbackTo} replace />;
};

const RequireLeadInstructor = ({ children }: { children: React.ReactNode }) => {
  const { role, user } = useAuthStore();
  const normalizedRole = role;
  const rawRole = user?.role;
  const isLead =
    normalizedRole === 'lead_instructor' ||
    rawRole === 'LEAD_INSTRUCTOR' ||
    rawRole === 'MENTOR' ||
    normalizedRole === 'admin' ||
    rawRole === 'ADMIN';
  return isLead ? <>{children}</> : <Navigate to="/portal/dashboard" replace />;
};

const DashboardAlias = () => {
  const location = useLocation();
  const { pathname, search, hash } = location;
  const nextPath = pathname.replace(/^\/dashboard/, '/portal');
  return <Navigate to={`${nextPath}${search}${hash}`} replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<StudentLogin />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <DivisionOverview />
          </ProtectedRoute>
        } />

        <Route path="/divisions/:id" element={
          <ProtectedRoute>
            <DivisionDetail />
          </ProtectedRoute>
        } />

        <Route path="/divisions/:id/members" element={
          <ProtectedRoute>
            <MembersPage />
          </ProtectedRoute>
        } />

        <Route path="/divisions/:id/bootcamps" element={
          <ProtectedRoute>
            <BootcampRegistry />
          </ProtectedRoute>
        } />

        <Route path="/divisions/:id/teams" element={
          <ProtectedRoute>
            <TeamsPage />
          </ProtectedRoute>
        } />

        <Route path="/divisions/:id/mentors" element={
          <ProtectedRoute>
            <MentorsPage />
          </ProtectedRoute>
        } />

        <Route path="/divisions/:id/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />

        <Route path="/bootcamps" element={
          <ProtectedRoute>
            <BootcampRegistry />
          </ProtectedRoute>
        } />

        <Route path="/bootcamps/:id" element={
          <ProtectedRoute>
            <BootcampWorkspace />
          </ProtectedRoute>
        } />

        <Route path="/members" element={
          <ProtectedRoute>
            <MembersPage />
          </ProtectedRoute>
        } />

        <Route path="/members/:memberId" element={
          <ProtectedRoute>
            <MemberProfile />
          </ProtectedRoute>
        } />

        <Route path="/teams" element={
          <ProtectedRoute>
            <TeamsPage />
          </ProtectedRoute>
        } />

        <Route path="/mentors" element={
          <ProtectedRoute>
            <MentorsPage />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />

        {/* Student Portal Routes */}
        <Route path="/portal" element={
          <ProtectedRoute>
            <PortalLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PortalRouteElement studentElement={<StudentDashboard />} instructorElement={<InstructorDashboard />} />} />
          <Route path="sessions" element={<PortalRouteElement studentElement={<StudentSessions />} instructorElement={<SessionsPage />} />} />
          <Route
            path="sessions/create"
            element={
              <PortalRouteElement
                studentAllowed={false}
                instructorElement={
                  <RequirePermission permission="create_session">
                    <CreateSessionPage />
                  </RequirePermission>
                }
              />
            }
          />
          <Route path="sessions/:sessionId" element={<PortalRouteElement studentAllowed={false} instructorElement={<SessionDetailPage />} />} />
          <Route path="assignments" element={<PortalRouteElement studentElement={<StudentAssignments />} instructorElement={<AssignmentsPage />} />} />
          <Route path="assignments/:assignmentId" element={<PortalRouteElement studentAllowed={false} instructorElement={<AssignmentDetailPage />} />} />
          <Route path="resources" element={<PortalRouteElement studentElement={<StudentResources />} instructorElement={<ResourcesPage />} />} />
          <Route
            path="resources/upload"
            element={
              <PortalRouteElement
                studentAllowed={false}
                instructorElement={
                  <RequirePermission permission="upload_resource">
                    <UploadResourcePage />
                  </RequirePermission>
                }
              />
            }
          />
          <Route path="attendance" element={<PortalRouteElement studentElement={<StudentAttendance />} instructorElement={<AttendancePage />} />} />
          <Route path="grades" element={<PortalRouteElement studentElement={<StudentGrades />} instructorAllowed={false} />} />
          <Route path="students" element={<PortalRouteElement studentAllowed={false} instructorElement={<StudentsPage />} />} />
          <Route
            path="students/create"
            element={
              <PortalRouteElement
                studentAllowed={false}
                instructorElement={
                  <RequirePermission permission="add_student">
                    <AddStudentsPage />
                  </RequirePermission>
                }
              />
            }
          />
          <Route path="students/:studentId" element={<PortalRouteElement studentAllowed={false} instructorElement={<StudentProfilePage />} />} />
          <Route path="analytics" element={<PortalRouteElement studentAllowed={false} instructorElement={<AnalyticsPage />} />} />
          <Route
            path="team"
            element={
              <PortalRouteElement
                studentAllowed={false}
                instructorElement={
                  <RequireLeadInstructor>
                    <RequirePermission permission="manage_groups">
                      <TeamPage />
                    </RequirePermission>
                  </RequireLeadInstructor>
                }
              />
            }
          />
          <Route
            path="team/add"
            element={
              <PortalRouteElement
                studentAllowed={false}
                instructorElement={
                  <RequireLeadInstructor>
                    <RequirePermission permission="manage_groups">
                      <AddHelperPage />
                    </RequirePermission>
                  </RequireLeadInstructor>
                }
              />
            }
          />
        </Route>

        {/* /dashboard alias -> /portal */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardAlias />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
