/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import Login from './features/auth/Login';
import ForgotPassword from './features/auth/ForgotPassword';
import ResetPassword from './features/auth/ResetPassword';
import AdminDashboard from './features/dashboard/AdminDashboard';
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/divisions" element={
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
