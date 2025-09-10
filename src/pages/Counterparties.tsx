import { useEffect, useMemo, useState } from 'react';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassIconButton from '../components/GlassIconButton';
import { CounterpartiesService, Counterparty } from '../services/CounterpartiesService';
import { ManagersService, Manager } from '../services/ManagersService';

export default function Counterparties() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Counterparty[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);

  // filters
  const [q, setQ] = useState('');
  const [type, setType] = useState<string>('');
  const [managerId, setManagerId] = useState<number | ''>('');

  // add form state
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'INDIVIDUAL' | 'LEGAL_ENTITY' | ''>('');
  const [newManagerId, setNewManagerId] = useState<number | ''>('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      CounterpartiesService.getAll(),
      ManagersService.getAll()
    ]).then(([cs, ms]) => {
      setItems(cs || []);
      setManagers(ms || []);
    }).catch((e:any) => setError(e?.message || 'Помилка завантаження'))
      .finally(()=> setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return items.filter(it => {
      if (q && !it.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (type && (it.counterparty_type || '') !== type) return false;
      if (managerId && (it.responsible_manager_id || null) !== Number(managerId)) return false;
      return true;
    });
  }, [items, q, type, managerId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xl font-semibold">Контрагенти</div>
        <GlassButton onClick={()=> setAddOpen(v=>!v)}>{addOpen ? 'Скасувати' : 'Додати контрагента'}</GlassButton>
      </div>

      {addOpen && (
        <GlassCard className="p-4">
          <div className="space-y-2">
            <div className="flex gap-2 flex-wrap">
              <input className="glass-input rounded-xl px-3 py-2 min-w-[240px]" placeholder="Назва" value={newName} onChange={e=> setNewName(e.target.value)} />
              <input className="glass-input rounded-xl px-3 py-2 min-w-[240px]" placeholder="Телефон" value={newPhone} onChange={e=> setNewPhone(e.target.value)} />
              <input className="glass-input rounded-xl px-3 py-2 min-w-[240px]" placeholder="Email" value={newEmail} onChange={e=> setNewEmail(e.target.value)} />
              <select className="glass-input rounded-xl px-3 py-2" value={newType} onChange={e=> setNewType(e.target.value as any)}>
                <option value="">— Тип —</option>
                <option value="INDIVIDUAL">Фіз. особа</option>
                <option value="LEGAL_ENTITY">Юр. особа</option>
              </select>
              <select className="glass-input rounded-xl px-3 py-2" value={newManagerId} onChange={e=> setNewManagerId(Number(e.target.value) || '')}>
                <option value="">— Відповідальний менеджер —</option>
                {managers.map(m => (
                  <option key={m.manager_id} value={m.manager_id}>{m.first_name} {m.last_name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <GlassButton disabled={!newName || !newType || busy} onClick={async ()=>{
                try {
                  setBusy(true);
                  const created = await CounterpartiesService.create({ name: newName.trim(), counterparty_type: newType as any, responsible_manager_id: newManagerId || null, phone: newPhone.trim(), email: newEmail.trim() });
                  setItems(prev => [created, ...prev]);
                  setAddOpen(false); setNewName(''); setNewType(''); setNewManagerId(''); setNewPhone(''); setNewEmail('');
                } catch (e:any) {
                  setError(e?.response?.data?.error || e?.message || 'Помилка створення');
                } finally {
                  setBusy(false);
                }
              }}>{busy ? 'Створення…' : 'Створити'}</GlassButton>
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-4">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <input className="glass-input rounded-xl px-3 py-2" placeholder="Пошук за назвою…" value={q} onChange={e=> setQ(e.target.value)} />
            <select className="glass-input rounded-xl px-3 py-2" value={type} onChange={e=> setType(e.target.value)}>
              <option value="">Тип: будь-який</option>
              <option value="INDIVIDUAL">Фіз. особа</option>
              <option value="LEGAL_ENTITY">Юр. особа</option>
            </select>
            <select className="glass-input rounded-xl px-3 py-2" value={managerId} onChange={e=> setManagerId(Number(e.target.value) || '')}>
              <option value="">Менеджер: будь-який</option>
              {managers.map(m => (
                <option key={m.manager_id} value={m.manager_id}>{m.first_name} {m.last_name}</option>
              ))}
            </select>
          </div>

          {loading && <div>Завантаження…</div>}
          {error && <div className="text-red-400">{error}</div>}

          <div className="space-y-2">
            {filtered.map(it => (
              <div key={it.counterparty_id} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{it.name}</div>
                  <div className="text-xs opacity-70 flex items-center gap-2">
                    <span>{(it.counterparty_type === 'INDIVIDUAL' && 'Фіз. особа') || (it.counterparty_type === 'LEGAL_ENTITY' && 'Юр. особа') || (it.counterparty_type || '—')}</span>
                    {it.phone && <a href={`tel:${it.phone}`} className="hover:underline">{it.phone}</a>}
                    {it.email && <a href={`mailto:${it.email}`} className="hover:underline">{it.email}</a>}
                    {it.responsible_manager ? ` • Менеджер: ${it.responsible_manager.first_name} ${it.responsible_manager.last_name}` : ''}
                  </div>
                </div>
                <GlassIconButton aria-label="Видалити" title="Видалити" onClick={async ()=>{
                  if (!confirm('Видалити контрагента? Продажі, пов\'язані з ним, будуть видалені. Продовжити?')) return;
                  try {
                    await CounterpartiesService.remove(it.counterparty_id);
                    setItems(prev => prev.filter(x=> x.counterparty_id !== it.counterparty_id));
                  } catch (e:any) {
                    setError(e?.response?.data?.error || e?.message || 'Помилка видалення');
                  }
                }}>✕</GlassIconButton>
              </div>
            ))}
            {!loading && filtered.length === 0 && (
              <div className="text-sm opacity-70">Нічого не знайдено.</div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
