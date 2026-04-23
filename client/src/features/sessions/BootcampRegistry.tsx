import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDivisionStore } from '@/src/store/useDivisionStore';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import { StatCard } from '@/src/components/shared/StatCard';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { DataTable } from '@/src/components/shared/DataTable';
import { Plus, Layout, Eye, MoreVertical, TrendingUp, Star } from 'lucide-react';
import PageShell from '@/src/components/layout/PageShell';
import { useNavigate, useParams } from 'react-router-dom';
import { adminRoutes } from '@/src/constants/routes';

const BootcampRegistry = () => {
  const { id: divisionId } = useParams();
  const navigate = useNavigate();
  const { getDivisionById, fetchDivisions, ensureDivision } = useDivisionStore();
  const { getBootcampsByDivision, bootcamps: allBootcamps, fetchBootcamps, isLoading } = useBootcampStore();

  const currentDivision = divisionId ? getDivisionById(divisionId) : null;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Draft' | 'Archived'>('all');

  const divisionBootcamps = divisionId ? getBootcampsByDivision(divisionId) : allBootcamps;
  const filteredBootcamps = useMemo(() => {
    return divisionBootcamps.filter((bootcamp) => {
      const matchesSearch = bootcamp.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
      const matchesStatus = statusFilter === 'all' || bootcamp.lifecycle === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [divisionBootcamps, searchTerm, statusFilter]);

  useEffect(() => {
    void fetchBootcamps();
    void fetchDivisions();
    if (divisionId) void ensureDivision(divisionId);
  }, [divisionId, fetchBootcamps, fetchDivisions, ensureDivision]);

  const columns = [
    { 
      header: 'Program Details', 
      key: 'name',
      render: (item: any) => (
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white bg-vanguard-blue">
             <Layout size={18} />
          </div>
          <div>
            <h4 className="font-black text-vanguard-gray-800 tracking-tight">{item.name}</h4>
            <p className="text-[10px] font-bold text-vanguard-gray-800 opacity-40 uppercase tracking-widest">
               Duration: {item.duration} • Cohort {item.cohort}
            </p>
          </div>
        </div>
      )
    },
    { 
      header: 'Status', 
      key: 'status',
      render: (item: any) => (
        <div className="flex flex-col gap-1">
          <Badge variant={item.status}>{item.lifecycle}</Badge>
        </div>
      )
    },
    { 
      header: 'Students', 
      key: 'students',
      render: (item: any) => (
        <div className="text-center">
           <p className="font-black text-vanguard-gray-800">{item.students}</p>
           <p className="text-[10px] font-bold text-vanguard-gray-800 opacity-40 uppercase tracking-widest">Enrolled</p>
        </div>
      )
    },
    { 
      header: 'Progress', 
      key: 'progress',
      render: (item: any) => (
        <div className="flex items-center space-x-4 w-48">
          <div className="h-1.5 flex-1 bg-vanguard-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-vanguard-blue"
              style={{ width: `${item.progress}%` }}
            />
          </div>
          <span className="text-[10px] font-black text-vanguard-gray-800 min-w-[30px]">{item.progress}%</span>
        </div>
      )
    },
    { 
      header: 'Actions', 
      key: 'actions',
      align: 'center' as const,
      render: (item: any) => (
        <div className="flex items-center justify-center space-x-2">
           <button 
             onClick={(e) => {
               e.stopPropagation();
               navigate(adminRoutes.bootcamp(item.id));
             }}
             className="p-2 hover:bg-vanguard-gray-100 rounded-lg text-vanguard-gray-800 opacity-40 hover:opacity-100 transition-all"
           >
              <Eye size={18} />
           </button>
           <button className="p-2 hover:bg-vanguard-gray-100 rounded-lg text-vanguard-gray-800 opacity-40 hover:opacity-100 transition-all">
              <MoreVertical size={18} />
           </button>
        </div>
      )
    },
  ];

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-vanguard-gray-800 opacity-50 mb-1">
              {currentDivision ? `${currentDivision.name} Pillar` : 'Vanguard Registry'}
            </p>
            <h1 className="text-4xl font-black text-vanguard-gray-800 tracking-tight tracking-tighter">Bootcamps</h1>
          </div>
          <div className="flex space-x-3">
             <Link
               to={
                 divisionId
                   ? `${adminRoutes.manageBootcamps}?division=${divisionId}`
                   : adminRoutes.manageBootcamps
               }
               className="inline-flex items-center rounded-lg h-10 px-6 uppercase tracking-widest text-xs font-black bg-vanguard-blue text-white hover:bg-vanguard-blue-dark shadow-sm"
             >
                <Plus size={16} className="mr-2" /> Add bootcamp
             </Link>
             <input
               type="text"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Search bootcamp"
               className="h-10 rounded-lg border border-vanguard-gray-200 px-3 text-sm text-vanguard-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vanguard-blue"
             />
             <select
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Active' | 'Draft' | 'Archived')}
               className="h-10 rounded-lg border border-vanguard-gray-200 px-3 text-sm text-vanguard-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vanguard-blue"
             >
               <option value="all">All statuses</option>
               <option value="Active">Active</option>
               <option value="Draft">Draft</option>
               <option value="Archived">Archived</option>
             </select>
          </div>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
           <Card className="flex items-center justify-between p-8">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-vanguard-gray-800 opacity-50 mb-1">Pillar Capacity</p>
                 <h2 className="text-4xl font-black text-[#003B7A]">
                    {filteredBootcamps.reduce((acc, curr) => acc + curr.students, 0).toLocaleString()}
                 </h2>
              </div>
              <div className="w-12 h-12 bg-vanguard-blue-light rounded-xl flex items-center justify-center text-vanguard-blue">
                 <TrendingUp size={24} />
              </div>
           </Card>
           <div className="grid grid-cols-2 gap-8 lg:col-span-2">
              <Card className="flex flex-col justify-center items-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-vanguard-gray-800 opacity-50 mb-1">Avg. Retention</p>
                 <h2 className="text-3xl font-black text-vanguard-gray-800">94%</h2>
              </Card>
              <Card className="flex items-center justify-between">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-vanguard-gray-800 opacity-50 mb-1">Success Rate</p>
                    <h2 className="text-3xl font-black text-vanguard-gray-800">88%</h2>
                 </div>
                 <div className="w-12 h-12 bg-[#FFF0E6] rounded-xl flex items-center justify-center text-[#E67E22]">
                    <Star size={24} />
                 </div>
              </Card>
           </div>
        </div>

        {isLoading && <p className="text-sm text-vanguard-muted mb-4">Loading bootcamps…</p>}

        <DataTable 
          columns={columns} 
          data={filteredBootcamps} 
          onRowClick={(item: any) => navigate(adminRoutes.bootcamp(item.id))}
        />
      </div>
    </PageShell>
  );
};

export default BootcampRegistry;
