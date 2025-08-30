import { useEffect, useMemo, useState } from 'react';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassIconButton from '../components/GlassIconButton';
import { TasksService, Task } from '../services/TasksService';
import { ManagersService, Manager } from '../services/ManagersService';
import { ProjectsService } from '../services/ProjectsService';
import TaskViewModal from '../components/TaskViewModal';

export default function Tasks() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Task[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  // filters
  const [q, setQ] = useState('');
  const [managerId, setManagerId] = useState<number | ''>('');
  const [projectId, setProjectId] = useState<number | ''>('');

  // add form
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [responsibleId, setResponsibleId] = useState<number | ''>('');
  const [projectSel, setProjectSel] = useState<number | ''>('');
  const [due, setDue] = useState('');
  const [busy, setBusy] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      TasksService.getAll(),
      ManagersService.getAll(),
      ProjectsService.getAll()
    ]).then(([ts, ms, pRes]) => {
      setItems(ts || []);
      setManagers(ms || []);
      const arr = (pRes as any)?.data || pRes;
      setProjects(arr || []);
    }).catch((e:any)=> setError(e?.message || 'Помилка завантаження'))
      .finally(()=> setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return items.filter(it => {
      if (q && !it.title.toLowerCase().includes(q.toLowerCase())) return false;
      if (managerId && (it.responsible_manager_id || null) !== Number(managerId)) return false;
      if (projectId && (it.project_id || null) !== Number(projectId)) return false;
      return true;
    });
  }, [items, q, managerId, projectId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xl font-semibold">Завдання</div>
        <GlassButton onClick={()=> setAddOpen(v=>!v)}>{addOpen ? 'Скасувати' : 'Створити завдання'}</GlassButton>
      </div>

      {addOpen && (
        <GlassCard className="p-4">
          <div className="space-y-2">
            <div className="flex gap-2 flex-wrap">
              <input className="glass-input rounded-xl px-3 py-2 min-w-[240px]" placeholder="Заголовок" value={title} onChange={e=> setTitle(e.target.value)} />
              <input type="date" className="glass-input rounded-xl px-3 py-2" value={due} onChange={e=> setDue(e.target.value)} />
              <select className="glass-input rounded-xl px-3 py-2" value={responsibleId} onChange={e=> setResponsibleId(Number(e.target.value) || '')}>
                <option value="">— Відповідальний —</option>
                {managers.map(m => <option key={m.manager_id} value={m.manager_id}>{m.first_name} {m.last_name}</option>)}
              </select>
              <select className="glass-input rounded-xl px-3 py-2" value={projectSel} onChange={e=> setProjectSel(Number(e.target.value) || '')}>
                <option value="">— Проєкт —</option>
                {projects.map((p:any) => <option key={p.project_id} value={p.project_id}>{p.name}</option>)}
              </select>
            </div>
            <textarea className="glass-input rounded-xl px-3 py-2 w-full min-h-[80px]" placeholder="Опис (необов'язково)" value={desc} onChange={e=> setDesc(e.target.value)} />
            <div className="flex gap-2">
              <GlassButton disabled={!title || busy} onClick={async ()=>{
                try {
                  setBusy(true);
                  const payload:any = { title: title.trim() };
                  if (desc.trim()) payload.description = desc.trim();
                  if (responsibleId) payload.responsible_manager_id = Number(responsibleId);
                  if (projectSel) payload.project_id = Number(projectSel);
                  if (due) payload.due_date = new Date(due).toISOString();
                  const created = await TasksService.create(payload);
                  setItems(prev => [created, ...prev]);
                  setAddOpen(false); setTitle(''); setDesc(''); setResponsibleId(''); setProjectSel(''); setDue('');
                } catch (e:any) {
                  setError(e?.response?.data?.error || e?.message || 'Помилка створення');
                } finally { setBusy(false); }
              }}>{busy ? 'Створення…' : 'Створити'}</GlassButton>
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-4">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <input className="glass-input rounded-xl px-3 py-2" placeholder="Пошук…" value={q} onChange={e=> setQ(e.target.value)} />
            <select className="glass-input rounded-xl px-3 py-2" value={managerId} onChange={e=> setManagerId(Number(e.target.value) || '')}>
              <option value="">Відповідальний: будь-хто</option>
              {managers.map(m => <option key={m.manager_id} value={m.manager_id}>{m.first_name} {m.last_name}</option>)}
            </select>
            <select className="glass-input rounded-xl px-3 py-2" value={projectId} onChange={e=> setProjectId(Number(e.target.value) || '')}>
              <option value="">Проєкт: будь-який</option>
              {projects.map((p:any) => <option key={p.project_id} value={p.project_id}>{p.name}</option>)}
            </select>
          </div>

          {loading && <div>Завантаження…</div>}
          {error && <div className="text-red-400">{error}</div>}

          <div className="space-y-2">
            {filtered.map(it => (
        <div key={it.task_id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-start gap-2">
          <button className="flex-1 min-w-0 text-left" onClick={()=>{ setActiveTask(it); setViewOpen(true); }}>
                    <div className="font-medium text-sm truncate">{it.title} {it.status ? `• ${it.status}` : ''}</div>
                    {it.description && <div className="text-xs opacity-80 mt-1 line-clamp-2">{it.description}</div>}
                    <div className="text-xs opacity-70 mt-1">
                      {it.responsible_manager ? `Відповідальний: ${it.responsible_manager.first_name} ${it.responsible_manager.last_name}` : ''}
                      {it.project ? ` • Проєкт: ${it.project.name}` : ''}
                      {it.due_date ? ` • До: ${new Date(it.due_date).toLocaleDateString('uk-UA')}` : ''}
                    </div>
          </button>
                  <GlassIconButton aria-label="Видалити" title="Видалити" onClick={async ()=>{
                    if (!confirm('Видалити завдання?')) return;
                    try { await TasksService.remove(it.task_id); setItems(prev => prev.filter(x=>x.task_id!==it.task_id)); }
                    catch(e:any){ setError(e?.response?.data?.error || e?.message || 'Помилка видалення'); }
                  }}>✕</GlassIconButton>
                </div>
              </div>
            ))}
            {!loading && filtered.length === 0 && (
              <div className="text-sm opacity-70">Нічого не знайдено.</div>
            )}
          </div>
        </div>
      </GlassCard>
  <TaskViewModal open={viewOpen} onClose={()=> setViewOpen(false)} task={activeTask as any} />
    </div>
  );
}
