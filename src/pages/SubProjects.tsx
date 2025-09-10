import { useEffect, useMemo, useState } from 'react';
import GlassCard from '../components/GlassCard';
import { SubProjectsService } from '../services/SubProjectsService';
import SubProjectFunnelsService from '../services/SubProjectFunnelsService';
import SubProjectDrawer from './SubProjectDrawer';
import { SubProjectFunnel, SubProjectFunnelStage } from '../../backend/src/types';

type SubProject = {
  subproject_id: number;
  name: string;
  cost: number;
  sub_project_funnel_id?: number | null;
  sub_project_funnel_stage_id?: number | null;
  project?: { project_id: number; name: string; } | null;
};

function SubProjectCard({ p, onClick }: { p: SubProject; onClick?: () => void }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', String(p.subproject_id));
        e.dataTransfer.setData('application/x-stage', String(p.sub_project_funnel_stage_id ?? ''));
      }}
      onClick={onClick}
      className="glass bg-white/5 border border-white/20 rounded-xl p-3 mb-3 cursor-pointer active:cursor-grabbing"
    >
      <div className="text-sm font-medium">{p.name}</div>
      <div className="text-xs opacity-70 mt-1">Вартість: {new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(p.cost || 0)}</div>
      <div className="text-xs opacity-70 mt-1">Проект: {p.project ? p.project.name : '—'}</div>
    </div>
  );
}

export default function SubProjects() {
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);
  const [funnels, setFunnels] = useState<SubProjectFunnel[]>([]);
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
          SubProjectsService.getAll(),
          SubProjectFunnelsService.getAll()
        ]);
        if (!mounted) return;
        setSubProjects((pRes.data || pRes) as SubProject[]);
        setFunnels(fRes);
        if (!selectedFunnelId && fRes.length > 0) {
          setSelectedFunnelId(fRes[0].sub_project_funnel_id);
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
    () => funnels.find(f => f.sub_project_funnel_id === selectedFunnelId) || funnels[0],
    [funnels, selectedFunnelId]
  );
  const columns = funnel?.stages || [];

  const grouped = useMemo(() => {
    const map = new Map<number, SubProject[]>();
    for (const s of columns) map.set(s.sub_project_funnel_stage_id, []);
    const visible = subProjects.filter(p => (selectedFunnelId ? p.sub_project_funnel_id === selectedFunnelId : true));
    for (const p of visible) {
      if (p.sub_project_funnel_stage_id && map.has(p.sub_project_funnel_stage_id)) {
        map.get(p.sub_project_funnel_stage_id)!.push(p);
      }
    }
    return map;
  }, [subProjects, columns, selectedFunnelId]);

  const unassigned = useMemo(() => {
    if (!selectedFunnelId) return [] as SubProject[];
    const byStage = new Set<number>();
    for (const s of columns) byStage.add(s.sub_project_funnel_stage_id);
    return subProjects.filter(p => p.sub_project_funnel_id === selectedFunnelId && (!p.sub_project_funnel_stage_id || !byStage.has(p.sub_project_funnel_stage_id)));
  }, [subProjects, columns, selectedFunnelId]);

  const onDropTo = async (stage: SubProjectFunnelStage, e: React.DragEvent) => {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData('text/plain'));
    if (!id || updating) return;
    setUpdating(true);
    try {
      await SubProjectsService.update(id, { sub_project_funnel_stage_id: stage.sub_project_funnel_stage_id });
      setSubProjects((prev) => prev.map(p => p.subproject_id === id ? { ...p, sub_project_funnel_stage_id: stage.sub_project_funnel_stage_id, sub_project_funnel_id: stage.sub_project_funnel_id } : p));
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
      const pRes = await SubProjectsService.getAll();
      setSubProjects((pRes.data || pRes) as SubProject[]);
    } catch {}
  };

  return (
    <div className="space-y-4">
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Підпроєкти — Канбан</h2>
          <div className="flex items-center gap-3">
            <select
              value={selectedFunnelId ?? ''}
              onChange={(e) => setSelectedFunnelId(Number(e.target.value))}
              className="glass bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-sm"
            >
              {funnels.map(f => (
                <option key={f.sub_project_funnel_id} value={f.sub_project_funnel_id}>{f.name}</option>
              ))}
            </select>
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
                  {unassigned.map(p => (<SubProjectCard key={p.subproject_id} p={p} onClick={() => openDrawer(p.subproject_id)} />))}
                </GlassCard>
              </div>
            )}
            {columns.map((col: SubProjectFunnelStage) => (
              <div
                key={col.sub_project_funnel_stage_id}
                className="w-72 flex-shrink-0 bg-black/20 rounded-xl p-4"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDropTo(col, e)}
              >
                <div className="text-lg font-bold mb-4 text-gray-200">{col.name}</div>
                <div>
                  {(grouped.get(col.sub_project_funnel_stage_id) || []).map(p => (
                    <SubProjectCard key={p.subproject_id} p={p} onClick={() => { setActiveId(p.subproject_id); setDrawerOpen(true); }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <SubProjectDrawer
        subprojectId={activeId}
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
