import { useEffect, useRef, useState } from 'react';
import GlassDrawer from '../components/GlassDrawer';
import GlassButton from '../components/GlassButton';
import GlassIconButton from '../components/GlassIconButton';
import GlassCard from '../components/GlassCard';
import { SubProjectsService } from '../services/SubProjectsService';
import { CommentService, ProjectComment } from '../services/CommentService';
import { UploadService } from '../services/UploadService';
import api from '../api/httpClient';
import GlassModal from '../components/GlassModal';
import { SaleStatusTypesService, SaleStatusType } from '../services/SaleStatusTypesService';
import { ProductsService, Product } from '../services/ProductsService';
import { ServicesService, Service } from '../services/ServicesService';
import { SalesService } from '../services/SalesService';
import { FunnelsService, Funnel } from '../services/FunnelsService';
import { SubProjectStatusTypesService, SubProjectStatusType } from '../services/SubProjectStatusTypesService';
import TaskViewModal from '../components/TaskViewModal';

 type Props = {
  subprojectId: number | null;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

export default function SubProjectDrawer({ subprojectId, open, onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [activeTab, setActiveTab] = useState<'comments' | 'sales' | 'products' | 'tasks'>('comments');
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ fileName: string; fileUrl: string; fileType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [creatingSale, setCreatingSale] = useState(false);
  const [saleDate, setSaleDate] = useState<string>('');
  const [saleStatusId, setSaleStatusId] = useState<number | ''>('');
  const [statusTypes, setStatusTypes] = useState<SaleStatusType[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [subProjectStatusTypes, setSubProjectStatusTypes] = useState<SubProjectStatusType[]>([]);
  const [saleProducts, setSaleProducts] = useState<{ product_id: number; quantity: number }[]>([]);
  const [saleServices, setSaleServices] = useState<{ service_id: number; quantity?: number }[]>([]);
  const [saleItemsTab, setSaleItemsTab] = useState<'products' | 'services'>('products');
  const [saleError, setSaleError] = useState<string | null>(null);
  const [saleCounterpartyId, setSaleCounterpartyId] = useState<number | ''>('');
  const [taskViewOpen, setTaskViewOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<any>(null);

  const [editStatus, setEditStatus] = useState(false);
  const [editCost, setEditCost] = useState(false);
  const [editDescription, setEditDescription] = useState(false);

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
    } catch {}
  };

  useEffect(() => {
    if (!open || !subprojectId) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const sp = await SubProjectsService.getById(subprojectId);
        setData(sp);
        const list = await CommentService.getSubProjectComments(subprojectId);
        setComments(list);
        const [prods, servs, funs, spStatusTypes] = await Promise.all([
          ProductsService.getAll(),
          ServicesService.getAll(),
          FunnelsService.getAll(),
          SubProjectStatusTypesService.getAll()
        ]);
        setAllProducts(prods);
        setAllServices(servs);
        setFunnels(funs);
        setSubProjectStatusTypes(spStatusTypes);
        setEditStatus(false);
        setEditCost(false);
        setEditDescription(false);
      } catch (e: any) {
        setError(e?.message || 'Помилка завантаження');
      } finally {
        setLoading(false);
      }
    })();
  }, [open, subprojectId]);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    setError(null);
    try {
      await SubProjectsService.update(data.subproject_id, {
        name: data.name,
        description: data.description,
        status: data.status,
        cost: data.cost,
        funnel_id: data.funnel_id,
        funnel_stage_id: data.funnel_stage_id,
      });
      onSaved?.();
    } catch (e:any) {
      setError(e?.message || 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    try {
      const info = await UploadService.upload(file);
      setUploadedFile(info);
    } catch {
      setSelectedFile(null);
      setUploadedFile(null);
    } finally {
      e.currentTarget.value = '';
    }
  };

  const sendComment = async () => {
    if (!subprojectId) return;
    const text = commentText.trim();
    if ((!text && !uploadedFile) || sending) return;
    setSending(true);
    try {
      const created = await CommentService.createSubProjectComment(subprojectId, text, uploadedFile ? { name: uploadedFile.fileName, url: uploadedFile.fileUrl, type: uploadedFile.fileType } : undefined);
      setComments(prev => [...prev, created]);
      setCommentText('');
      setSelectedFile(null);
      setUploadedFile(null);
    } catch {} finally { setSending(false); }
  };

  return (
    <>
    <GlassDrawer
      open={open}
      onClose={onClose}
      width="70vw"
      title={data?.name || 'Підпроект'}
      actions={<GlassButton onClick={save} disabled={saving}>{saving ? 'Збереження…' : 'Зберегти'}</GlassButton>}
    >
      {loading && <div>Завантаження...</div>}
      {error && <div className="text-red-400 mb-3">{error}</div>}
      {!!data && (
        <div className="space-y-4">
          <div className="lg:flex gap-4">
            <div className="lg:w-[300px] lg:flex-shrink-0">
              <GlassCard className="p-4 rounded-xl space-y-4">
                <div className="space-y-2 bg-white/5 border border-white/10 rounded-lg p-3 transition-colors hover:bg-white/10">
                  <div className="text-sm font-semibold mb-1">Проект</div>
                  <div className="text-sm opacity-85">{data.project?.name || `#${data.project_id}`}</div>
                </div>
                <div className="space-y-2 bg-white/5 border border-white/10 rounded-lg p-3 transition-colors hover:bg-white/10">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Воронка</div>
                  </div>
                  <div className="space-y-2">
                    <select
                      className="w-full glass-input rounded-xl px-3 py-2"
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
                    <select
                      className="w-full glass-input rounded-xl px-3 py-2"
                      value={data.funnel_stage_id ?? ''}
                      onChange={e => setData({ ...data, funnel_stage_id: Number(e.target.value) || null })}
                      disabled={!data.funnel_id}
                    >
                      <option value="">— Етап —</option>
                      {funnels.find(f => f.funnel_id === data.funnel_id)?.stages?.map(s => (
                        <option key={s.funnel_stage_id} value={s.funnel_stage_id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2 bg-white/5 border border-white/10 rounded-lg p-3 transition-colors hover:bg-white/10">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Статус</div>
                    <GlassIconButton aria-label="Редагувати статус" onClick={()=>setEditStatus(v=>!v)}>
                      {editStatus ? '✓' : '✎'}
                    </GlassIconButton>
                  </div>
                  {editStatus ? (
                    <select
                      className="w-full glass-input rounded-xl px-3 py-2"
                      value={data.status ?? ''}
                      onChange={e=>setData({ ...data, status: e.target.value })}
                    >
                      <option value="">—</option>
                      {subProjectStatusTypes.map(s => (
                        <option key={s.sub_project_status_id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm opacity-85">{data.status || '—'}</div>
                  )}
                </div>
                <div className="space-y-2 bg-white/5 border border-white/10 rounded-lg p-3 transition-colors hover:bg-white/10">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Вартість</div>
                    <GlassIconButton aria-label="Редагувати вартість" onClick={()=>setEditCost(v=>!v)}>
                      {editCost ? '✓' : '✎'}
                    </GlassIconButton>
                  </div>
                  {editCost ? (
                    <input
                      type="number"
                      className="w-full glass-input rounded-xl px-3 py-2"
                      value={data.cost ?? 0}
                      onChange={e => setData({ ...data, cost: Number(e.target.value) })}
                    />
                  ) : (
                    <div className="text-sm opacity-85">{fmtMoney(data.cost || 0)}</div>
                  )}
                </div>
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
                <div>
                  <GlassButton onClick={async ()=>{
                    setCreatingSale(true);
                    setSaleDate(new Date().toISOString().slice(0,10));
                    setSaleError(null);
                    setSaleCounterpartyId(data?.project?.counterparty_id ?? '');
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
                  }}>Створити продаж</GlassButton>
                </div>
              </GlassCard>
            </div>
            <div className="flex-1 min-w-0 space-y-4">
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'comments', label: `Коментарі${comments.length ? ` (${comments.length})` : ''}` },
                  { key: 'sales', label: `Продажі${data?.sales?.length ? ` (${data.sales.length})` : ''}` },
                  { key: 'products', label: `Товари/Послуги` },
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

              {activeTab === 'comments' && (
                <div className="space-y-3">
                  <div className="glass glass-scroll-y p-3 rounded-xl max-h-[50vh] min-h-[160px] glass-scrollbar">
                    {comments.length === 0 && <div className="text-sm opacity-70">Коментарів поки немає.</div>}
                    <div className="space-y-3">
                      {comments.map(c => (
                        <div key={c.comment_id} className="bg-white/5 rounded-lg p-2 border border-white/10">
                          <div className="text-xs opacity-70 mb-1">
                            {(c.manager?.first_name||'') + ' ' + (c.manager?.last_name||'')} • {new Date(c.created_at).toLocaleString('uk-UA')}
                          </div>
                          {c.content && <div className="text-sm whitespace-pre-wrap mb-2">{c.content}</div>}
                          {c.file_url && (
                            <div className="flex items-center gap-2 bg-black/20 rounded-md p-2 border border-white/10">
                              {c.file_type?.startsWith('image/') ? (
                                <button type="button" onClick={()=> downloadByUrl(fileUrlAbs(c.file_url!), c.file_name || undefined)} className="flex items-center gap-2 text-left">
                                  <img src={fileUrlAbs(c.file_url)} alt={c.file_name || 'attachment'} className="w-16 h-16 object-cover rounded" />
                                  <span className="text-xs underline truncate max-w-[200px]">{c.file_name || 'Зображення'}</span>
                                </button>
                              ) : (
                                <button type="button" onClick={()=> downloadByUrl(fileUrlAbs(c.file_url!), c.file_name || undefined)} className="text-xs underline truncate text-left">
                                  {c.file_name || 'Файл'}
                                </button>
                              )}
                            </div>
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
                        if ((e as any).nativeEvent?.isComposing) return;
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!sending) sendComment(); }
                      }}
                    />
                    <input ref={fileInputRef} type="file" className="hidden" onChange={onPickFile} />
                    <GlassIconButton aria-label="Додати файл" title="Додати файл" size="md" onClick={() => fileInputRef.current?.click()}>
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

              {activeTab === 'sales' && (
                <div className="glass p-3 rounded-xl">
                  {(!data?.sales || data.sales.length===0) && (
                    <div className="text-sm opacity-70">Продажі відсутні.</div>
                  )}
                   <div className="space-y-2">
                    {(data?.sales || []).map((s:any) => (
                      <div key={s.sale_id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <div className="font-medium text-sm">{s.title || s.name || `Продаж #${s.sale_id}`}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {s.counterparty?.name ? `Контрагент: ${s.counterparty.name}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="glass p-3 rounded-xl space-y-3">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-sm font-semibold mb-2">Додати товар до підпроєкту</div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <select id="add-subproject-product" className="glass-input rounded-xl px-3 py-2 min-w-[240px]">
                        <option value="">— Оберіть товар —</option>
                        {allProducts.map(p => (
                          <option key={p.product_id} value={p.product_id}>{p.name}</option>
                        ))}
                      </select>
                      <input id="add-subproject-product-qty" type="number" min={1} step={1} defaultValue={1} className="glass-input rounded-xl px-3 py-2 w-[120px]" />
                      <GlassButton onClick={async ()=>{
                        if (!data?.subproject_id) return;
                        const sel = document.getElementById('add-subproject-product') as HTMLSelectElement;
                        const qtyEl = document.getElementById('add-subproject-product-qty') as HTMLInputElement;
                        const pid = Number(sel?.value||'');
                        const qty = Math.max(1, Math.round(Number(qtyEl?.value||1)));
                        if (!pid) return;
                        try {
                          await api.post(`/subprojects/${data.subproject_id}/products`, { product_id: pid, quantity: qty });
                          const sp = await SubProjectsService.getById(data.subproject_id);
                          setData(sp);
                          if (sel) sel.selectedIndex = 0; if (qtyEl) qtyEl.value = '1';
                        } catch {}
                      }}>Додати</GlassButton>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-sm font-semibold mb-2">Додати послугу до підпроєкту</div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <select id="add-subproject-service" className="glass-input rounded-xl px-3 py-2 min-w-[240px]">
                        <option value="">— Оберіть послугу —</option>
                        {allServices.map(s => (
                          <option key={s.service_id} value={s.service_id}>{s.name}</option>
                        ))}
                      </select>
                      <input id="add-subproject-service-qty" type="number" min={0.1} step={0.1} defaultValue={1} className="glass-input rounded-xl px-3 py-2 w-[120px]" />
                      <GlassButton onClick={async ()=>{
                        if (!data?.subproject_id) return;
                        const sel = document.getElementById('add-subproject-service') as HTMLSelectElement;
                        const qtyEl = document.getElementById('add-subproject-service-qty') as HTMLInputElement;
                        const sid = Number(sel?.value||'');
                        const qty = Math.max(0.1, Number(qtyEl?.value||1));
                        if (!sid) return;
                        try {
                          await api.post(`/subprojects/${data.subproject_id}/services`, { service_id: sid, quantity: qty });
                          const sp = await SubProjectsService.getById(data.subproject_id);
                          setData(sp);
                          if (sel) sel.selectedIndex = 0; if (qtyEl) qtyEl.value = '1';
                        } catch {}
                      }}>Додати</GlassButton>
                    </div>
                  </div>

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
                      <div key={pp.subproject_product_id || idx} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{pp.product?.name || 'Товар'}</div>
                          <div className="text-xs opacity-75">Кількість: {pp.quantity}{pp.product?.unit?.name ? ` ${pp.product.unit.name}` : ''}</div>
                        </div>
                        <div className="w-[120px] text-right text-sm opacity-85">{fmtMoney(pp.product?.price || 0)}</div>
                        <div className="w-[140px] text-right text-sm font-medium">{fmtMoney((pp.product?.price || 0) * (pp.quantity || 0))}</div>
                        <GlassIconButton aria-label="Прибрати товар" title="Прибрати товар" onClick={async ()=>{
                          try {
                            await api.delete(`/subprojects/${data.subproject_id}/products/${pp.subproject_product_id}`);
                            const sp = await SubProjectsService.getById(data.subproject_id);
                            setData(sp);
                          } catch {}
                        }}>✕</GlassIconButton>
                      </div>
                    ))}
                    {data?.products?.length ? (
                      <div className="flex justify-end border-t border-white/10 pt-2">
                        <div className="w-[140px] text-right text-sm font-semibold">
                          {fmtMoney((data?.products || []).reduce((sum:number, pp:any)=> sum + (pp.product?.price || 0) * (pp.quantity || 0), 0))}
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
                        <div className="w-[120px] text-right text-sm opacity-85">{fmtMoney(ps.service?.price || 0)}</div>
                        <div className="w-[140px] text-right text-sm font-medium">{fmtMoney((ps.service?.price || 0) * (Math.max(0.1, Number(ps.quantity)||1)))}</div>
                          <GlassIconButton aria-label="Прибрати послугу" title="Прибрати послугу" onClick={async ()=>{
                            try {
                              const sid = ps.service?.service_id || ps.service_id;
                              await api.delete(`/subprojects/${data.subproject_id}/services/by-service/${sid}`);
                              const sp = await SubProjectsService.getById(data.subproject_id);
                              setData(sp);
                            } catch {}
                          }}>✕</GlassIconButton>
                        </div>
                      ))}
                      {data?.services?.length ? (
                        <div className="flex justify-end border-t border-white/10 pt-2">
                          <div className="w-[140px] text-right text-sm font-semibold">
                            {fmtMoney((data?.services || []).reduce((sum:number, ps:any)=> sum + (ps.service?.price || 0) * (Math.max(0.1, Number(ps.quantity)||1)), 0))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className="flex justify-end border-t border-white/10 pt-3 mt-2 items-baseline gap-3">
                      <div className="text-sm opacity-85">Разом (товари + послуги)</div>
                      <div className="w-[140px] text-right text-base font-bold">
                        {fmtMoney(
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
        </div>
      )}
  </GlassDrawer>
    {/* Create Sale Modal for SubProject */}
    <GlassModal open={creatingSale} onClose={()=> setCreatingSale(false)} title="Створити продаж для підпроєкту">
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <input type="date" className="glass-input rounded-xl px-3 py-2 w-[200px]" value={saleDate} onChange={e=> setSaleDate(e.target.value)} />
          <div className="flex items-center gap-2">
            <label className="text-sm opacity-80">Статус</label>
            <select className="glass-input rounded-xl px-3 py-2" value={saleStatusId} onChange={e=> setSaleStatusId(Number(e.target.value))}>
              {statusTypes.map(s=> (
                <option key={s.sale_status_id} value={s.sale_status_id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm opacity-80">Контрагент</label>
            <input className="glass-input rounded-xl px-3 py-2 w-[260px]" value={data?.project?.counterparty?.name || ''} disabled />
          </div>
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
        <div className="flex justify-end gap-2 pt-2">
          <GlassButton onClick={()=> setCreatingSale(false)} className="bg-white/10">Скасувати</GlassButton>
          <GlassButton
            disabled={!saleDate || !saleStatusId || !data?.project?.counterparty_id}
            onClick={async ()=>{
              if (!subprojectId) return;
              try {
                setSaleError(null);
                await SalesService.create({
                  subproject_id: subprojectId,
                  sale_date: saleDate,
                  status: saleStatusId,
                  counterparty_id: data?.project?.counterparty_id || null,
                  products: saleProducts,
                  services: saleServices
                });
                // reload subproject to reflect sales later if needed
                const sp = await SubProjectsService.getById(subprojectId);
                setData(sp);
                setCreatingSale(false);
                setSaleDate(''); setSaleProducts([]); setSaleServices([]);
              } catch (e: any) {
                const msg = e?.response?.data?.error || e?.message || 'Не вдалося створити продаж';
                setSaleError(String(msg));
              }
            }}
          >Створити</GlassButton>
        </div>
        {!data?.project?.counterparty_id && (
          <div className="text-xs text-yellow-300">Спочатку додайте контрагента до проекту, щоб створити продаж.</div>
        )}
        {saleError && <div className="text-sm text-red-400">{saleError}</div>}
      </div>
    </GlassModal>
    <TaskViewModal open={taskViewOpen} onClose={()=> setTaskViewOpen(false)} task={activeTask} />
    </>
  );
}
