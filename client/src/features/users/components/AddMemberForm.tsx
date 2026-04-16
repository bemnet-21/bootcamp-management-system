import React, { useState, useEffect } from 'react';
import { Member, useUserStore } from '@/src/store/useUserStore';
import { Button } from '@/src/components/ui/Button';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import { 
  Database, 
  Terminal, 
  Shield, 
  Cpu,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface AddMemberFormProps {
  onSuccess: () => void;
  initialData?: Member | null;
}

const PILLARS = [
  { id: 'dev', name: 'Development', icon: Terminal, color: 'vanguard-blue' },
  { id: 'ds', name: 'Data Science', icon: Database, color: 'purple-500' },
  { id: 'cyber', name: 'Cybersecurity', icon: Shield, color: 'vanguard-gray-800' },
  { id: 'cpd', name: 'CPD', icon: Cpu, color: 'emerald-500' }
];

const generateTemporaryPassword = () =>
  `VG-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${new Date().getFullYear()}`;

const AddMemberForm = ({ onSuccess, initialData }: AddMemberFormProps) => {
  const { id: divisionIdFromUrl } = useParams();
  const { addMember, updateMember } = useUserStore();
  const [temporaryPassword] = useState(() => initialData?.temporaryPassword ?? generateTemporaryPassword());
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    role: (initialData?.role || 'Student') as 'Admin' | 'Instructor' | 'Student',
    divisionId: initialData?.divisionId || divisionIdFromUrl || 'dev'
  });

  useEffect(() => {
    if (divisionIdFromUrl && !initialData) {
      setFormData(prev => ({ ...prev, divisionId: divisionIdFromUrl }));
    }
  }, [divisionIdFromUrl, initialData]);

  const isFormValid = formData.name && formData.email && formData.divisionId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (initialData) {
      updateMember(initialData.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        divisionId: formData.divisionId
      });
      toast.success('Member updated successfully!');
    } else {
      const createdMember = addMember({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        divisionId: formData.divisionId,
        temporaryPassword,
      });
      toast.success(`Member added. Temporary password: ${createdMember.temporaryPassword}`);
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-vanguard-muted uppercase tracking-widest">
            Identity / Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:ring-1 focus:ring-vanguard-blue focus:border-vanguard-blue outline-none transition-all placeholder:text-vanguard-muted/50"
            placeholder="e.g. Johnathan Doe"
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
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              const isActive = formData.divisionId === pillar.id;
              
              return (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, divisionId: pillar.id })}
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
                      {pillar.name}
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
        </div>
        <div className="space-y-3">
          <label className="text-[11px] font-bold text-vanguard-muted uppercase tracking-widest">
            Security / Initial Credentials
          </label>
          <div className="p-4 bg-[#F8FAFC] border border-dashed border-[#E2E8F0] rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-vanguard-gray-800 uppercase tracking-tighter">Temporary Access Key</p>
              <p className="text-[13px] font-mono text-vanguard-blue mt-0.5">{temporaryPassword}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-vanguard-muted font-medium italic">Reset Required</p>
              <p className="text-[9px] text-vanguard-muted uppercase tracking-tighter mt-0.5">
                {initialData ? 'Existing invite credential' : 'Use on main login page'}
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
