import { useState } from 'react';
import { DataTable } from '@/src/components/shared/DataTable';
import { Badge } from '@/src/components/ui/Badge';
import { Member, useUserStore } from '@/src/store/useUserStore';
import { MoreVertical, Edit2, Trash2, Ban, User } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

interface MemberTableProps {
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  searchQuery?: string;
}

const MemberTable = ({ onEdit, onDelete, searchQuery = '' }: MemberTableProps) => {
  const { id: divisionId } = useParams();
  const { getMembersByDivision, members: allMembers, toggleStatus } = useUserStore();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const divisionMembers = divisionId ? getMembersByDivision(divisionId) : allMembers;

  const displayMembers = divisionMembers.filter(member => {
    const searchLower = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.role.toLowerCase().includes(searchLower) ||
      member.divisionId.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    {
      header: 'Name',
      key: 'name',
      render: (item: Member) => (
        <div className="flex items-center space-x-4">
          <div 
            className="w-10 h-10 rounded-lg overflow-hidden shrink-0 cursor-pointer hover:ring-2 hover:ring-vanguard-blue transition-all"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/members/${item.id}`);
            }}
          >
             <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 
              className="font-bold text-vanguard-gray-800 tracking-tight cursor-pointer hover:text-vanguard-blue transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/members/${item.id}`);
              }}
            >
              {item.name}
            </h4>
            <p className="text-[12px] text-vanguard-muted opacity-60">
               {item.email}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      key: 'role',
      render: (item: Member) => (
        <span className="text-[13px] font-medium text-vanguard-gray-800">{item.role}</span>
      )
    },
    {
      header: 'Division',
      key: 'divisionId',
      render: (item: Member) => (
        <span className="text-[13px] font-medium text-vanguard-muted">{item.divisionId}</span>
      )
    },
    {
      header: 'Joined Date',
      key: 'joinedDate',
      render: (item: Member) => (
        <span className="text-[13px] text-vanguard-muted">{item.joinedDate}</span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (item: Member) => (
        <Badge variant={item.status === 'Active' ? 'active' : item.status === 'Suspended' ? 'suspended' : 'default'}>
          {item.status}
        </Badge>
      )
    },
    {
      header: '',
      key: 'actions',
      align: 'right' as const,
      render: (item: Member) => (
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === item.id ? null : item.id);
            }}
            className="p-2 hover:bg-vanguard-gray-100 rounded-lg text-vanguard-muted hover:text-vanguard-gray-800 transition-colors"
          >
            <MoreVertical size={18} />
          </button>
          
          {activeMenu === item.id && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setActiveMenu(null)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-vanguard-gray-100 py-2 z-20">
                <button 
                  onClick={() => { onEdit(item); setActiveMenu(null); }}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-vanguard-gray-800 hover:bg-vanguard-gray-50 transition-colors"
                >
                  <Edit2 size={16} className="mr-3 text-vanguard-muted" /> Edit Member
                </button>
                <button 
                  onClick={() => { navigate(`/members/${item.id}`); setActiveMenu(null); }}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-vanguard-gray-800 hover:bg-vanguard-gray-50 transition-colors"
                >
                  <User size={16} className="mr-3 text-vanguard-muted" /> View Profile
                </button>
                <button 
                  onClick={() => { toggleStatus(item.id); setActiveMenu(null); }}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-vanguard-gray-800 hover:bg-vanguard-gray-50 transition-colors"
                >
                  <Ban size={16} className="mr-3 text-vanguard-muted" /> {item.status === 'Suspended' ? 'Activate' : 'Suspend'}
                </button>
                <div className="h-px bg-vanguard-gray-100 my-1" />
                <button 
                  onClick={() => { onDelete(item); setActiveMenu(null); }}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} className="mr-3" /> Delete Member
                </button>
              </div>
            </>
          )}
        </div>
      )
    }
  ];

  return <DataTable columns={columns} data={displayMembers} />;
};

export default MemberTable;
