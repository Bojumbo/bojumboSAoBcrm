import { useEffect, useMemo, useState } from 'react';
import GlassCard from '../components/GlassCard';
import { ProjectsService } from '../services/ProjectsService';
import { FunnelsService, Funnel, FunnelStage } from '../services/FunnelsService';
import ProjectDrawer from './ProjectDrawer';

type Project = {
  project_id: number;
  name: string;
  forecast_amount: number;
  funnel_id?: number | null;
  funnel_stage_id?: number | null;
  main_responsible_manager?: { manager_id: number; first_name: string; last_name: string } | null;
};

function ProjectCard({ p, onClick }: { p: Project; onClick?: () => void }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', String(p.project_id));
        e.dataTransfer.setData('application/x-stage', String(p.funnel_stage_id ?? ''));
      }}
  onClick={onClick}
  className="glass bg-white/5 border border-white/20 rounded-xl p-3 mb-3 cursor-pointer active:cursor-grabbing"
    >
      <div className="text-sm font-medium">{p.name}</div>
      <div className="text-xs opacity-70 mt-1">Прогноз: {new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(p.forecast_amount || 0)}</div>
  <div className="text-xs opacity-70 mt-1">Менеджер: {p.main_responsible_manager ? `${p.main_responsible_manager.first_name} ${p.main_responsible_manager.last_name}` : '—'}</div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [selectedFunnelId, setSelectedFunnelId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [pRes, fRes] = await Promise.all([
          ProjectsService.getAll(),
          FunnelsService.getAll()
        ]);
        if (!mounted) return;
        setProjects((pRes.data || pRes) as Project[]);
        setFunnels(fRes);
        if (!selectedFunnelId && fRes.length > 0) {
          setSelectedFunnelId(fRes[0].funnel_id);
        }
      } catch (e: any) {
        setError(e?.message || 'Помилка завантаження');
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const funnel = useMemo(
    () => funnels.find(f => f.funnel_id === selectedFunnelId) || funnels[0],
    [funnels, selectedFunnelId]
  );
  const columns = funnel?.stages || [];

  const grouped = useMemo(() => {
    const map = new Map<number, Project[]>();
    for (const s of columns) map.set(s.funnel_stage_id, []);
    const visible = projects.filter(p => (selectedFunnelId ? p.funnel_id === selectedFunnelId : true));
    for (const p of visible) {
      if (p.funnel_stage_id && map.has(p.funnel_stage_id)) {
        map.get(p.funnel_stage_id)!.push(p);
      }
    }
    return map;
  }, [projects, columns, selectedFunnelId]);

  const unassigned = useMemo(() => {
    if (!selectedFunnelId) return [] as Project[];
    const byStage = new Set<number>();
    for (const s of columns) byStage.add(s.funnel_stage_id);
    return projects.filter(p => p.funnel_id === selectedFunnelId && (!p.funnel_stage_id || !byStage.has(p.funnel_stage_id)));
  }, [projects, columns, selectedFunnelId]);

  const onDropTo = async (stage: FunnelStage, e: React.DragEvent) => {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData('text/plain'));
    if (!id || updating) return;
    setUpdating(true);
    try {
      await ProjectsService.update(id, { funnel_stage_id: stage.funnel_stage_id });
      setProjects((prev) => prev.map(p => p.project_id === id ? { ...p, funnel_stage_id: stage.funnel_stage_id, funnel_id: stage.funnel_id } : p));
    } catch (err) {
      // could show toast
    } finally {
      setUpdating(false);
    }
  };

  const allowDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const openDrawer = (id: number) => {
    setActiveId(id);
    setDrawerOpen(true);
  };

  const refresh = async () => {
    try {
      const pRes = await ProjectsService.getAll();
      setProjects((pRes.data || pRes) as Project[]);
    } catch {}
  };

  return (
    <div className="space-y-4">
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Проєкти — Канбан</h2>
          <div className="flex items-center gap-3">
            <select
              value={selectedFunnelId ?? ''}
              onChange={(e) => setSelectedFunnelId(Number(e.target.value))}
              className="glass bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-sm"
            >
              {funnels.map(f => (
                <option key={f.funnel_id} value={f.funnel_id}>{f.name}</option>
              ))}
            </select>
            {updating && <div className="text-xs opacity-70">Оновлення...</div>}
          </div>
        </div>
      </GlassCard>

      {loading && <GlassCard className="p-6">Завантаження...</GlassCard>}
      {error && <GlassCard className="p-6 text-red-400">{error}</GlassCard>}

      {!loading && !error && (
  <div className="overflow-x-auto pb-2 max-w-full min-w-0 snap-x snap-mandatory overscroll-x-contain glass-scrollbar">
          <div className="flex gap-4 w-max pr-2">
            {unassigned.length > 0 && (
              <div className="flex flex-col w-[320px] flex-shrink-0 snap-start">
                <div className="mb-2 px-1 text-sm font-semibold opacity-85">Без етапу</div>
                <GlassCard className="p-3 h-[70vh] glass-scroll-y">
                  {unassigned.map(p => (<ProjectCard key={p.project_id} p={p} onClick={() => openDrawer(p.project_id)} />))}
                </GlassCard>
              </div>
            )}
            {columns.map((col) => (
              <div key={col.funnel_stage_id} className="flex flex-col w-[320px] flex-shrink-0 snap-start">
                <div className="mb-2 px-1 text-sm font-semibold opacity-85">{col.name}</div>
                <GlassCard
                  className="p-3 h-[70vh] glass-scroll-y"
                  onDrop={(e) => onDropTo(col, e)}
                  onDragOver={allowDrop}
                >
                  {(grouped.get(col.funnel_stage_id) || []).map(p => (
                    <ProjectCard key={p.project_id} p={p} onClick={() => openDrawer(p.project_id)} />
                  ))}
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      )}

      <ProjectDrawer
        projectId={activeId}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSaved={async () => {
          await refresh();
          setDrawerOpen(false);
        }}
      />
    </div>
  );
}
