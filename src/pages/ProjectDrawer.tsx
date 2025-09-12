import { useEffect, useRef, useState } from 'react';
import GlassDrawer from '../components/GlassDrawer';
import GlassButton from '../components/GlassButton';
import GlassIconButton from '../components/GlassIconButton';
import GlassCard from '../components/GlassCard';
import { ProjectsService } from '../services/ProjectsService';
import { CommentService, ProjectComment } from '../services/CommentService';
import { ManagersService, Manager } from '../services/ManagersService';
import { CounterpartiesService, Counterparty } from '../services/CounterpartiesService';
import api from '../api/httpClient';
import SubProjectDrawer from './SubProjectDrawer';
import { SubProjectsService } from '../services/SubProjectsService';
import { SalesService } from '../services/SalesService';
import { SaleStatusTypesService, SaleStatusType } from '../services/SaleStatusTypesService';
import { ProductsService, Product } from '../services/ProductsService';
import { ServicesService, Service } from '../services/ServicesService';
import GlassModal from '../components/GlassModal';
import { FunnelsService, Funnel } from '../services/FunnelsService';
import TaskViewModal from '../components/TaskViewModal';
import { useAuth } from '../context/AuthContext';

type Props = {
  projectId: number | null;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

export default function ProjectDrawer({ projectId, open, onClose, onSaved }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [activeTab, setActiveTab] = useState<'comments' | 'subprojects' | 'sales' | 'products' | 'tasks'>('comments');
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ fileName: string; fileUrl: string; fileType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [subDrawerOpen, setSubDrawerOpen] = useState(false);
  const [activeSubId, setActiveSubId] = useState<number | null>(null);
  const [creatingSub, setCreatingSub] = useState(false);
  const [createSubName, setCreateSubName] = useState('');
  const [createSubCost, setCreateSubCost] = useState<number | ''>('');
  const [createSubDesc, setCreateSubDesc] = useState('');
  const [createBusy, setCreateBusy] = useState(false);
  const [creatingSale, setCreatingSale] = useState(false);
  const [saleTitle, setSaleTitle] = useState('');
  const [saleDate, setSaleDate] = useState<string>(() => {
    // Initialize with current date and time in local timezone
    const now = new Date();
    // Format as datetime-local input format: YYYY-MM-DDTHH:MM
    return now.getFullYear() + '-' + 
           String(now.getMonth() + 1).padStart(2, '0') + '-' + 
           String(now.getDate()).padStart(2, '0') + 'T' + 
           String(now.getHours()).padStart(2, '0') + ':' + 
           String(now.getMinutes()).padStart(2, '0');
  });
  const [saleStatusId, setSaleStatusId] = useState<number | ''>('');
  const [statusTypes, setStatusTypes] = useState<SaleStatusType[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [saleProducts, setSaleProducts] = useState<{ product_id: number; quantity: number }[]>([]);
  const [saleServices, setSaleServices] = useState<{ service_id: number; quantity?: number }[]>([]);
  const [saleItemsTab, setSaleItemsTab] = useState<'products' | 'services'>('products');
  const [saleError, setSaleError] = useState<string | null>(null);
  const [saleCounterpartyId, setSaleCounterpartyId] = useState<number | ''>('');
  const [taskViewOpen, setTaskViewOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<any>(null);

  // Helpers for currency formatting and totals
  const fmtMoney = (n: number) => new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(n || 0);
  const productsTotal = saleProducts.reduce((sum, item) => {
    const unit = allProducts.find(p => p.product_id === item.product_id)?.price || 0;
    return sum + unit * (item.quantity || 0);
  }, 0);
  const servicesTotal = saleServices.reduce((sum, s) => {
    const price = allServices.find(x => x.service_id === s.service_id)?.price || 0;
    const qty = Math.max(1, Number(s.quantity) || 1);
    return sum + price * qty;
  }, 0);
  const grandTotal = productsTotal + servicesTotal;

  // Project products and services totals
  const projectProductsTotal = (data?.products || []).reduce((sum: number, pp: any) => 
    sum + (pp.product?.price || 0) * (pp.quantity || 0), 0);
  const projectServicesTotal = (data?.services || []).reduce((sum: number, ps: any) => 
    sum + (ps.service?.price || 0) * (Math.max(0.1, Number(ps.quantity) || 1)), 0);
  const projectGrandTotal = projectProductsTotal + projectServicesTotal;

  // Resolve absolute URL for uploaded files served from backend (/uploads/*)
  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api';
  const filesBase = String(apiBase).replace(/\/?api\/?$/, '');
  const fileUrlAbs = (rel: string) => rel?.startsWith('http') ? rel : `${filesBase}${rel}`;

  const downloadByUrl = async (url: string, filename?: string) => {
    try {
      const res = await api.get(url, { responseType: 'blob' });
      const blob: Blob = res.data as any;
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = filename || url.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objUrl);
    } catch (err) {
      // optional: show toast or log
    }
  };
  // Sidebar per-field edit toggles
  const [editCounterparty, setEditCounterparty] = useState(false);
  const [editMainManager, setEditMainManager] = useState(false);
  const [editSecondaryManagers, setEditSecondaryManagers] = useState(false);
  const [editForecast, setEditForecast] = useState(false);
  const [editDescription, setEditDescription] = useState(false);

  useEffect(() => {
    if (!open || !projectId) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
  const p = await ProjectsService.getById(projectId);
  setData(p);
    // Load comments
    const list = await CommentService.getProjectComments(projectId);
    setComments(list);
  setActiveTab('comments');
        // Load meta lists in parallel
  const [mgrs, cps, prods, servs, funs] = await Promise.all([
          ManagersService.getAll(),
          CounterpartiesService.getAll(),
          ProductsService.getAll(),
    ServicesService.getAll(),
    FunnelsService.getAll()
        ]);
  setManagers(mgrs);
  setCounterparties(cps);
  setAllProducts(prods);
  setAllServices(servs);
  setFunnels(funs);
  // reset edit toggles on load
  setEditCounterparty(false);
  setEditMainManager(false);
  setEditSecondaryManagers(false);
  setEditForecast(false);
  setEditDescription(false);
      } catch (e: any) {
        setError(e?.message || 'Помилка завантаження');
      } finally {
        setLoading(false);
      }
    })();
  }, [open, projectId]);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    setError(null);
    try {
      const secondaryIds = (Array.isArray(data.secondary_responsible_manager_ids) && data.secondary_responsible_manager_ids.length)
        ? data.secondary_responsible_manager_ids
        : (data.secondary_responsible_managers?.map((x:any)=> (x?.manager?.manager_id ?? x?.manager_id)) || []);
      await ProjectsService.update(data.project_id, {
        name: data.name,
        description: data.description,
        main_responsible_manager_id: data.main_responsible_manager_id,
        counterparty_id: data.counterparty_id,
        funnel_id: data.funnel_id,
        funnel_stage_id: data.funnel_stage_id,
        forecast_amount: data.forecast_amount,
        secondary_responsible_manager_ids: secondaryIds,
      });
      onSaved?.();
    } catch (e: any) {
      setError(e?.message || 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  const sendComment = async () => {
    if (!projectId) return;
    const text = commentText.trim();
    if ((!text && !uploadedFile) || sending) return;
    setSending(true);
    try {
      const created = await CommentService.createProjectComment(projectId, text, uploadedFile ? { name: uploadedFile.fileName, url: uploadedFile.fileUrl, type: uploadedFile.fileType } : undefined);
      setComments(prev => [...prev, created]);
      setCommentText('');
      setSelectedFile(null);
      setUploadedFile(null);
    } catch (e: any) {
      // optionally show toast
    } finally {
      setSending(false);
    }
  };

  const deleteComment = async (commentId: number) => {
    if (!user || !projectId) return;
    if (!confirm('Ви впевнені, що хочете видалити цей коментар? Цю дію не можна скасувати.')) {
      return;
    }
    try {
      await CommentService.deleteProjectComment(projectId, commentId);
      // Mark comment as deleted locally instead of removing it
      setComments(prev => prev.map(c => 
        c.comment_id === commentId 
          ? { ...c, is_deleted: true, content: '', file_url: null, file_name: null, file_type: null }
          : c
      ));
    } catch (e: any) {
      // optionally show toast error
      alert('Помилка видалення коментаря');
    }
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    try {
      const { UploadService } = await import('../services/UploadService');
      const info = await UploadService.upload(file);
      setUploadedFile(info);
    } catch (err) {
      // handle upload error optionally
      setSelectedFile(null);
      setUploadedFile(null);
    } finally {
      e.currentTarget.value = '';
    }
  };

  return (
    <>
    <GlassDrawer
      open={open}
      onClose={onClose}
      width="70vw"
      title={data?.name || 'Проєкт'}
      actions={
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-2 xl:gap-4 w-full xl:w-auto">
          {!!data && (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label className="text-sm whitespace-nowrap">Воронка:</label>
                <select
                  className="glass-input rounded-md px-2 py-1 min-w-[160px] max-w-[300px] w-full sm:w-auto"
                  value={data.funnel_id ?? ''}
                  onChange={e => {
                    const fid = Number(e.target.value) || null;
                    let stageId = data.funnel_stage_id ?? null;
                    const selected = funnels.find(f => f.funnel_id === fid!);
                    if (fid && selected) {
                      const firstStage = selected.stages?.[0]?.funnel_stage_id ?? null;
                      const contains = !!selected.stages?.some(s => s.funnel_stage_id === stageId);
                      stageId = contains ? stageId : firstStage;
                    } else {
                      stageId = null;
                    }
                    setData({ ...data, funnel_id: fid, funnel_stage_id: stageId });
                  }}
                >
                  <option value="">—</option>
                  {funnels.map(f => (
                    <option key={f.funnel_id} value={f.funnel_id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label className="text-sm whitespace-nowrap">Етап:</label>
                <select
                  className="glass-input rounded-md px-2 py-1 min-w-[160px] max-w-[300px] w-full sm:w-auto"
                  value={data.funnel_stage_id ?? ''}
                  onChange={e => setData({ ...data, funnel_stage_id: Number(e.target.value) || null })}
                  disabled={!data.funnel_id}
                >
                  <option value="">—</option>
                  {funnels.find(f => f.funnel_id === data.funnel_id)?.stages?.map(s => (
                    <option key={s.funnel_stage_id} value={s.funnel_stage_id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <GlassButton onClick={save} disabled={saving || !data}>{saving ? 'Збереження…' : 'Зберегти'}</GlassButton>
        </div>
      }
    >
      {loading && <div>Завантаження...</div>}
      {error && <div className="text-red-400 mb-3">{error}</div>}
      {!!data && (
        <div className="space-y-4">
          <div className="lg:flex gap-4">
            {/* Left sidebar with project meta as a single element */}
            <div className="lg:w-[300px] lg:flex-shrink-0">
              <GlassCard className="p-4 rounded-xl">
                <div className="space-y-6">
                {/* Counterparty */}
                <div className="space-y-2 bg-white/5 border border-white/10 rounded-lg p-3 transition-colors hover:bg-white/10">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Контрагент</div>
                    <GlassIconButton aria-label="Редагувати контрагента" onClick={() => setEditCounterparty(v => !v)}>
                      {editCounterparty ? '✓' : '✎'}
                    </GlassIconButton>
                  </div>
                  {editCounterparty ? (
                    <select
                      className="w-full glass-input rounded-xl px-3 py-2"
                      value={data.counterparty_id ?? ''}
                      onChange={e => setData({ ...data, counterparty_id: Number(e.target.value) || null })}
                    >
                      <option value="">—</option>
                      {counterparties.map(c => (
                        <option key={c.counterparty_id} value={c.counterparty_id}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm opacity-85">
                      <div>{data.counterparty?.name || '—'}</div>
                      {data.counterparty?.phone && <a href={`tel:${data.counterparty.phone}`} className="text-xs hover:underline">{data.counterparty.phone}</a>}
                      {data.counterparty?.email && <a href={`mailto:${data.counterparty.email}`} className="text-xs hover:underline ml-2">{data.counterparty.email}</a>}
                    </div>
                  )}
                </div>

                {/* Main manager */}
                <div className="space-y-2 bg-white/5 border border-white/10 rounded-lg p-3 transition-colors hover:bg-white/10">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Головний менеджер</div>
                    <GlassIconButton aria-label="Редагувати головного менеджера" onClick={() => setEditMainManager(v => !v)}>
                      {editMainManager ? '✓' : '✎'}
                    </GlassIconButton>
                  </div>
                  {editMainManager ? (
                    <select
                      className="w-full glass-input rounded-xl px-3 py-2"
                      value={data.main_responsible_manager_id ?? ''}
                      onChange={e => setData({ ...data, main_responsible_manager_id: Number(e.target.value) || null })}
                    >
                      <option value="">—</option>
                      {managers.map(m => (
                        <option key={m.manager_id} value={m.manager_id}>{`${m.first_name} ${m.last_name}`}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm opacity-85">{data.main_responsible_manager ? `${data.main_responsible_manager.first_name} ${data.main_responsible_manager.last_name}` : '—'}</div>
                  )}
                </div>

                {/* Forecast */}
                <div className="space-y-2 bg-white/5 border border-white/10 rounded-lg p-3 transition-colors hover:bg-white/10">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Прогноз (UAH)</div>
                    <GlassIconButton aria-label="Редагувати прогноз" onClick={()=>setEditForecast(v=>!v)}>
                      {editForecast ? '✓' : '✎'}
                    </GlassIconButton>
                  </div>
                  {editForecast ? (
                    <input
                      type="number"
                      className="w-full glass-input rounded-xl px-3 py-2"
                      value={data.forecast_amount ?? 0}
                      onChange={e => setData({ ...data, forecast_amount: Number(e.target.value) })}
                    />
                  ) : (
                    <div className="text-sm opacity-85">{new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(data.forecast_amount || 0)}</div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2 bg-white/5 border border-white/10 rounded-lg p-3 transition-colors hover:bg-white/10">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Опис</div>
                    <GlassIconButton aria-label="Редагувати опис" onClick={()=>setEditDescription(v=>!v)}>
                      {editDescription ? '✓' : '✎'}
                    </GlassIconButton>
                  </div>
                  {editDescription ? (
                    <textarea
                      className="w-full glass-input rounded-xl px-3 py-2 min-h-[120px]"
                      value={data.description || ''}
                      onChange={e => setData({ ...data, description: e.target.value })}
                    />
                  ) : (
                    <div className="text-sm opacity-85 whitespace-pre-wrap">{data.description?.trim() ? data.description : '—'}</div>
                  )}
                </div>

                {/* Project totals */}
                <div className="space-y-2 bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="text-sm font-semibold">Суми по проекту</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="opacity-85">Товари ({data?.products?.length || 0}):</span>
                      <span className={`font-medium ${projectProductsTotal > 0 ? 'text-green-400' : 'opacity-60'}`}>
                        {fmtMoney(projectProductsTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="opacity-85">Послуги ({data?.services?.length || 0}):</span>
                      <span className={`font-medium ${projectServicesTotal > 0 ? 'text-green-400' : 'opacity-60'}`}>
                        {fmtMoney(projectServicesTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-white/10 pt-1 mt-2">
                      <span className="font-semibold">Загалом:</span>
                      <span className={`font-bold ${projectGrandTotal > 0 ? 'text-green-300' : 'opacity-60'}`}>
                        {fmtMoney(projectGrandTotal)}
                      </span>
                    </div>
                    {data.forecast_amount && data.forecast_amount > 0 && (
                      <div className="flex justify-between text-xs opacity-75 pt-1">
                        <span>Прогноз:</span>
                        <span>{fmtMoney(data.forecast_amount)}</span>
                      </div>
                    )}
                    {data.forecast_amount && data.forecast_amount > 0 && projectGrandTotal > 0 && (
                      <div className="flex justify-between text-xs pt-1">
                        <span>Виконання:</span>
                        <span className={`font-medium ${
                          projectGrandTotal >= data.forecast_amount ? 'text-green-400' : 
                          projectGrandTotal >= data.forecast_amount * 0.8 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {((projectGrandTotal / data.forecast_amount) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </GlassCard>
            </div>

            {/* Right content with tabs */}
            <div className="flex-1 min-w-0 flex flex-col space-y-4">
              {/* Tabs */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'comments', label: `Коментарі${comments.length ? ` (${comments.length})` : ''}` },
                  { key: 'subprojects', label: `Підпроекти${data?.subprojects?.length ? ` (${data.subprojects.length})` : ''}` },
                  { key: 'sales', label: `Продажі${data?.sales?.length ? ` (${data.sales.length})` : ''}` },
                  { key: 'products', label: `Товари${data?.products?.length ? ` (${data.products.length})` : ''}` },
                  { key: 'tasks', label: `Завдання${data?.tasks?.length ? ` (${data.tasks.length})` : ''}` },
                ].map(t => (
                  <button
                    key={t.key}
                    className={`glass glass-interactive px-3 py-1.5 rounded-xl text-sm border ${activeTab===t.key ? 'bg-white/15 border-white/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    onClick={()=> setActiveTab(t.key as any)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab panels */}
              {activeTab === 'comments' && (
                <div className="flex flex-col space-y-3 flex-grow">
                  <div className="glass glass-scroll-y p-3 rounded-xl flex-grow glass-scrollbar">
                    {comments.length === 0 && <div className="text-sm opacity-70">Коментарів поки немає.</div>}
                    <div className="space-y-3">
                      {comments.map(c => (
                        <div key={c.comment_id} className={`bg-white/5 rounded-lg p-2 border border-white/10 ${c.is_deleted ? 'opacity-60' : ''}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-xs opacity-70">
                              {(c.manager?.first_name||'') + ' ' + (c.manager?.last_name||'')} • {new Date(c.created_at).toLocaleString('uk-UA')}
                            </div>
                            {/* Show delete button only for own comments and if not already deleted */}
                            {!c.is_deleted && user && Number(user.manager_id) === Number(c.manager?.manager_id) && (
                              <GlassIconButton
                                aria-label="Видалити коментар"
                                title="Видалити коментар"
                                onClick={() => deleteComment(c.comment_id)}
                                size="sm"
                                className="opacity-60 hover:opacity-100 text-red-400 hover:text-red-300"
                              >
                                🗑️
                              </GlassIconButton>
                            )}
                          </div>
                          {c.is_deleted ? (
                            <div className="text-sm italic opacity-60 bg-white/3 rounded-md px-2 py-1 border border-white/5">
                              <span className="text-xs">💬</span> Повідомлення було видалено
                            </div>
                          ) : (
                            <>
                              {c.content && <div className="text-sm whitespace-pre-wrap mb-2">{c.content}</div>}
                              {c.file_url && (
                                <div className="flex items-center gap-2 bg-black/20 rounded-md p-2 border border-white/10">
                                  {c.file_type?.startsWith('image/') ? (
                                    <button
                                      type="button"
                                      onClick={()=> downloadByUrl(fileUrlAbs(c.file_url!), c.file_name || undefined)}
                                      className="flex items-center gap-2 text-left"
                                    >
                                      <img src={fileUrlAbs(c.file_url)} alt={c.file_name || 'attachment'} className="w-16 h-16 object-cover rounded" />
                                      <span className="text-xs underline truncate max-w-[200px]">{c.file_name || 'Зображення'}</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={()=> downloadByUrl(fileUrlAbs(c.file_url!), c.file_name || undefined)}
                                      className="text-xs underline truncate text-left"
                                    >
                                      {c.file_name || 'Файл'}
                                    </button>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-start gap-2">
                    <textarea
                      className="flex-1 rounded-xl px-3 py-2 glass-input min-h-[44px]"
                      placeholder="Напишіть коментар..."
                      value={commentText}
                      onChange={e=>setCommentText(e.target.value)}
                      onKeyDown={(e)=>{
                        if ((e as any).nativeEvent?.isComposing) return; // avoid IME premature send
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (!sending) sendComment();
                        }
                      }}
                    />
                    <input ref={fileInputRef} type="file" className="hidden" onChange={onPickFile} />
                    <GlassIconButton
                      aria-label="Додати файл"
                      title="Додати файл"
                      size="md"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <path d="M21.44 11.05 12.7 19.8a5.5 5.5 0 1 1-7.78-7.78l8.49-8.49a3.75 3.75 0 1 1 5.3 5.3l-8.49 8.49a2 2 0 0 1-2.83-2.83l7.78-7.78" />
                      </svg>
                    </GlassIconButton>
                    <GlassButton onClick={sendComment} disabled={sending || (!commentText.trim() && !uploadedFile)}>{sending ? 'Надсилання…' : 'Надіслати'}</GlassButton>
                    {uploadedFile && (
                      <div className="w-full flex items-center gap-2 text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                        <span className="truncate">Файл: {uploadedFile.fileName}</span>
                        <button className="ml-auto opacity-80 hover:opacity-100" onClick={()=>{ setSelectedFile(null); setUploadedFile(null); }}>Прибрати</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'subprojects' && (
                <div className="glass p-3 rounded-xl">
                  {(!data?.subprojects || data.subprojects.length===0) && (
                    <div className="text-sm opacity-70">Підпроекти відсутні.</div>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <GlassButton onClick={()=> setCreatingSub(v=>!v)}>{creatingSub ? 'Скасувати' : 'Створити підпроєкт'}</GlassButton>
                  </div>
                  {creatingSub && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-3 space-y-2">
                      <div className="flex gap-2 flex-wrap">
                        <input className="glass-input rounded-xl px-3 py-2 flex-1 min-w-[200px]" placeholder="Назва" value={createSubName} onChange={e=>setCreateSubName(e.target.value)} />
                        <input type="number" className="glass-input rounded-xl px-3 py-2 w-[180px]" placeholder="Вартість (UAH)" value={createSubCost} onChange={e=> setCreateSubCost(e.target.value === '' ? '' : Number(e.target.value))} />
                      </div>
                      <textarea className="glass-input rounded-xl px-3 py-2 w-full min-h-[80px]" placeholder="Опис (необов'язково)" value={createSubDesc} onChange={e=>setCreateSubDesc(e.target.value)} />
                      <div className="flex gap-2">
                        <GlassButton
                          disabled={createBusy || !createSubName || createSubCost === ''}
                          onClick={async ()=>{
                            if (!data?.project_id) return;
                            setCreateBusy(true);
                            try {
                              await SubProjectsService.create({ project_id: data.project_id, name: createSubName.trim(), description: createSubDesc.trim() || null, cost: Number(createSubCost) || 0 });
                              // refresh project data to get new subprojects list
                              const p = await ProjectsService.getById(data.project_id);
                              setData(p);
                              // reset form
                              setCreatingSub(false);
                              setCreateSubName(''); setCreateSubCost(''); setCreateSubDesc('');
                            } catch (e) {
                              // optionally show toast
                            } finally {
                              setCreateBusy(false);
                            }
                          }}
                        >{createBusy ? 'Створення…' : 'Створити'}</GlassButton>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    {(data?.subprojects || []).map((sp:any) => (
                      <div key={sp.subproject_id} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors">
                        <div className="flex items-start gap-2">
                          <button className="flex-1 text-left" onClick={()=>{ setActiveSubId(sp.subproject_id); setSubDrawerOpen(true); }}>
                            <div className="font-medium text-sm">{sp.name || `Підпроект #${sp.subproject_id}`}</div>
                            {sp.description && <div className="text-xs opacity-80 mt-1 line-clamp-2">{sp.description}</div>}
                          </button>
                          <GlassIconButton aria-label="Видалити підпроєкт" title="Видалити підпроєкт" onClick={async ()=>{
                            if (!confirm('Видалити підпроєкт? Це дію неможливо скасувати.')) return;
                            try {
                              await SubProjectsService.delete(sp.subproject_id);
                              if (data?.project_id) {
                                const p = await ProjectsService.getById(data.project_id);
                                setData(p);
                              }
                            } catch (e) {
                              // optionally show toast
                            }
                          }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-red-300">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </GlassIconButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'sales' && (
                <div className="glass p-3 rounded-xl">
                  {(!data?.sales || data.sales.length===0) && (
                    <div className="text-sm opacity-70">Продажі відсутні.</div>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <GlassButton onClick={async ()=>{
                      // Reset form and set current date/time
                      const now = new Date();
                      const currentDateTime = now.getFullYear() + '-' + 
                                            String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                                            String(now.getDate()).padStart(2, '0') + 'T' + 
                                            String(now.getHours()).padStart(2, '0') + ':' + 
                                            String(now.getMinutes()).padStart(2, '0');
                      
                      setCreatingSale(true);
                      // defaults
                      setSaleTitle('');
                      setSaleDate(currentDateTime);
                      setSaleError(null);
                      setSaleCounterpartyId(data?.counterparty_id ?? '');
                      setSaleProducts([]);
                      setSaleServices([]);
                      try {
                        const [sts, prods, servs] = await Promise.all([
                          SaleStatusTypesService.getAll(),
                          ProductsService.getAll(),
                          ServicesService.getAll()
                        ]);
                        setStatusTypes(sts);
                        setAllProducts(prods);
                        setAllServices(servs);
                        setSaleStatusId(sts[0]?.sale_status_id ?? '');
                        setSaleProducts([]);
                        setSaleServices([]);
                        setSaleItemsTab('products');
                      } catch {}
                    }}>Додати продаж</GlassButton>
                  </div>
                  <div className="space-y-2">
                    {(data?.sales || []).map((s:any) => (
                      <div key={s.sale_id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-sm">{s.title || s.name || `Продаж #${s.sale_id}`}</div>
                            <div className="text-xs opacity-75 mt-1">
                              {s.counterparty?.name ? `Контрагент: ${s.counterparty.name}` : ''}
                            </div>
                          </div>
                          <GlassIconButton 
                            aria-label="Видалити продаж" 
                            title="Видалити продаж" 
                            onClick={async () => {
                              if (confirm('Ви впевнені, що хочете видалити цей продаж?')) {
                                try {
                                  await SalesService.delete(s.sale_id);
                                  // Оновлюємо дані проекту
                                  if (data?.project_id) {
                                    const updatedProject = await ProjectsService.getById(data.project_id);
                                    setData(updatedProject);
                                  }
                                } catch (error) {
                                  console.error('Помилка видалення продажу:', error);
                                  alert('Помилка при видаленні продажу');
                                }
                              }
                            }}
                          >
                            ✕
                          </GlassIconButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="glass p-3 rounded-xl space-y-3">
                  {/* Add product to project */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-sm font-semibold mb-2">Додати товар до проєкту</div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <select id="add-project-product" className="glass-input rounded-xl px-3 py-2 min-w-[240px]">
                        <option value="">— Оберіть товар —</option>
                        {allProducts.map(p => (
                          <option key={p.product_id} value={p.product_id}>{p.name}</option>
                        ))}
                      </select>
                      <input id="add-project-product-qty" type="number" min={1} step={1} defaultValue={1} className="glass-input rounded-xl px-3 py-2 w-[120px]" />
                      <GlassButton onClick={async ()=>{
                        if (!data?.project_id) return;
                        const sel = document.getElementById('add-project-product') as HTMLSelectElement;
                        const qtyEl = document.getElementById('add-project-product-qty') as HTMLInputElement;
                        const pid = Number(sel?.value||'');
                        const qty = Math.max(1, Math.round(Number(qtyEl?.value||1)));
                        if (!pid) return;
                        try {
                          await api.post(`/projects/${data.project_id}/products`, { product_id: pid, quantity: qty });
                          const p = await ProjectsService.getById(data.project_id);
                          setData(p);
                          if (sel) sel.selectedIndex = 0; if (qtyEl) qtyEl.value = '1';
                        } catch {}
                      }}>Додати</GlassButton>
                    </div>
                  </div>

                  {/* Add service to project */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-sm font-semibold mb-2">Додати послугу до проєкту</div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <select id="add-project-service" className="glass-input rounded-xl px-3 py-2 min-w-[240px]">
                        <option value="">— Оберіть послугу —</option>
                        {allServices.map(s => (
                          <option key={s.service_id} value={s.service_id}>{s.name}</option>
                        ))}
                      </select>
                      <input id="add-project-service-qty" type="number" min={0.1} step={0.1} defaultValue={1} className="glass-input rounded-xl px-3 py-2 w-[120px]" />
                      <GlassButton onClick={async ()=>{
                        if (!data?.project_id) return;
                        const sel = document.getElementById('add-project-service') as HTMLSelectElement;
                        const qtyEl = document.getElementById('add-project-service-qty') as HTMLInputElement;
                        const sid = Number(sel?.value||'');
                        const qty = Math.max(0.1, Number(qtyEl?.value||1));
                        if (!sid) return;
                        try {
                          await api.post(`/projects/${data.project_id}/services`, { service_id: sid, quantity: qty });
                          const p = await ProjectsService.getById(data.project_id);
                          setData(p);
                          if (sel) sel.selectedIndex = 0; if (qtyEl) qtyEl.value = '1';
                        } catch {}
                      }}>Додати</GlassButton>
                    </div>
                  </div>

                  {/* Existing lists */}
                  {(!data?.products || data.products.length===0) && (
                    <div className="text-sm opacity-70">Товари відсутні.</div>
                  )}
                  <div className="space-y-2">
                    {data?.products?.length ? (
                      <div className="text-sm opacity-85 flex justify-end gap-6 pr-1">
                        <span className="w-[120px] text-right">Ціна</span>
                        <span className="w-[140px] text-right">Сума</span>
                      </div>
                    ) : null}
                    {(data?.products || []).map((pp:any, idx:number) => (
                      <div key={pp.project_product_id || idx} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{pp.product?.name || pp.product?.product?.name || 'Товар'}</div>
                          <div className="text-xs opacity-75">Кількість: {pp.quantity}{pp.product?.unit?.name ? ` ${pp.product.unit.name}` : ''}</div>
                        </div>
                        <div className="w-[120px] text-right text-sm opacity-85">{new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(pp.product?.price || 0)}</div>
                        <div className="w-[140px] text-right text-sm font-medium">{new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format((pp.product?.price || 0) * (pp.quantity || 0))}</div>
                        <GlassIconButton aria-label="Прибрати товар" title="Прибрати товар" onClick={async ()=>{
                          try {
                            await api.delete(`/projects/${data.project_id}/products/${pp.project_product_id}`);
                            const p = await ProjectsService.getById(data.project_id);
                            setData(p);
                          } catch {}
                        }}>✕</GlassIconButton>
                      </div>
                    ))}
                    {/* Totals for products */}
                    {data?.products?.length ? (
                      <div className="flex justify-end border-t border-white/10 pt-2">
                        <div className="w-[140px] text-right text-sm font-semibold">
                          {new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format((data?.products || []).reduce((sum:number, pp:any)=> sum + (pp.product?.price || 0) * (pp.quantity || 0), 0))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4">
                    {(!data?.services || data.services.length===0) && (
                      <div className="text-sm opacity-70">Послуги відсутні.</div>
                    )}
                    <div className="space-y-2">
                      {data?.services?.length ? (
                        <div className="text-sm opacity-85 flex justify-end gap-6 pr-1">
                          <span className="w-[120px] text-right">Ціна</span>
                          <span className="w-[140px] text-right">Сума</span>
                        </div>
                      ) : null}
                      {(data?.services || []).map((ps:any, idx:number) => (
                        <div key={ps.service?.service_id || ps.service_id || idx} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{ps.service?.name || 'Послуга'}</div>
                          <div className="text-xs opacity-80 mt-1">Кількість: {Math.max(0.1, Number(ps.quantity)||1)}</div>
                        </div>
                        <div className="w-[120px] text-right text-sm opacity-85">{new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(ps.service?.price || 0)}</div>
                        <div className="w-[140px] text-right text-sm font-medium">{new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format((ps.service?.price || 0) * (Math.max(0.1, Number(ps.quantity)||1)))}</div>
                          <GlassIconButton aria-label="Прибрати послугу" title="Прибрати послугу" onClick={async ()=>{
                            try {
                              const sid = ps.service?.service_id || ps.service_id;
                              await api.delete(`/projects/${data.project_id}/services/by-service/${sid}`);
                              const p = await ProjectsService.getById(data.project_id);
                              setData(p);
                            } catch {}
                          }}>✕</GlassIconButton>
                        </div>
                      ))}
                      {/* Totals for services */}
                      {data?.services?.length ? (
                        <div className="flex justify-end border-t border-white/10 pt-2">
                          <div className="w-[140px] text-right text-sm font-semibold">
                            {new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format((data?.services || []).reduce((sum:number, ps:any)=> sum + (ps.service?.price || 0) * (Math.max(0.1, Number(ps.quantity)||1)), 0))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                    {/* Grand total: products + services */}
                    <div className="flex justify-end border-t border-white/10 pt-3 mt-2 items-baseline gap-3">
                      <div className="text-sm opacity-85">Разом (товари + послуги)</div>
                      <div className="w-[140px] text-right text-base font-bold">
                        {new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(
                          ((data?.products || []).reduce((sum:number, pp:any)=> sum + (pp.product?.price || 0) * (pp.quantity || 0), 0)) +
                          ((data?.services || []).reduce((sum:number, ps:any)=> sum + (ps.service?.price || 0) * (Math.max(0.1, Number(ps.quantity)||1)), 0))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="glass p-3 rounded-xl space-y-2">
                  {(!data?.tasks || data.tasks.length===0) && (
                    <div className="text-sm opacity-70">Завдання відсутні.</div>
                  )}
                  <div className="space-y-2">
                    {(data?.tasks || []).map((t:any) => (
                      <div key={t.task_id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <button className="flex-1 min-w-0 text-left" onClick={()=>{ setActiveTask(t); setTaskViewOpen(true); }}>
                            <div className="font-medium text-sm truncate">{t.title || `Завдання #${t.task_id}`} {t.status ? `• ${t.status}` : ''}</div>
                            {t.description && <div className="text-xs opacity-80 mt-1 line-clamp-2">{t.description}</div>}
                            <div className="text-xs opacity-70 mt-1">
                              {t.responsible_manager ? `Відповідальний: ${t.responsible_manager.first_name} ${t.responsible_manager.last_name}` : ''}
                              {t.due_date ? ` • До: ${new Date(t.due_date).toLocaleDateString('uk-UA')}` : ''}
                            </div>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom actions removed; Save moved to top */}
        </div>
      )}
    </GlassDrawer>
    {/* Create Sale Modal */}
    <GlassModal open={creatingSale} onClose={()=> setCreatingSale(false)} title="Створити продаж">
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <input className="glass-input rounded-xl px-3 py-2 flex-1 min-w-[240px]" placeholder="Назва/Титул" value={saleTitle} onChange={e=>setSaleTitle(e.target.value)} />
          <input type="datetime-local" className="glass-input rounded-xl px-3 py-2 w-[200px]" value={saleDate} onChange={e=> setSaleDate(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <label className="text-sm opacity-80">Статус</label>
          <select className="glass-input rounded-xl px-3 py-2" value={saleStatusId} onChange={e=> setSaleStatusId(Number(e.target.value))}>
            {statusTypes.map(s=> (
              <option key={s.sale_status_id} value={s.sale_status_id}>{s.name}</option>
            ))}
          </select>
          <label className="text-sm opacity-80 ml-2">Контрагент</label>
          <select className="glass-input rounded-xl px-3 py-2" value={saleCounterpartyId}
                  onChange={e=> setSaleCounterpartyId(Number(e.target.value))}>
            <option value="">— Оберіть контрагента —</option>
            {counterparties.map(c => (
              <option key={c.counterparty_id} value={c.counterparty_id}>{c.name}</option>
            ))}
          </select>
        </div>
        {/* Items tabs */}
        <div className="space-y-2">
          <div className="flex gap-2">
            {(['products','services'] as const).map(k => (
              <button key={k} className={`glass glass-interactive px-3 py-1.5 rounded-xl text-sm border ${saleItemsTab===k ? 'bg-white/15 border-white/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`} onClick={()=> setSaleItemsTab(k)}>
                {k === 'products' ? 'Товари' : 'Послуги'}
              </button>
            ))}
          </div>
          {saleItemsTab === 'products' ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <select className="glass-input rounded-xl px-3 py-2 flex-1" onChange={e=>{
                  const id = Number(e.target.value); if (!id) return; e.currentTarget.selectedIndex = 0;
                  setSaleProducts(prev => prev.find(p=>p.product_id===id) ? prev : [...prev, { product_id: id, quantity: 1 }]);
                }}>
                  <option value="">Додати товар…</option>
                  {allProducts.map(p=> <option key={p.product_id} value={p.product_id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                {saleProducts.map(item => (
                  <div key={item.product_id} className="flex items-center gap-2 text-sm bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                    <span className="flex-1 truncate">{allProducts.find(p=>p.product_id===item.product_id)?.name || `#${item.product_id}`}</span>
                    <span className="opacity-80 whitespace-nowrap">{fmtMoney(allProducts.find(p=>p.product_id===item.product_id)?.price || 0)}</span>
                    <input type="number" min={1} className="glass-input w-20 text-sm px-2 py-1 rounded-md" value={item.quantity} onChange={e=>{
                      const q = Math.max(1, Number(e.target.value)||1);
                      setSaleProducts(prev => prev.map(x=> x.product_id===item.product_id ? { ...x, quantity: q } : x));
                    }} />
                    <span className="opacity-90 whitespace-nowrap font-medium">{fmtMoney(((allProducts.find(p=>p.product_id===item.product_id)?.price)||0) * (item.quantity||0))}</span>
                    <GlassIconButton aria-label="Прибрати" onClick={()=> setSaleProducts(prev => prev.filter(x=>x.product_id!==item.product_id))}>✕</GlassIconButton>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <select className="glass-input rounded-xl px-3 py-2 flex-1" onChange={e=>{
                  const id = Number(e.target.value); if (!id) return; e.currentTarget.selectedIndex = 0;
                  setSaleServices(prev => prev.find(s=>s.service_id===id) ? prev : [...prev, { service_id: id, quantity: 1 }]);
                }}>
                  <option value="">Додати послугу…</option>
                  {allServices.map(s=> <option key={s.service_id} value={s.service_id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                {saleServices.map(item => (
                  <div key={item.service_id} className="flex items-center gap-2 text-sm bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                    <span className="flex-1 truncate">{allServices.find(s=>s.service_id===item.service_id)?.name || `#${item.service_id}`}</span>
                    <span className="opacity-80 whitespace-nowrap">{fmtMoney(allServices.find(s=>s.service_id===item.service_id)?.price || 0)}</span>
                    <input type="number" min={1} className="glass-input w-20 text-sm px-2 py-1 rounded-md" value={item.quantity || 1} onChange={e=>{
                      const q = Math.max(1, Number(e.target.value)||1);
                      setSaleServices(prev => prev.map(x=> x.service_id===item.service_id ? { ...x, quantity: q } : x));
                    }} />
                    <span className="opacity-90 whitespace-nowrap font-medium">{fmtMoney(((allServices.find(s=>s.service_id===item.service_id)?.price)||0) * (Math.max(1, item.quantity||1)))}</span>
                    <GlassIconButton aria-label="Прибрати" onClick={()=> setSaleServices(prev => prev.filter(x=>x.service_id!==item.service_id))}>✕</GlassIconButton>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Totals */}
        <div className="border-t border-white/10 pt-2 text-sm space-y-1">
          <div className="flex justify-between"><span>Сума товарів</span><span className="font-medium">{fmtMoney(productsTotal)}</span></div>
          <div className="flex justify-between"><span>Сума послуг</span><span className="font-medium">{fmtMoney(servicesTotal)}</span></div>
          <div className="flex justify-between text-base"><span className="font-semibold">Разом</span><span className="font-semibold">{fmtMoney(grandTotal)}</span></div>
        </div>
        <div className="text-xs opacity-70">
          Відповідальний менеджер: {data?.main_responsible_manager ? `${data.main_responsible_manager.first_name} ${data.main_responsible_manager.last_name}` : '—'}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <GlassButton onClick={()=> setCreatingSale(false)} className="bg-white/10">Скасувати</GlassButton>
          <GlassButton
            disabled={!saleDate || !saleStatusId || !saleCounterpartyId}
            onClick={async ()=>{
              if (!data?.project_id) return;
              try {
                setSaleError(null);
                await SalesService.create({
                  project_id: data.project_id,
                  sale_date: saleDate,
                  // pass numeric status id; backend will map to name
                  status: saleStatusId,
                  counterparty_id: saleCounterpartyId,
                  products: saleProducts,
                  services: saleServices
                });
                const p = await ProjectsService.getById(data.project_id);
                setData(p);
                setCreatingSale(false);
                // Reset form fields (date will be auto-set when opening modal again)
                setSaleTitle(''); 
                const now = new Date();
                const currentDateTime = now.getFullYear() + '-' + 
                                      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                                      String(now.getDate()).padStart(2, '0') + 'T' + 
                                      String(now.getHours()).padStart(2, '0') + ':' + 
                                      String(now.getMinutes()).padStart(2, '0');
                setSaleDate(currentDateTime);
                setSaleProducts([]); 
                setSaleServices([]); 
                setSaleCounterpartyId('');
              } catch (e: any) {
                const msg = e?.response?.data?.error || e?.message || 'Не вдалося створити продаж';
                setSaleError(String(msg));
              }
            }}
          >Створити</GlassButton>
        </div>
        {saleError && <div className="text-sm text-red-400">{saleError}</div>}
      </div>
    </GlassModal>
    <SubProjectDrawer 
      open={subDrawerOpen} 
      subprojectId={activeSubId} 
      onClose={() => setSubDrawerOpen(false)} 
      onSaved={async () => {
        // Reload project data to reflect subproject changes
        if (projectId) {
          try {
            const p = await ProjectsService.getById(projectId);
            setData(p);
          } catch (e) {
            console.error('Error reloading project after subproject save:', e);
          }
        }
      }} 
    />
    <TaskViewModal open={taskViewOpen} task={activeTask} onClose={() => setTaskViewOpen(false)} />
    </>
  );
}
