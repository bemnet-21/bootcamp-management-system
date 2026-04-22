import React, { useState, useEffect, useMemo } from 'react';
import { Member, useUserStore } from '@/src/store/useUserStore';
import { useDivisionStore } from '@/src/store/useDivisionStore';
import { Button } from '@/src/components/ui/Button';
import { toast } from 'sonner';
import { Terminal, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface AddMemberFormProps {
  onSuccess: () => void;
  initialData?: Member | null;
  /** Pre-select pillar when adding from a division context or global filter. */
  defaultDivisionId?: string;
}

const AddMemberForm = ({ onSuccess, initialData, defaultDivisionId }: AddMemberFormProps) => {
  const { addMember, updateMember } = useUserStore();
  const { divisions, fetchDivisions, isLoading: divisionsLoading } = useDivisionStore();

  const [formData, setFormData] = useState({
    firstName: initialData?.name?.split(' ')?.[0] || '',
    lastName: initialData?.name?.split(' ')?.slice(1).join(' ') || '',
    username: initialData?.email?.split('@')?.[0] || '',
    email: initialData?.email || '',
    role: (initialData?.role || 'Student') as 'Admin' | 'Instructor' | 'Student',
    divisionId: initialData?.divisionIds?.[0] || defaultDivisionId || '',
  });

  useEffect(() => {
    fetchDivisions().catch(() => {});
  }, [fetchDivisions]);

  useEffect(() => {
    if (initialData) return;
    if (defaultDivisionId) {
      setFormData((prev) => ({ ...prev, divisionId: defaultDivisionId }));
    }
  }, [initialData, defaultDivisionId]);

  const divisionOptions = useMemo(
    () => divisions.map((d) => ({ id: d.id, name: d.name })).filter((d) => d.id && d.name),
    [divisions],
  );

  useEffect(() => {
    if (initialData || formData.divisionId) return;
    const first = defaultDivisionId || divisionOptions[0]?.id;
    if (first) setFormData((prev) => ({ ...prev, divisionId: first }));
  }, [divisionOptions, defaultDivisionId, initialData, formData.divisionId]);

  const isFormValid =
    formData.firstName.trim().length >= 2 &&
    formData.lastName.trim().length >= 2 &&
    formData.username.trim().length >= 3 &&
    formData.email &&
    formData.divisionId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (initialData) {
        await updateMember(initialData.id, {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          role: formData.role,
          divisions: [formData.divisionId],
        });
        toast.success('Member updated successfully!');
      } else {
        await addMember({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          role: formData.role,
          divisions: [formData.divisionId],
          status: 'Active',
        });
        toast.success('Member added. A temporary password was emailed to the user.');
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Request failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-widest text-vanguard-muted">
            Identity / First name
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm outline-none transition-all placeholder:text-vanguard-muted/50 focus:border-vanguard-blue focus:ring-1 focus:ring-vanguard-blue"
            placeholder="e.g. Johnathan"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-widest text-vanguard-muted">
            Identity / Last name
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm outline-none transition-all placeholder:text-vanguard-muted/50 focus:border-vanguard-blue focus:ring-1 focus:ring-vanguard-blue"
            placeholder="e.g. Doe"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-widest text-vanguard-muted">
            Identity / Username
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm outline-none transition-all placeholder:text-vanguard-muted/50 focus:border-vanguard-blue focus:ring-1 focus:ring-vanguard-blue"
            placeholder="e.g. jdoe"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-widest text-vanguard-muted">
            Contact / Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm outline-none transition-all placeholder:text-vanguard-muted/50 focus:border-vanguard-blue focus:ring-1 focus:ring-vanguard-blue"
            placeholder="e.g. j.doe@vanguard.edu"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-widest text-vanguard-muted">
            Access / Role
          </label>
          <div className="flex rounded-xl bg-[#F1F5F9] p-1">
            {(['Admin', 'Instructor', 'Student'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setFormData({ ...formData, role })}
                className={cn(
                  'flex-1 rounded-lg py-2 text-xs font-bold transition-all',
                  formData.role === role
                    ? 'bg-white text-vanguard-gray-800 shadow-sm'
                    : 'text-vanguard-muted hover:text-vanguard-gray-800',
                )}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-widest text-vanguard-muted">
            Pillar / Division
          </label>
          <div className="grid grid-cols-2 gap-3">
            {divisionOptions.map((division) => {
              const Icon = Terminal;
              const isActive = formData.divisionId === division.id;

              return (
                <button
                  key={division.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, divisionId: division.id })}
                  className={cn(
                    'group relative flex items-center rounded-2xl border-2 p-3 text-left transition-all',
                    isActive
                      ? 'border-vanguard-blue bg-vanguard-blue-light/30 shadow-sm'
                      : 'border-vanguard-gray-100 bg-white hover:border-vanguard-gray-200',
                  )}
                >
                  <div
                    className={cn(
                      'mr-3 flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                      isActive
                        ? 'bg-vanguard-blue text-white'
                        : 'bg-vanguard-gray-50 text-vanguard-muted group-hover:bg-vanguard-gray-100',
                    )}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <p
                      className={cn(
                        'mb-1 text-[13px] font-bold leading-none tracking-tight',
                        isActive ? 'text-vanguard-gray-800' : 'text-vanguard-muted',
                      )}
                    >
                      {division.name}
                    </p>
                    <p className="text-[10px] font-medium uppercase tracking-tighter text-vanguard-muted opacity-60">
                      Vanguard pillar
                    </p>
                  </div>
                  {isActive && (
                    <motion.div layoutId="member-form-check" className="absolute right-2 top-2 text-vanguard-blue">
                      <Check size={14} />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>
          {divisionsLoading && (
            <p className="text-[11px] font-medium text-vanguard-muted">Loading divisions…</p>
          )}
          {!divisionsLoading && divisionOptions.length === 0 && (
            <p className="text-[11px] font-medium text-vanguard-muted">
              No divisions yet. Create pillars on the Divisions admin page first.
            </p>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-widest text-vanguard-muted">
            Security / Credentials
          </label>
          <div className="flex items-center justify-between rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-tighter text-vanguard-gray-800">
                Temporary password
              </p>
              <p className="mt-0.5 font-mono text-[13px] text-vanguard-blue">Generated by server</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-medium italic text-vanguard-muted">Reset required</p>
              <p className="mt-0.5 text-[9px] uppercase tracking-tighter text-vanguard-muted">
                {initialData ? 'Existing account' : 'Emailed on create'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-vanguard-gray-100 pt-6">
        <Button
          type="submit"
          disabled={!isFormValid}
          className="group h-12 w-full text-sm font-black uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-50"
        >
          {initialData ? 'Save changes' : 'Create member'}
          <motion.div
            className="ml-2 inline-block opacity-0 transition-opacity group-hover:opacity-100"
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            →
          </motion.div>
        </Button>
      </div>
    </form>
  );
};

export default AddMemberForm;
