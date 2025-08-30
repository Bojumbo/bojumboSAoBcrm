import { useEffect, useMemo, useState } from 'react';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassIconButton from '../components/GlassIconButton';
import { ServicesService, Service } from '../services/ServicesService';

export default function Services() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Service[]>([]);

  // filters
  const [q, setQ] = useState('');

  // add form
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    ServicesService.getAll()
      .then(setItems)
      .catch((e:any)=> setError(e?.message || 'Помилка завантаження'))
      .finally(()=> setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return items.filter(it => !q || it.name.toLowerCase().includes(q.toLowerCase()));
  }, [items, q]);

  const fmt = (n:number)=> new Intl.NumberFormat('uk-UA', { style:'currency', currency:'UAH'}).format(n||0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xl font-semibold">Послуги</div>
        <GlassButton onClick={()=> setAddOpen(v=>!v)}>{addOpen ? 'Скасувати' : 'Додати послугу'}</GlassButton>
      </div>

      {addOpen && (
        <GlassCard className="p-4">
          <div className="space-y-2">
            <div className="flex gap-2 flex-wrap items-center">
              <input className="glass-input rounded-xl px-3 py-2 min-w-[240px]" placeholder="Назва" value={name} onChange={e=> setName(e.target.value)} />
              <input type="number" className="glass-input rounded-xl px-3 py-2 w-[160px]" placeholder="Ціна" value={price} onChange={e=> setPrice(e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
            <div className="flex gap-2">
              <GlassButton disabled={!name || price === '' || busy} onClick={async ()=>{
                try {
                  setBusy(true);
                  const created = await ServicesService.create({ name: name.trim(), price: Number(price) });
                  setItems(prev => [created, ...prev]);
                  setAddOpen(false); setName(''); setPrice('');
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
          </div>

          {loading && <div>Завантаження…</div>}
          {error && <div className="text-red-400">{error}</div>}

          <div className="space-y-2">
            {filtered.map(it => (
              <div key={it.service_id} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{it.name}</div>
                </div>
                <div className="text-sm opacity-85">{fmt(it.price)}</div>
                <GlassIconButton aria-label="Видалити" title="Видалити" onClick={async ()=>{
                  if (!confirm('Видалити послугу?')) return;
                  try { await ServicesService.remove(it.service_id); setItems(prev => prev.filter(x=>x.service_id!==it.service_id)); }
                  catch(e:any){ setError(e?.response?.data?.error || e?.message || 'Помилка видалення'); }
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
