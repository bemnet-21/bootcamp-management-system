import { useState } from 'react';
import PageShell from '@/src/components/layout/PageShell';
import { Button } from '@/src/components/ui/Button';
import { Plus, Search, Filter, X, AlertTriangle } from 'lucide-react';
import MemberTable from './components/MemberTable';
import AddMemberForm from './components/AddMemberForm';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { Member, useUserStore } from '@/src/store/useUserStore';

const MembersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const { deleteMember } = useUserStore();

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setIsDrawerOpen(true);
  };

  const handleDelete = (member: Member) => {
    setDeletingMember(member);
  };

  const confirmDelete = () => {
    if (deletingMember) {
      deleteMember(deletingMember.id);
      toast.success('Member removed from directory');
      setDeletingMember(null);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingMember(null);
  };

  return (
    <PageShell>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-vanguard-muted mb-1">
              Organization
            </p>
            <h1 className="text-4xl font-bold text-vanguard-gray-800 tracking-tight">
              Member Directory
            </h1>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              className="h-10 px-6 uppercase tracking-wider text-[12px] font-bold"
            >
              <Plus size={16} className="mr-2" /> Add Member
            </Button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-vanguard-muted opacity-40" size={18} />
            <input 
              type="text" 
              placeholder="Search members by name, email or role..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-lg text-sm focus:ring-1 focus:ring-vanguard-blue outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="h-10 px-4 text-vanguard-muted">
              <Filter size={16} className="mr-2" /> Filter
            </Button>
            <Button variant="outline" className="h-10 px-4 text-vanguard-muted">
              Export CSV
            </Button>
          </div>
        </div>

        <MemberTable 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          searchQuery={searchQuery}
        />
      </div>

      {/* Side Drawer Modal */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-[450px] bg-white shadow-2xl z-[70] flex flex-col"
            >
              <div className="p-8 border-b border-vanguard-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-vanguard-gray-800 tracking-tight">
                    {editingMember ? 'Edit Member' : 'Add New Member'}
                  </h2>
                  <button 
                    onClick={closeDrawer}
                    className="p-2 hover:bg-vanguard-gray-50 rounded-lg text-vanguard-muted transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <p className="text-[13px] text-vanguard-muted leading-relaxed">
                  {editingMember 
                    ? `Updating profile for ${editingMember.name}. All changes are applied instantly.` 
                    : 'Create a new Vanguard account from this admin-only workspace. The issued temporary password can then be used on the main login page.'}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <AddMemberForm 
                  onSuccess={closeDrawer} 
                  initialData={editingMember} 
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingMember && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingMember(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-6">
                 <AlertTriangle size={24} />
              </div>
              <h2 className="text-2xl font-bold text-vanguard-gray-800 mb-2">Delete Member?</h2>
              <p className="text-vanguard-muted text-sm mb-8 leading-relaxed">
                You are about to remove <span className="font-bold text-vanguard-gray-800">{deletingMember.name}</span> from the directory. 
                This action will revoke all system access and cannot be undone.
              </p>
              <div className="flex gap-4">
                 <Button 
                   variant="outline" 
                   className="flex-1"
                   onClick={() => setDeletingMember(null)}
                 >
                   Cancel
                 </Button>
                 <Button 
                   className="flex-1 bg-red-600 hover:bg-red-700 border-none"
                   onClick={confirmDelete}
                 >
                   Delete Member
                 </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageShell>
  );
};

export default MembersPage;
