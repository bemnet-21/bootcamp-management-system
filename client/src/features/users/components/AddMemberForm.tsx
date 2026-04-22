import React, { useState, useEffect } from 'react';
import { Member, useUserStore } from '@/src/store/useUserStore';
import { Button } from '@/src/components/ui/Button';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import { 
  Terminal, 
  Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import axiosInstance from '@/src/api/axiosInstance';
import { ENDPOINTS } from '@/src/api/endpoints';

interface AddMemberFormProps {
  onSuccess: () => void;
  initialData?: Member | null;
}

type DivisionOption = { id: string; name: string };

const AddMemberForm = ({ onSuccess, initialData }: AddMemberFormProps) => {
  const { id: divisionIdFromUrl } = useParams();
  const { addMember, updateMember } = useUserStore();
  const [divisions, setDivisions] = useState<DivisionOption[]>([]);
  const [divisionsLoading, setDivisionsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: initialData?.name?.split(' ')?.[0] || '',
    lastName: initialData?.name?.split(' ')?.slice(1).join(' ') || '',
    username: initialData?.email?.split('@')?.[0] || '',
    email: initialData?.email || '',
    role: (initialData?.role || 'Student') as 'Admin' | 'Instructor' | 'Student',
    divisionId: initialData?.divisionIds?.[0] || divisionIdFromUrl || ''
  });

  useEffect(() => {
    if (divisionIdFromUrl && !initialData) {
      setFormData(prev => ({ ...prev, divisionId: divisionIdFromUrl }));
    }
  }, [divisionIdFromUrl, initialData]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setDivisionsLoading(true);
      try {
        const res = await axiosInstance.get(ENDPOINTS.DIVISIONS.BASE, { params: { limit: 100 } });
        const items = (res.data?.data ?? []) as any[];
        const options: DivisionOption[] = items
          .map((d) => ({ id: d._id ?? d.id, name: d.name }))
          .filter((d) => d.id && d.name);
        if (!mounted) return;
        setDivisions(options);
        if (!formData.divisionId && options[0]?.id) {
          setFormData((prev) => ({ ...prev, divisionId: options[0].id }));
        }
      } catch {
        // If divisions can't be fetched (e.g. not logged in), keep UI usable with an empty list.
      } finally {
        if (mounted) setDivisionsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <label className="text-[11px] font-bold text-vanguard-muted uppercase tracking-widest">
            Identity / First Name
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue focus:border-vanguard-blue outline-none transition-all placeholder:text-vanguard-muted/50"
            placeholder="e.g. Johnathan"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-vanguard-muted uppercase tracking-widest">
            Identity / Last Name
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue focus:border-vanguard-blue outline-none transition-all placeholder:text-vanguard-muted/50"
            placeholder="e.g. Doe"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-vanguard-muted uppercase tracking-widest">
            Identity / Username
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue focus:border-vanguard-blue outline-none transition-all placeholder:text-vanguard-muted/50"
            placeholder="e.g. jdoe"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-vanguard-muted uppercase tracking-widest">
            Contact / Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue focus:border-vanguard-blue outline-none transition-all placeholder:text-vanguard-muted/50"
            placeholder="e.g. j.doe@vanguard.edu"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold text-vanguard-muted uppercase tracking-widest">
            Access / System Role
          </label>
          <div className="flex bg-[#F1F5F9] p-1 rounded-xl">
            {(['Admin', 'Instructor', 'Student'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setFormData({ ...formData, role })}
                className={cn(
                  "flex-1 py-2 text-xs font-bold transition-all rounded-lg",
                  formData.role === role 
                    ? "bg-white text-vanguard-gray-800 shadow-sm" 
                    : "text-vanguard-muted hover:text-vanguard-gray-800"
                )}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-bold text-vanguard-muted uppercase tracking-widest">
            Pillar Assignment / Division
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(divisions.length > 0 ? divisions : []).map((division) => {
              const Icon = Terminal;
              const isActive = formData.divisionId === division.id;
              
              return (
                <button
                  key={division.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, divisionId: division.id })}
                  className={cn(
                    "relative flex group items-center p-3 rounded-2xl border-2 transition-all text-left",
                    isActive 
                      ? "border-vanguard-blue bg-vanguard-blue-light/30 shadow-sm" 
                      : "border-vanguard-gray-100 bg-white hover:border-vanguard-gray-200"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mr-3 transition-colors",
                    isActive ? "bg-vanguard-blue text-white" : "bg-vanguard-gray-50 text-vanguard-muted group-hover:bg-vanguard-gray-100"
                  )}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "text-[13px] font-bold tracking-tight leading-none mb-1",
                      isActive ? "text-vanguard-gray-800" : "text-vanguard-muted"
                    )}>
                      {division.name}
                    </p>
                    <p className="text-[10px] text-vanguard-muted opacity-60 font-medium uppercase tracking-tighter">
                      Vanguard Pillar
                    </p>
                  </div>
                  {isActive && (
                    <motion.div 
                      layoutId="check-icon"
                      className="absolute top-2 right-2 text-vanguard-blue"
                    >
                      <Check size={14} />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>
          {divisionsLoading && (
            <p className="text-[11px] text-vanguard-muted font-medium">Loading divisions…</p>
          )}
          {!divisionsLoading && divisions.length === 0 && (
            <p className="text-[11px] text-vanguard-muted font-medium">
              Divisions couldn’t be loaded. Log in as Admin to create members.
            </p>
          )}
        </div>
        <div className="space-y-3">
          <label className="text-[11px] font-bold text-vanguard-muted uppercase tracking-widest">
            Security / Initial Credentials
          </label>
          <div className="p-4 bg-[#F8FAFC] border border-dashed border-[#E2E8F0] rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-vanguard-gray-800 uppercase tracking-tighter">Temporary Access Key</p>
              <p className="text-[13px] font-mono text-vanguard-blue mt-0.5">Generated by server</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-vanguard-muted font-medium italic">Reset Required</p>
              <p className="text-[9px] text-vanguard-muted uppercase tracking-tighter mt-0.5">
                {initialData ? 'Existing user account' : 'Sent by email on create'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-vanguard-gray-100">
        <Button 
          type="submit" 
          disabled={!isFormValid}
          className="w-full h-12 text-sm uppercase tracking-widest font-black disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {initialData ? 'Commit Lifecycle Changes' : 'Initialize New Member'}
          <motion.div 
            className="inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
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
