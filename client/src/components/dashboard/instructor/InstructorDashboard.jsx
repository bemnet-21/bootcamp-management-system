import React from 'react';
import StatsCards from '@/src/components/dashboard/instructor/StatsCards';
import UpcomingSessions from '@/src/components/dashboard/instructor/UpcomingSessions';
import QuickActions from '@/src/components/dashboard/instructor/QuickActions';
import { useInstructorAccess } from '@/src/components/dashboard/instructor/PermissionWrapper';

const InstructorDashboard = () => {
  const { instructorRole, user } = useInstructorAccess();
  const instructorTitle = instructorRole === 'lead_instructor' ? 'Lead Instructor' : 'Helper Instructor';

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#60A5FA] p-8 text-white shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-100">Instructor dashboard</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">{instructorTitle} Control Center</h1>
        <p className="mt-3 max-w-2xl text-sm text-blue-50">
          Manage sessions, monitor cohort progress, and keep your delivery lane moving for {user?.name || 'your team'}.
        </p>
      </section>

      <StatsCards />

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <UpcomingSessions />
        <QuickActions />
      </div>
    </div>
  );
};

export default InstructorDashboard;
