import { useEffect, useMemo, useState } from 'react';
import GlassModal from './GlassModal';
import GlassButton from './GlassButton';
import { useAuth } from '../context/AuthContext';
import { ManagersService, Manager } from '../services/ManagersService';
import { TasksService } from '../services/TasksService';

type Props = {
  open: boolean;
  onClose: () => void;
  task?: {
    task_id: number;
    title: string;
    description?: string | null;
    status?: 'new' | 'in_progress' | 'blocked' | 'done' | 'cancelled';
    responsible_manager_id?: number | null;
    creator_manager?: { first_name: string; last_name: string } | null;
    responsible_manager?: { first_name: string; last_name: string } | null;
    created_at?: string | Date;
    due_date?: string | Date | null;
  } | null;
};

export default function TaskViewModal({ open, onClose, task }: Props) {
  const t = task;
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    title: t?.title || '',
    description: t?.description || '',
    due_date: t?.due_date ? new Date(t.due_date).toISOString().slice(0, 10) : '',
  });
  const [status, setStatus] = useState(t?.status || 'new');
  const [busy, setBusy] = useState(false);
  const [managers, setManagers] = useState<Manager[]>([]);

  // Re-sync when task changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => {
    setForm({
      title: t?.title || '',
      description: t?.description || '',
      due_date: t?.due_date ? new Date(t.due_date).toISOString().slice(0, 10) : '',
    });
    setStatus(t?.status || 'new');
  }, [t?.task_id]);

  const canEdit = !!(user && t && t.creator_manager && (t as any).creator_manager_id === user.manager_id);
  const canChangeStatus = !!(user && t && (((t as any).responsible_manager_id === user.manager_id) || ((t as any).creator_manager_id === user.manager_id)));
  const statuses: Array<{ value: NonNullable<Props['task']>['status']; label: string }> = [
    { value: 'new', label: 'Нове' },
    { value: 'in_progress', label: 'В роботі' },
    { value: 'blocked', label: 'Заблоковано' },
    { value: 'done', label: 'Завершено' },
    { value: 'cancelled', label: 'Скасовано' },
  ];

  useEffect(() => {
    if (open && canEdit) {
      ManagersService.getAll().then(setManagers).catch(()=>{});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, canEdit]);

  return (
    <GlassModal open={open} onClose={onClose} title={t?.title || 'Завдання'}>
      {!t ? (
        <div className="opacity-70">Немає даних завдання.</div>
      ) : (
        <div className="space-y-3">
          {/* Status row */}
          <div className="flex items-center gap-2">
            <div className="text-sm opacity-80">Статус</div>
            {canChangeStatus ? (
              <select className="glass-input rounded-xl px-3 py-2"
                      value={status as string}
                      onChange={async (e)=>{
                        const val = e.target.value as typeof status;
                        setStatus(val);
                        if (!t) return;
                        try {
                          setBusy(true);
                          await TasksService.updateStatus(t.task_id, val);
                        } finally { setBusy(false); }
                      }}>
                {statuses.map(s => <option key={s.value} value={s.value as string}>{s.label}</option>)}
              </select>
            ) : (
              <div className="text-sm">{statuses.find(s=>s.value===t.status)?.label || '—'}</div>
            )}
          </div>

          {/* Description */}
          {editMode ? (
            <div className="space-y-2">
              <input className="glass-input rounded-xl px-3 py-2 w-full" value={form.title} onChange={e=> setForm(f=>({ ...f, title: e.target.value }))} />
              <textarea className="glass-input rounded-xl px-3 py-2 w-full min-h-[80px]" value={form.description}
                        onChange={e=> setForm(f=>({ ...f, description: e.target.value }))} />
              <div>
                <div className="text-sm opacity-80 mb-1">Дедлайн</div>
                <input type="date" className="glass-input rounded-xl px-3 py-2" value={form.due_date}
                       onChange={e=> setForm(f=>({ ...f, due_date: e.target.value }))} />
              </div>
              {!!managers.length && (
                <div>
                  <div className="text-sm opacity-80 mb-1">Відповідальний</div>
                  <select className="glass-input rounded-xl px-3 py-2" defaultValue={(t as any)?.responsible_manager_id ?? ''}
                          onChange={e=> setForm(f=> ({ ...f, responsible_manager_id: Number(e.target.value) || null }) as any)}>
                    <option value="">—</option>
                    {managers.map(m => (
                      <option key={m.manager_id} value={m.manager_id}>{m.first_name} {m.last_name}</option>
                    ))}
                  </select>
                </div>
              )}
              {canEdit && (
                <div className="flex gap-2">
                  <GlassButton disabled={busy} onClick={async ()=>{
                    if (!t) return;
                    try {
                      setBusy(true);
                      await TasksService.update(t.task_id, {
                        title: form.title.trim() || t.title,
                        description: form.description,
                        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
                        // @ts-ignore allow optional
                        responsible_manager_id: (form as any).responsible_manager_id ?? (t as any).responsible_manager_id,
                      });
                      setEditMode(false);
                    } finally { setBusy(false); }
                  }}>Зберегти</GlassButton>
                  <GlassButton onClick={()=> setEditMode(false)}>Скасувати</GlassButton>
                </div>
              )}
            </div>
          ) : (
            <>
              {t.description && (
                <div>
                  <div className="text-sm opacity-80 mb-1">Опис</div>
                  <div className="text-sm whitespace-pre-wrap">{t.description}</div>
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-sm opacity-80">Постановник</div>
              <div className="text-sm">
                {t.creator_manager ? `${t.creator_manager.first_name} ${t.creator_manager.last_name}` : '—'}
              </div>
            </div>
            <div>
              <div className="text-sm opacity-80">Виконавець</div>
              <div className="text-sm">
                {t.responsible_manager ? `${t.responsible_manager.first_name} ${t.responsible_manager.last_name}` : '—'}
              </div>
            </div>
            <div>
              <div className="text-sm opacity-80">Дата створення</div>
              <div className="text-sm">
                {t.created_at ? new Date(t.created_at).toLocaleString('uk-UA') : '—'}
              </div>
            </div>
            <div>
              <div className="text-sm opacity-80">Дедлайн</div>
              <div className="text-sm">
                {t.due_date ? new Date(t.due_date).toLocaleString('uk-UA') : '—'}
              </div>
            </div>
          </div>

          {canEdit && !editMode && (
            <div className="pt-2">
              <GlassButton onClick={()=> setEditMode(true)}>Редагувати</GlassButton>
            </div>
          )}
        </div>
      )}
    </GlassModal>
  );
}
