import { useEffect, useMemo, useState } from 'react';
import GlassCard from '../../components/GlassCard';
import GlassButton from '../../components/GlassButton';
import SubProjectFunnelsService from '../../services/SubProjectFunnelsService';
import { SubProjectFunnel, SubProjectFunnelStage } from '../../../backend/src/types';

export default function SubProjectFunnelsSettings() {
  const [funnels, setFunnels] = useState<SubProjectFunnel[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingName, setCreatingName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const active = useMemo(() => funnels.find(f => f.sub_project_funnel_id === activeId) || funnels[0], [funnels, activeId]);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await SubProjectFunnelsService.getAll();
      setFunnels(data);
      if (!activeId && data.length) setActiveId(data[0].sub_project_funnel_id);
    } catch (e: any) {
      setError(e?.message || 'Помилка завантаження');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const addFunnel = async () => {
    const name = creatingName.trim();
    if (!name) return;
    try {
      const f = await SubProjectFunnelsService.create({ name });
      setCreatingName('');
      setFunnels(prev => [...prev, { ...f, stages: [] }]);
      setActiveId(f.sub_project_funnel_id);
    } catch {}
  };

  const removeFunnel = async (id: number) => {
    if (!confirm('Видалити воронку?')) return;
    try {
      await SubProjectFunnelsService.delete(id);
      setFunnels(prev => prev.filter(f => f.sub_project_funnel_id !== id));
      if (activeId === id) setActiveId(null);
    } catch {}
  };

  const renameFunnel = async (id: number, name: string) => {
    try {
      const upd = await SubProjectFunnelsService.update(id, { name });
      setFunnels(prev => prev.map(f => f.sub_project_funnel_id === id ? { ...f, name: upd.name } : f));
    } catch {}
  };

  const addStage = async () => {
    if (!active) return;
    const name = prompt('Назва етапу')?.trim();
    if (!name) return;
    try {
      const order = (active.stages[active.stages.length - 1]?.order ?? 0) + 1;
      const st = await SubProjectFunnelsService.createStage({ name, sub_project_funnel_id: active.sub_project_funnel_id, order });
      setFunnels(prev => prev.map(f => f.sub_project_funnel_id === active.sub_project_funnel_id ? { ...f, stages: [...f.stages, st].sort((a,b)=>a.order-b.order) } : f));
    } catch {}
  };

  const renameStage = async (st: SubProjectFunnelStage) => {
    const name = prompt('Нова назва етапу', st.name)?.trim();
    if (!name) return;
    try {
      const updated = await SubProjectFunnelsService.updateStage(st.sub_project_funnel_stage_id, { name });
      setFunnels(prev => prev.map(f => f.sub_project_funnel_id === st.sub_project_funnel_id ? { ...f, stages: f.stages.map(s => s.sub_project_funnel_stage_id===st.sub_project_funnel_stage_id? { ...s, name: updated.name } : s) } : f));
    } catch {}
  };

  const deleteStage = async (st: SubProjectFunnelStage) => {
    if (!confirm('Видалити етап?')) return;
    try {
      await SubProjectFunnelsService.deleteStage(st.sub_project_funnel_stage_id);
      setFunnels(prev => prev.map(f => f.sub_project_funnel_id === st.sub_project_funnel_id ? { ...f, stages: f.stages.filter(s => s.sub_project_funnel_stage_id!==st.sub_project_funnel_stage_id) } : f));
    } catch {}
  };

  // Simple drag reordering
  const onDragStart = (e: React.DragEvent, st: SubProjectFunnelStage) => {
    e.dataTransfer.setData('text/plain', String(st.sub_project_funnel_stage_id));
  };
  const onDrop = async (e: React.DragEvent, target: SubProjectFunnelStage) => {
    if (!active) return;
    e.preventDefault();
    const draggedId = Number(e.dataTransfer.getData('text/plain'));
    if (!draggedId || draggedId === target.sub_project_funnel_stage_id) return;
    const stages = [...active.stages];
    const fromIdx = stages.findIndex(s => s.sub_project_funnel_stage_id === draggedId);
    const toIdx = stages.findIndex(s => s.sub_project_funnel_stage_id === target.sub_project_funnel_stage_id);
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = stages.splice(fromIdx, 1);
    stages.splice(toIdx, 0, moved);
    // Recalculate order starting at 1
    const reindexed = stages.map((s, i) => ({ ...s, order: i + 1 }));
    setFunnels(prev => prev.map(f => f.sub_project_funnel_id === active.sub_project_funnel_id ? { ...f, stages: reindexed } : f));
    // Persist order updates sequentially
    try {
      for (const s of reindexed) {
        await SubProjectFunnelsService.updateStage(s.sub_project_funnel_stage_id, { order: s.order });
      }
    } catch {}
  };
  const allowDrop = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="p-4 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-semibold">Воронки підпроектів</div>
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input className="flex-1 glass-input rounded-xl px-3 py-2" placeholder="Нова воронка" value={creatingName} onChange={e=>setCreatingName(e.target.value)} />
              <GlassButton onClick={addFunnel}>Додати</GlassButton>
            </div>
            <div className="max-h-[60vh] overflow-auto glass-scrollbar">
              {loading && <div className="opacity-70">Завантаження…</div>}
              {error && <div className="text-red-400">{error}</div>}
              {!loading && funnels.map(f => (
                <div key={f.sub_project_funnel_id} className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer ${active?.sub_project_funnel_id===f.sub_project_funnel_id?'bg-white/10':''}`} onClick={()=>setActiveId(f.sub_project_funnel_id)}>
                  <input
                    className="bg-transparent outline-none w-full mr-2"
                    value={f.name}
                    onChange={e=>setFunnels(prev=>prev.map(x=>x.sub_project_funnel_id===f.sub_project_funnel_id?{...x,name:e.target.value}:x))}
                    onBlur={e=>renameFunnel(f.sub_project_funnel_id, e.target.value)}
                  />
                  <button className="text-xs opacity-70 hover:opacity-100" onClick={(ev)=>{ev.stopPropagation(); removeFunnel(f.sub_project_funnel_id)}}>Видалити</button>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-semibold">Етапи {active ? `• ${active.name}` : ''}</div>
            <GlassButton onClick={addStage} disabled={!active}>Додати етап</GlassButton>
          </div>
          {!active && <div className="opacity-70">Оберіть воронку</div>}
          {active && (
            <div className="space-y-2">
              {active.stages.map((s) => (
                <div key={s.sub_project_funnel_stage_id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                  draggable onDragStart={e=>onDragStart(e, s)} onDragOver={allowDrop} onDrop={e=>onDrop(e, s)}>
                  <div className="flex items-center gap-2">
                    <span className="cursor-grab select-none opacity-70">≡</span>
                    <input className="bg-transparent outline-none" value={s.name} onChange={(e)=>{
                      const val=e.target.value; setFunnels(prev=>prev.map(f=>f.sub_project_funnel_id===active.sub_project_funnel_id?{...f,stages:f.stages.map(x=>x.sub_project_funnel_stage_id===s.sub_project_funnel_stage_id?{...x,name:val}:x)}:f));
                    }} onBlur={e=>renameStage(s)} />
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="opacity-60">#{s.order}</span>
                    <button className="opacity-70 hover:opacity-100" onClick={()=>renameStage(s)}>Перейменувати</button>
                    <button className="opacity-70 hover:opacity-100" onClick={()=>deleteStage(s)}>Видалити</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
