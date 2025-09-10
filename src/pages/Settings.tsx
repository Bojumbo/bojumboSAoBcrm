import { useEffect, useState } from 'react';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import FunnelsSettings from './Settings/FunnelsSettings';
import SubProjectFunnelsSettings from './Settings/SubProjectFunnelsSettings';

export default function Settings() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setName(`${user.first_name || ''} ${user.last_name || ''}`.trim());
    }
  }, [user]);

  const [tab, setTab] = useState<'profile'|'funnels'|'subProjectFunnels'>('profile');

  return (
    <div className="space-y-4">
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">Налаштування</div>
          <div className="flex gap-2 text-sm">
            <button className={`px-3 py-1.5 rounded-lg ${tab==='profile'?'bg-white/20':'bg-white/10 hover:bg-white/20'}`} onClick={()=>setTab('profile')}>Профіль</button>
            <button className={`px-3 py-1.5 rounded-lg ${tab==='funnels'?'bg-white/20':'bg-white/10 hover:bg-white/20'}`} onClick={()=>setTab('funnels')}>Воронки проектів</button>
            <button className={`px-3 py-1.5 rounded-lg ${tab==='subProjectFunnels'?'bg-white/20':'bg-white/10 hover:bg-white/20'}`} onClick={()=>setTab('subProjectFunnels')}>Воронки підпроектів</button>
          </div>
        </div>
      </GlassCard>

      {tab === 'profile' && (
      <div className="grid grid-cols-1 gap-4">
        <GlassCard className="p-4">
          <div className="text-lg font-semibold mb-3">Профіль</div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Ім’я</label>
              <input className="w-full rounded-xl px-3 py-2 glass-input" value={name} onChange={e=>setName(e.target.value)} disabled />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input className="w-full rounded-xl px-3 py-2 glass-input" value={email} onChange={e=>setEmail(e.target.value)} disabled />
            </div>
            <div className="text-xs opacity-70">Редагування профілю поки недоступне.</div>
          </div>
        </GlassCard>
      </div>
      )}

      {tab === 'funnels' && <FunnelsSettings />}
      {tab === 'subProjectFunnels' && <SubProjectFunnelsSettings />}
    </div>
  );
}
