import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/src/store/useAuthStore';
import { studentService, Resource } from '@/src/api/studentService';
import { toast } from 'sonner';

const StudentResources = () => {
  const { user } = useAuthStore();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'PDF', 'Link', 'Image', 'ZIP'];

  useEffect(() => {
    const fetchResourcesData = async () => {
      try {
        setLoading(true);
        const divisionId = user?.divisions?.[0];
        const sessions = await studentService.getSessions(divisionId);
        
        if (sessions.length > 0 && (sessions[0] as any).bootcamp) {
          const bootcampId = (sessions[0] as any).bootcamp;
          const fetchedResources = await studentService.getResources(bootcampId);
          setResources(fetchedResources);
        }
      } catch (error) {
        console.error('Resources fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchResourcesData();
  }, [user]);

  const filteredResources = resources.filter(res => 
    filter === 'All' || res.type.toUpperCase() === filter.toUpperCase()
  );

  const getIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'VIDEO': return 'play_circle';
      case 'PDF': return 'picture_as_pdf';
      case 'LINK': return 'link';
      case 'IMAGE': return 'image';
      default: return 'description';
    }
  };

  if (loading) return <div className="p-20 text-center font-bold">Accessing Repository...</div>;

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary font-label">Academic Repository</span>
          <h1 className="font-headline font-extrabold text-5xl text-on-surface mt-2 leading-tight">Resources</h1>
          <p className="text-on-surface-variant text-lg mt-4 max-w-xl font-body">Deepen your technical mastery with modules, architecture diagrams, and comprehensive code deep-dives.</p>
        </div>
        <div className="flex flex-wrap gap-2 p-1.5 bg-surface-container-low rounded-2xl border border-outline-variant/10">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all font-label uppercase tracking-widest ${filter === cat ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-container'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid of Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredResources.length > 0 ? filteredResources.map((res, index) => (
          <div key={res._id} className="group bg-surface-container-lowest rounded-3xl p-8 shadow-sm transition-all hover:translate-y-[-4px] relative border border-outline-variant/10 hover:border-primary/20">
            <div className="flex flex-col h-full">
              <div className={`h-16 w-16 rounded-2xl bg-surface-container flex items-center justify-center mb-6 shadow-sm`}>
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {getIcon(res.type)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-label whitespace-nowrap">{res.type}</span>
              </div>
              <h3 className="text-xl font-headline font-bold text-on-surface group-hover:text-primary transition-colors">{res.title}</h3>
              <div className="mt-8 pt-6 border-t border-outline-variant/20 flex items-center justify-between">
                <div className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest font-label">
                  {new Date(res.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                   {res.type.toUpperCase() === 'LINK' ? (
                      <a 
                        href={res.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-xl font-bold text-xs hover:brightness-105 transition-all font-label uppercase tracking-widest shadow-sm"
                      >
                        Open
                      </a>
                   ) : (
                      <a 
                        href={res.url} 
                        download 
                        target="_blank"
                        className="text-primary hover:bg-primary-fixed p-2 rounded-xl transition-all shadow-sm bg-surface-container-low"
                      >
                        <span className="material-symbols-outlined text-lg">download</span>
                      </a>
                   )}
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-3 py-20 text-center text-on-surface-variant opacity-40 font-bold uppercase tracking-widest border-2 border-dashed border-outline-variant/10 rounded-3xl">
            No resources found matching the criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResources;
