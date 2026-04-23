import { useState, useMemo } from 'react';
import { DataTable } from '@/src/components/shared/DataTable';
import { Badge } from '@/src/components/ui/Badge';
import { Member } from '@/src/store/useUserStore';
import type { Bootcamp } from '@/src/store/useBootcampStore';
import { MoreVertical, Edit2, Trash2, Ban, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { adminRoutes } from '@/src/constants/routes';
import { useUserStore } from '@/src/store/useUserStore';

interface MemberTableProps {
  members: Member[];
  bootcamps?: Bootcamp[];
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  searchQuery?: string;
}

const statusVariant = (status: Member['status']) => {
  if (status === 'Active') return 'active';
  if (status === 'Suspended') return 'suspended';
  if (status === 'Graduated') return 'graduated';
  return 'default';
};

function bootcampSummaryForMember(memberId: string, bootcamps: Bootcamp[] | undefined): string {
  if (!bootcamps?.length) return '—';
  const names = bootcamps.filter((b) => b.studentIds.includes(memberId)).map((b) => b.name);
  return names.length ? names.join(', ') : '—';
}

const MemberTable = ({ members, bootcamps, onEdit, onDelete, searchQuery = '' }: MemberTableProps) => {
  const { toggleStatus } = useUserStore();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return members.filter((member) => {
      const bc = bootcampSummaryForMember(member.id, bootcamps);
      return (
        member.name.toLowerCase().includes(q) ||
        member.email.toLowerCase().includes(q) ||
        member.role.toLowerCase().includes(q) ||
        member.divisionId.toLowerCase().includes(q) ||
        bc.toLowerCase().includes(q)
      );
    });
  }, [members, bootcamps, searchQuery]);

  const columns = [
    {
      header: 'Name',
      key: 'name',
      render: (item: Member) => (
        <div className="flex items-center space-x-4">
          <div
            className="h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-lg transition-all hover:ring-2 hover:ring-vanguard-blue"
            onClick={(e) => {
              e.stopPropagation();
              navigate(adminRoutes.member(item.id));
            }}
          >
            <img src={item.avatar} alt={item.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h4
              className="cursor-pointer font-bold tracking-tight text-vanguard-gray-800 transition-colors hover:text-vanguard-blue"
              onClick={(e) => {
                e.stopPropagation();
                navigate(adminRoutes.member(item.id));
              }}
            >
              {item.name}
            </h4>
            <p className="text-[12px] text-vanguard-muted opacity-60">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      key: 'role',
      render: (item: Member) => (
        <span className="text-[13px] font-medium text-vanguard-gray-800">{item.role}</span>
      ),
    },
    {
      header: 'Division',
      key: 'divisionId',
      render: (item: Member) => (
        <span className="text-[13px] font-medium text-vanguard-muted">{item.divisionId}</span>
      ),
    },
    {
      header: 'Bootcamps',
      key: 'bootcamps',
      render: (item: Member) => (
        <span className="max-w-[200px] text-[13px] font-medium text-vanguard-muted line-clamp-2">
          {bootcampSummaryForMember(item.id, bootcamps)}
        </span>
      ),
    },
    {
      header: 'Joined',
      key: 'joinedDate',
      render: (item: Member) => (
        <span className="text-[13px] text-vanguard-muted">{item.joinedDate}</span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (item: Member) => (
        <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
      ),
    },
    {
      header: '',
      key: 'actions',
      align: 'right' as const,
      render: (item: Member) => (
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === item.id ? null : item.id);
            }}
            className="rounded-lg p-2 text-vanguard-muted transition-colors hover:bg-vanguard-gray-100 hover:text-vanguard-gray-800"
          >
            <MoreVertical size={18} />
          </button>

          {activeMenu === item.id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
              <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-vanguard-gray-100 bg-white py-2 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    onEdit(item);
                    setActiveMenu(null);
                  }}
                  className="flex w-full items-center px-4 py-2.5 text-sm text-vanguard-gray-800 transition-colors hover:bg-vanguard-gray-50"
                >
                  <Edit2 size={16} className="mr-3 text-vanguard-muted" /> Edit member
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate(adminRoutes.member(item.id));
                    setActiveMenu(null);
                  }}
                  className="flex w-full items-center px-4 py-2.5 text-sm text-vanguard-gray-800 transition-colors hover:bg-vanguard-gray-50"
                >
                  <User size={16} className="mr-3 text-vanguard-muted" /> View profile
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await toggleStatus(item.id);
                      toast.success(`Member ${item.status === 'Suspended' ? 'activated' : 'suspended'}.`);
                    } catch (e: any) {
                      toast.error(e?.response?.data?.message || e?.message || 'Failed to update status.');
                    } finally {
                      setActiveMenu(null);
                    }
                  }}
                  className="flex w-full items-center px-4 py-2.5 text-sm text-vanguard-gray-800 transition-colors hover:bg-vanguard-gray-50"
                >
                  <Ban size={16} className="mr-3 text-vanguard-muted" />{' '}
                  {item.status === 'Suspended' ? 'Activate' : 'Suspend'}
                </button>
                <div className="my-1 h-px bg-vanguard-gray-100" />
                <button
                  type="button"
                  onClick={() => {
                    onDelete(item);
                    setActiveMenu(null);
                  }}
                  className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 size={16} className="mr-3" /> Delete member
                </button>
              </div>
            </>
          )}
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={rows} />;
};

export default MemberTable;
