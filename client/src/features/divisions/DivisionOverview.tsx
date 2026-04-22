import { useDivisionStore, type Division } from '@/src/store/useDivisionStore';
import { useBootcampStore } from '@/src/store/useBootcampStore';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { ArrowRight, Monitor, Code, Shield, Lightbulb, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PageShell from '@/src/components/layout/PageShell';
import { useEffect, useMemo } from 'react';
import { adminRoutes } from '@/src/constants/routes';
import type { DivisionVisualKey } from '@/src/lib/divisionPresentation';
import {
  FOUR_PILLARS,
  divisionHeroImage,
  pillarCanonicalSubtitle,
  pillarCanonicalTitle,
  pillarPlaceholderDescription,
  type FourPillarKey,
} from '@/src/lib/divisionPresentation';

const iconMap: Record<DivisionVisualKey, typeof Monitor> = {
  ds: Monitor,
  dev: Code,
  cyber: Shield,
  cpd: Lightbulb,
  generic: Monitor,
};

const DivisionOverview = () => {
  const { divisions, setActiveDivision, fetchDivisions, isLoading, error } = useDivisionStore();
  const { bootcamps, fetchBootcamps } = useBootcampStore();
  const navigate = useNavigate();

  useEffect(() => {
    setActiveDivision(null);
  }, [setActiveDivision]);

  useEffect(() => {
    fetchDivisions().catch(() => {});
    fetchBootcamps().catch(() => {});
  }, [fetchDivisions, fetchBootcamps]);

  const activeBootcampCountByDivision = useMemo(() => {
    const m: Record<string, number> = {};
    for (const b of bootcamps) {
      if (b.lifecycle === 'Archived') continue;
      m[b.divisionId] = (m[b.divisionId] || 0) + 1;
    }
    return m;
  }, [bootcamps]);

  const { pillarSlots, extraDivisions } = useMemo(() => {
    const mapFirst = new Map<FourPillarKey, Division>();
    for (const d of divisions) {
      if (d.visualKey === 'generic') continue;
      if (!FOUR_PILLARS.includes(d.visualKey as FourPillarKey)) continue;
      const k = d.visualKey as FourPillarKey;
      if (!mapFirst.has(k)) mapFirst.set(k, d);
    }
    const pillarSlots = FOUR_PILLARS.map((pillar) => ({
      pillar,
      division: mapFirst.get(pillar) ?? null,
    }));
    const extraDivisions = divisions.filter((d) => {
      if (d.visualKey === 'generic') return true;
      if (!FOUR_PILLARS.includes(d.visualKey as FourPillarKey)) return true;
      const first = mapFirst.get(d.visualKey as FourPillarKey);
      return !!(first && first.id !== d.id);
    });
    return { pillarSlots, extraDivisions };
  }, [divisions]);

  const totalMembers = useMemo(
    () => divisions.reduce((acc, d) => acc + (d.stats?.members ?? 0), 0),
    [divisions],
  );

  const handleViewDivision = (div: Division) => {
    setActiveDivision(div);
    navigate(adminRoutes.division(div.id));
  };

  const goManageDivisions = () => {
    navigate(adminRoutes.manageDivisions);
  };

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-vanguard-gray-800 tracking-tight mb-2">
            Division Overview
          </h1>
          {error && <p className="text-sm text-red-600 mt-2 font-medium">{error}</p>}
          {isLoading && <p className="text-sm text-vanguard-muted mt-2">Loading divisions…</p>}
        </div>

        {!isLoading && divisions.length === 0 && (
          <Card className="p-10 mb-10 text-center">
            <p className="text-vanguard-gray-800 font-bold mb-2">No divisions in the database yet</p>
            <p className="text-sm text-vanguard-muted mb-6">
              The four default pillar cards still show below as placeholders. Add matching divisions on the Divisions page, or
              seed Data Science, Development, Cybersecurity, and CPD.
            </p>
            <Link
              to={adminRoutes.manageDivisions}
              className="inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-[15px] font-bold bg-vanguard-blue text-white hover:bg-vanguard-blue-dark shadow-sm"
            >
              Open divisions admin
            </Link>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pillarSlots.map(({ pillar, division }, idx) => {
            const isPlaceholder = !division;
            const Icon = iconMap[pillar];
            const title = pillarCanonicalTitle(pillar);
            const subtitle = pillarCanonicalSubtitle(pillar);
            const description = division?.description?.trim() || pillarPlaceholderDescription(pillar);
            const image = division?.image ?? divisionHeroImage(pillar);
            const activePrograms = division ? activeBootcampCountByDivision[division.id] ?? 0 : 0;

            return (
              <Card
                key={pillar}
                noPadding
                className="group hover:-translate-y-1 transition-transform cursor-pointer"
                onClick={() => (isPlaceholder ? goManageDivisions() : handleViewDivision(division))}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
                  <div className="absolute top-6 left-6 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-vanguard-blue border border-vanguard-gray-100">
                    <Icon size={24} />
                  </div>
                </div>

                <div className="p-8 -mt-16 relative z-10 bg-white/60 backdrop-blur-sm rounded-b-xl border-t border-white/50">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-vanguard-blue mb-1">
                        Default pillar {idx + 1}
                      </p>
                      <h2 className="text-3xl font-black text-vanguard-gray-800 tracking-tight">{title}</h2>
                      {subtitle && (
                        <p className="text-xs font-semibold text-vanguard-muted mt-1 tracking-wide">{subtitle}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-vanguard-gray-800 leading-none">{activePrograms}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-40">
                        Active bootcamps
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-vanguard-gray-800 opacity-60 mb-8 leading-relaxed line-clamp-3">
                    {description}
                  </p>

                  <Button
                    variant="outline"
                    className="w-full h-11 border-vanguard-gray-200 group-hover:bg-vanguard-blue group-hover:text-white transition-all"
                  >
                    {isPlaceholder ? (
                      <>
                        Set up in Divisions <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    ) : (
                      <>
                        View Division <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}

          {extraDivisions.map((div) => {
            const Icon = iconMap[div.visualKey] ?? Monitor;
            const activePrograms = activeBootcampCountByDivision[div.id] ?? 0;
            return (
              <Card
                key={div.id}
                noPadding
                className="group hover:-translate-y-1 transition-transform cursor-pointer"
                onClick={() => handleViewDivision(div)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={div.image}
                    alt={div.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
                  <div className="absolute top-6 left-6 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-vanguard-blue border border-vanguard-gray-100">
                    <Icon size={24} />
                  </div>
                </div>

                <div className="p-8 -mt-16 relative z-10 bg-white/60 backdrop-blur-sm rounded-b-xl border-t border-white/50">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-vanguard-muted mb-1">
                        Additional division
                      </p>
                      <h2 className="text-3xl font-black text-vanguard-gray-800 tracking-tight">{div.name}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-vanguard-gray-800 leading-none">{activePrograms}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-40">
                        Active bootcamps
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-vanguard-gray-800 opacity-60 mb-8 leading-relaxed line-clamp-2">
                    {div.description || '—'}
                  </p>

                  <Button
                    variant="outline"
                    className="w-full h-11 border-vanguard-gray-200 group-hover:bg-vanguard-blue group-hover:text-white transition-all"
                  >
                    View Division <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Statistics Footer */}
        <div className="mt-16 p-10 bg-vanguard-blue-light/50 rounded-2xl flex flex-wrap gap-x-20 gap-y-10 items-center justify-between border border-vanguard-blue/10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-50 mb-1">
              Total enrollment (divisions)
            </p>
            <h3 className="text-3xl font-black text-vanguard-gray-800">{totalMembers.toLocaleString()}</h3>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-50 mb-1">
              Active bootcamps
            </p>
            <h3 className="text-3xl font-black text-vanguard-gray-800">
              {bootcamps.filter((b) => b.lifecycle !== 'Archived').length}
            </h3>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-50 mb-1">
              Divisions (database)
            </p>
            <h3 className="text-3xl font-black text-vanguard-gray-800">{divisions.length}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-vanguard-blue opacity-60" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-vanguard-gray-800 opacity-50">
              Live from API
            </span>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default DivisionOverview;
