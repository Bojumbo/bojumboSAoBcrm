
import { useEffect, useRef, useState } from 'react';
import GlassDrawer from '../components/GlassDrawer';
import GlassButton from '../components/GlassButton';
import GlassIconButton from '../components/GlassIconButton';
import GlassCard from '../components/GlassCard';
import { SubProjectsService } from '../services/SubProjectsService';
import { CommentService, ProjectComment } from '../services/CommentService';
import { UploadService } from '../services/UploadService';
import api from '../api/httpClient';
import { SalesService } from '../services/SalesService';
import { SaleStatusTypesService, SaleStatusType } from '../services/SaleStatusTypesService';
import { ProductsService, Product } from '../services/ProductsService';
import { ServicesService, Service } from '../services/ServicesService';
import GlassModal from '../components/GlassModal';
import SubProjectFunnelsService from '../services/SubProjectFunnelsService';
import { SubProjectFunnel, SubProjectFunnelStage } from '../../backend/src/types';
import { SubProjectStatusTypesService, SubProjectStatusType } from '../services/SubProjectStatusTypesService';
import TaskViewModal from '../components/TaskViewModal';

type SubProjectFunnelWithStages = SubProjectFunnel & {
  stages?: SubProjectFunnelStage[];
};

type Props = {
  subprojectId: number | null;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

export default function SubProjectDrawer({ subprojectId, open, onClose, onSaved }: Props) {
  console.log('🔍 SubProjectDrawer component loaded, subprojectId:', subprojectId, 'open:', open);
  
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
  const [saleTitle, setSaleTitle] = useState<string>('');
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
  const [saleStatusId, setSaleStatusId] = useState<string>('');
  const [statusTypes, setStatusTypes] = useState<SaleStatusType[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [funnels, setFunnels] = useState<SubProjectFunnelWithStages[]>([]);
  const [subProjectStatusTypes, setSubProjectStatusTypes] = useState<SubProjectStatusType[]>([]);
  const [saleProducts, setSaleProducts] = useState<{ product_id: number; quantity: number }[]>([]);
  const [saleServices, setSaleServices] = useState<{ service_id: number; quantity?: number }[]>([]);
  const [saleItemsTab, setSaleItemsTab] = useState<'products' | 'services'>('products');
  const [saleError, setSaleError] = useState<string | null>(null);
  const [taskViewOpen, setTaskViewOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<any>(null);

  // Edit toggles for sidebar fields
  const [editStatus, setEditStatus] = useState(false);
  const [editDescription, setEditDescription] = useState(false);
  const [editCost, setEditCost] = useState(false);

  // Helpers for currency formatting and totals
  const fmtMoney = (n: number) => new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(n || 0);
  
  // Helper to get current date/time string for datetime-local input
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.getFullYear() + '-' + 
           String(now.getMonth() + 1).padStart(2, '0') + '-' + 
           String(now.getDate()).padStart(2, '0') + 'T' + 
           String(now.getHours()).padStart(2, '0') + ':' + 
           String(now.getMinutes()).padStart(2, '0');
  };
  
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

  // SubProject products and services totals
  const subProjectProductsTotal = (data?.products || []).reduce((sum: number, pp: any) => 
    sum + (pp.product?.price || 0) * (pp.quantity || 0), 0);
  const subProjectServicesTotal = (data?.services || []).reduce((sum: number, ps: any) => 
    sum + (ps.service?.price || 0) * (Math.max(0.1, Number(ps.quantity) || 1)), 0);
  const subProjectGrandTotal = subProjectProductsTotal + subProjectServicesTotal;

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
        setActiveTab('comments');
        
        // Load meta lists in parallel
        const [prods, servs, funs, spStatusTypes, statusTypes] = await Promise.all([
          ProductsService.getAll(),
          ServicesService.getAll(),
          SubProjectFunnelsService.getAll(),
          SubProjectStatusTypesService.getAll(),
          SaleStatusTypesService.getAll()
        ]);
        setAllProducts(prods);
        setAllServices(servs);
        setFunnels(funs);
        setSubProjectStatusTypes(spStatusTypes);
        setStatusTypes(statusTypes);
        
        // reset edit toggles on load
        setEditStatus(false);
        setEditDescription(false);
        setEditCost(false);
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
      await SubProjectsService.update(data.sub_project_id, data);
      onSaved?.();
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  const deleteComment = async (commentId: number) => {
    if (!confirm('Ви впевнені, що хочете видалити цей коментар? Цю дію не можна скасувати.')) {
      return;
    }
    if (!subprojectId) return;
    try {
      await CommentService.deleteSubProjectComment(subprojectId, commentId);
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
      title={data?.name || 'Підпроект'}
      actions={
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-2 xl:gap-4 w-full xl:w-auto">
          {!!data && (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label className="text-sm whitespace-nowrap">Воронка:</label>
                <select
                  className="glass-input rounded-md px-2 py-1 min-w-[160px] max-w-[300px] w-full sm:w-auto"
                  value={data.sub_project_funnel_id ?? ''}
                  onChange={e => {
                    const fid = Number(e.target.value) || null;
                    let stageId = data.sub_project_funnel_stage_id ?? null;
                    const selected = funnels.find(f => f.sub_project_funnel_id === fid!);
                    if (fid && selected) {
                      const firstStage = selected.stages?.[0]?.sub_project_funnel_stage_id ?? null;
                      const contains = !!selected.stages?.some(s => s.sub_project_funnel_stage_id === stageId);
                      stageId = contains ? stageId : firstStage;
                    } else {
                      stageId = null;
                    }
                    setData({ ...data, sub_project_funnel_id: fid, sub_project_funnel_stage_id: stageId });
                  }}
                >
                  <option value="">—</option>
                  {funnels.map(f => (
                    <option key={f.sub_project_funnel_id} value={f.sub_project_funnel_id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label className="text-sm whitespace-nowrap">Етап:</label>
                <select
                  className="glass-input rounded-md px-2 py-1 min-w-[160px] max-w-[300px] w-full sm:w-auto"
                  value={data.sub_project_funnel_stage_id ?? ''}
                  onChange={e => setData({ ...data, sub_project_funnel_stage_id: Number(e.target.value) || null })}
                  disabled={!data.sub_project_funnel_id}
                >
                  <option value="">—</option>
                  {funnels.find(f => f.sub_project_funnel_id === data.sub_project_funnel_id)?.stages?.map(s => (
                    <option key={s.sub_project_funnel_stage_id} value={s.sub_project_funnel_stage_id}>{s.name}</option>
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
            {/* Left sidebar with subproject meta as a single element */}
            <div className="lg:w-[300px] lg:flex-shrink-0">
              <GlassCard className="p-4 rounded-xl">
                <div className="space-y-6">
                  {/* Parent Project */}
                  <div className="space-y-2 bg-white/5 border border-white/10 rounded-lg p-3 transition-colors hover:bg-white/10">
                    <div className="text-sm font-semibold">Проект</div>
                    <div className="text-sm opacity-85">{data.project?.name || `#${data.project_id}`}</div>
                  </div>

                  {/* Counterparty */}
                  {data.project?.counterparty && (
                    <div className="space-y-2 bg-white/5 border border-white/10 rounded-lg p-3 transition-colors hover:bg-white/10">
                      <div className="text-sm font-semibold">Контрагент</div>
                      <div className="text-sm opacity-85">
                        <div>{data.project.counterparty.name}</div>
                        {data.project.counterparty.phone && (
                          <a href={`tel:${data.project.counterparty.phone}`} className="text-xs hover:underline">
                            {data.project.counterparty.phone}
                          </a>
                        )}
                        {data.project.counterparty.email && (
                          <a 
                            href={`mailto:${data.project.counterparty.email}`} 
                            className={`text-xs hover:underline ${data.project.counterparty.phone ? 'ml-2' : ''}`}
                          >
                            {data.project.counterparty.email}
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status */}
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
                        {subProjectStatusTypes.map(st => (
                          <option key={st.sub_project_status_id} value={st.name}>{st.name}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-sm opacity-85">{data.status || '—'}</div>
                    )}
                  </div>

                  {/* Cost */}
                  <div className="space-y-2 bg-white/5 border border-white/10 rounded-lg p-3 transition-colors hover:bg-white/10">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">Вартість (UAH)</div>
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

                  {/* SubProject totals */}
                  <div className="space-y-2 bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-sm font-semibold">Суми по підпроекту</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="opacity-85">Товари ({data?.products?.length || 0}):</span>
                        <span className={`font-medium ${subProjectProductsTotal > 0 ? 'text-green-400' : 'opacity-60'}`}>
                          {fmtMoney(subProjectProductsTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="opacity-85">Послуги ({data?.services?.length || 0}):</span>
                        <span className={`font-medium ${subProjectServicesTotal > 0 ? 'text-green-400' : 'opacity-60'}`}>
                          {fmtMoney(subProjectServicesTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm border-t border-white/10 pt-1 mt-2">
                        <span className="font-semibold">Загалом:</span>
                        <span className={`font-bold ${subProjectGrandTotal > 0 ? 'text-green-300' : 'opacity-60'}`}>
                          {fmtMoney(subProjectGrandTotal)}
                        </span>
                      </div>
                      {data.cost && data.cost > 0 && (
                        <div className="flex justify-between text-xs opacity-75 pt-1">
                          <span>Бюджет:</span>
                          <span>{fmtMoney(data.cost)}</span>
                        </div>
                      )}
                      {data.cost && data.cost > 0 && subProjectGrandTotal > 0 && (
                        <div className="flex justify-between text-xs pt-1">
                          <span>Виконання:</span>
                          <span className={`font-medium ${
                            subProjectGrandTotal >= data.cost ? 'text-green-400' : 
                            subProjectGrandTotal >= data.cost * 0.8 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {((subProjectGrandTotal / data.cost) * 100).toFixed(1)}%
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

              {/* Tab Content */}
              <div className="flex-1">
                {activeTab === 'comments' && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <textarea
                        className="flex-1 glass-input rounded-xl px-3 py-2 min-h-[80px]"
                        placeholder="Новий коментар..."
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                      />
                      <div className="flex flex-col gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          onChange={onPickFile}
                        />
                        <GlassButton
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-2 text-xs"
                        >
                          📎
                        </GlassButton>
                        <GlassButton
                          disabled={!commentText.trim() && !uploadedFile}
                          onClick={async () => {
                            if (!subprojectId || (!commentText.trim() && !uploadedFile)) return;
                            setSending(true);
                            try {
                              const newComment = await CommentService.createSubProjectComment(subprojectId, commentText, uploadedFile ? {
                                name: uploadedFile.fileName,
                                url: uploadedFile.fileUrl,
                                type: uploadedFile.fileType,
                              } : undefined);
                              setComments(prev => [newComment, ...prev]);
                              setCommentText('');
                              setSelectedFile(null);
                              setUploadedFile(null);
                            } catch (err) {
                              // Optionally show error
                            } finally {
                              setSending(false);
                            }
                          }}
                          className="px-3 py-2 text-xs"
                        >
                          {sending ? '...' : '➤'}
                        </GlassButton>
                      </div>
                    </div>
                    
                    {selectedFile && (
                      <div className="text-sm opacity-75">
                        Обраний файл: {selectedFile.name}
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {comments.map(comment => (
                        <GlassCard key={comment.comment_id} className="p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-sm opacity-75">
                              {(comment.manager?.first_name || comment.manager?.last_name) ? 
                                `${comment.manager.first_name || ''} ${comment.manager.last_name || ''}`.trim() : 'Користувач'} • {new Date(comment.created_at).toLocaleString('uk-UA')}
                            </div>
                            {!comment.is_deleted && (
                              <GlassIconButton 
                                onClick={() => deleteComment(comment.comment_id)}
                                aria-label="Видалити коментар"
                                className="text-red-400"
                              >
                                🗑
                              </GlassIconButton>
                            )}
                          </div>
                          {comment.is_deleted ? (
                            <div className="text-sm opacity-50 italic">Коментар видалено</div>
                          ) : (
                            <>
                              {comment.content && (
                                <div className="text-sm whitespace-pre-wrap mb-2">{comment.content}</div>
                              )}
                              {comment.file_url && (
                                <div className="text-sm">
                                  <button
                                    onClick={() => downloadByUrl(fileUrlAbs(comment.file_url!), comment.file_name || undefined)}
                                    className="text-blue-400 underline"
                                  >
                                    📎 {comment.file_name || 'Файл'}
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </GlassCard>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'sales' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Продажі підпроекту</h3>
                      <GlassButton onClick={() => {
                        // Reset form and set current date/time
                        setSaleDate(getCurrentDateTime());
                        setSaleTitle('');
                        setSaleProducts([]);
                        setSaleServices([]);
                        setSaleError(null);
                        setCreatingSale(true);
                      }}>
                        Створити продаж
                      </GlassButton>
                    </div>
                    <div className="space-y-2">
                      {(data?.sales || []).map((sale: any, idx: number) => {
                        // Calculate total from products and services
                        console.log(`Sale ${idx} products:`, sale.products);
                        console.log(`Sale ${idx} services:`, sale.services);
                        
                        const productsTotal = (sale.products || []).reduce((sum: number, item: any) => {
                          const price = item.product?.price || 0;
                          const quantity = item.quantity || 0;
                          console.log(`Product: price=${price}, quantity=${quantity}, subtotal=${price * quantity}`);
                          return sum + price * quantity;
                        }, 0);
                        
                        const servicesTotal = (sale.services || []).reduce((sum: number, item: any) => {
                          const price = item.service?.price || 0;
                          console.log(`Service: price=${price}`);
                          return sum + price;
                        }, 0);
                        
                        const total = productsTotal + servicesTotal;
                        console.log(`Sale ${idx} total: products=${productsTotal}, services=${servicesTotal}, total=${total}`);
                        
                        return (
                        <GlassCard key={idx} className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{fmtMoney(total)}</div>
                              <div className="text-xs opacity-50">DEBUG: {total} (p:{productsTotal} s:{servicesTotal})</div>
                              <div className="text-sm opacity-75">
                                {new Date(sale.sale_date).toLocaleDateString('uk-UA')} • {sale.status}
                              </div>
                              {sale.counterparty && (
                                <div className="text-sm opacity-75">{sale.counterparty.name}</div>
                              )}
                              {(sale.products?.length > 0 || sale.services?.length > 0) && (
                                <div className="text-xs opacity-60 mt-1">
                                  {sale.products?.length > 0 && `${sale.products.length} товар(ів)`}
                                  {sale.products?.length > 0 && sale.services?.length > 0 && ' • '}
                                  {sale.services?.length > 0 && `${sale.services.length} послуг(и)`}
                                </div>
                              )}
                            </div>
                          </div>
                        </GlassCard>
                        );
                      })}
                      {(!data?.sales || data.sales.length === 0) && (
                        <div className="text-center py-8 text-sm opacity-60">
                          Продажів поки немає
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'products' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Товари підпроекту</h3>
                    <div className="space-y-2">
                      {(data?.products || []).map((pp: any, idx: number) => (
                        <GlassCard key={idx} className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{pp.product?.name || `Товар #${pp.product_id}`}</div>
                              <div className="text-sm opacity-75">
                                Кількість: {pp.quantity} • Ціна: {fmtMoney(pp.product?.price || 0)}
                              </div>
                            </div>
                            <div className="font-bold">
                              {fmtMoney((pp.product?.price || 0) * (pp.quantity || 0))}
                            </div>
                          </div>
                        </GlassCard>
                      ))}
                      {(!data?.products || data.products.length === 0) && (
                        <div className="text-center py-8 text-sm opacity-60">
                          Товарів поки немає
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Завдання підпроекту</h3>
                    <div className="space-y-2">
                      {(data?.tasks || []).map((task: any, idx: number) => (
                        <GlassCard key={idx} className="p-3 cursor-pointer hover:bg-white/10" 
                          onClick={() => {
                            setActiveTask(task);
                            setTaskViewOpen(true);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{task.title || `Завдання #${task.task_id}`}</div>
                              <div className="text-sm opacity-75">
                                Статус: {task.status} • Пріоритет: {task.priority}
                              </div>
                              {task.assigned_manager && (
                                <div className="text-sm opacity-75">
                                  Виконавець: {task.assigned_manager.name}
                                </div>
                              )}
                            </div>
                            {task.due_date && (
                              <div className="text-sm opacity-75">
                                До: {new Date(task.due_date).toLocaleDateString('uk-UA')}
                              </div>
                            )}
                          </div>
                        </GlassCard>
                      ))}
                      {(!data?.tasks || data.tasks.length === 0) && (
                        <div className="text-center py-8 text-sm opacity-60">
                          Завдань поки немає
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </GlassDrawer>

    {/* Create Sale Modal for SubProject */}
    <GlassModal open={creatingSale} onClose={() => setCreatingSale(false)} title="Створити продаж для підпроєкту">
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <input className="glass-input rounded-xl px-3 py-2 flex-1 min-w-[240px]" placeholder="Назва/Титул" value={saleTitle} onChange={e=>setSaleTitle(e.target.value)} />
          <input type="datetime-local" className="glass-input rounded-xl px-3 py-2 w-[200px]" value={saleDate} onChange={e=> setSaleDate(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <label className="text-sm opacity-80">Статус</label>
          <select className="glass-input rounded-xl px-3 py-2" value={saleStatusId} onChange={e=> setSaleStatusId(e.target.value)}>
            <option value="">Оберіть статус</option>
            {statusTypes.map(s=> (
              <option key={s.sale_status_id} value={s.name}>{s.name}</option>
            ))}
          </select>
          <label className="text-sm opacity-80 ml-2">Контрагент</label>
          <select className="glass-input rounded-xl px-3 py-2" value={data?.project?.counterparty_id || ''}
                  onChange={e=> {/* readonly for subproject */}}
                  disabled={true}>
            <option value="">— Контрагент проекту —</option>
            {data?.project?.counterparty && (
              <option value={data.project.counterparty_id}>{data.project.counterparty.name}</option>
            )}
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
                    <input type="number" min={0.1} step={0.1} className="glass-input w-20 text-sm px-2 py-1 rounded-md" value={item.quantity || 1} onChange={e=>{
                      const q = Math.max(0.1, Number(e.target.value)||1);
                      setSaleServices(prev => prev.map(x=> x.service_id===item.service_id ? { ...x, quantity: q } : x));
                    }} />
                    <span className="opacity-90 whitespace-nowrap font-medium">{fmtMoney(((allServices.find(s=>s.service_id===item.service_id)?.price)||0) * (Math.max(0.1, item.quantity||1)))}</span>
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
        {data?.project?.main_responsible_manager && (
          <div className="text-xs opacity-70">
            Відповідальний менеджер: {data.project.main_responsible_manager.first_name} {data.project.main_responsible_manager.last_name}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <GlassButton onClick={() => setCreatingSale(false)} className="bg-white/10">Скасувати</GlassButton>
          <GlassButton
            disabled={!saleDate || !saleStatusId || !data?.project?.counterparty_id}
            onClick={async () => {
              console.log('NEW CODE: Sale button clicked - status should be string now');
              console.log('Validation - saleDate:', saleDate, 'saleStatusId:', saleStatusId, 'type:', typeof saleStatusId, 'counterparty_id:', data?.project?.counterparty_id);
              
              if (!subprojectId) {
                console.log('No subprojectId');
                return;
              }
              try {
                setSaleError(null);
                console.log('Creating sale with data:', {
                  subproject_id: subprojectId,
                  sale_date: saleDate,
                  status: saleStatusId,
                  counterparty_id: data?.project?.counterparty_id || null,
                  products: saleProducts,
                  services: saleServices
                });
                
                const result = await SalesService.create({
                  subproject_id: subprojectId,
                  sale_date: saleDate,
                  status: saleStatusId,
                  counterparty_id: data?.project?.counterparty_id || null,
                  products: saleProducts,
                  services: saleServices
                });
                
                console.log('Sale created successfully:', result);
                // reload subproject to reflect sales
                console.log('Reloading subproject data...');
                const sp = await SubProjectsService.getById(subprojectId);
                console.log('Subproject reloaded:', sp);
                console.log('Sales in reloaded subproject:', sp?.sales?.length || 0);
                if (sp?.sales?.length > 0) {
                  console.log('First sale FULL OBJECT:', JSON.stringify(sp.sales[0], null, 2));
                  console.log('First sale products:', sp.sales[0].products);
                  console.log('First sale services:', sp.sales[0].services);
                }
                setData(sp);
                setCreatingSale(false);
                // Reset form fields (date will be auto-set when opening modal again)
                setSaleTitle(''); 
                setSaleDate(getCurrentDateTime());
                setSaleStatusId(''); // Reset status selection
                setSaleProducts([]); 
                setSaleServices([]);
              } catch (e: any) {
                console.error('Error creating sale:', e);
                console.error('Error response:', e?.response);
                console.error('Error data:', e?.response?.data);
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
    
    <TaskViewModal open={taskViewOpen} onClose={() => setTaskViewOpen(false)} task={activeTask} />
    </>
  );
}
