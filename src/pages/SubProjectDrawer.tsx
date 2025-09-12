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
import TaskViewModal from '../components/TaskViewModal';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
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
  const [saleStatusId, setSaleStatusId] = useState<number | ''>('');
  const [statusTypes, setStatusTypes] = useState<SaleStatusType[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [funnels, setFunnels] = useState<SubProjectFunnelWithStages[]>([]);
  const [saleProducts, setSaleProducts] = useState<{ product_id: number; quantity: number }[]>([]);
  const [saleServices, setSaleServices] = useState<{ service_id: number; quantity?: number }[]>([]);
  const [saleItemsTab, setSaleItemsTab] = useState<'products' | 'services'>('products');
  const [saleError, setSaleError] = useState<string | null>(null);
  const [taskViewOpen, setTaskViewOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<any>(null);

  // Adding products/services to subproject
  const [addingProduct, setAddingProduct] = useState(false);
  const [addingService, setAddingService] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [serviceQuantity, setServiceQuantity] = useState<number>(1.0);

  // Edit toggles for sidebar fields
  const [editDescription, setEditDescription] = useState(false);
  const [editCost, setEditCost] = useState(false);

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

  // SubProject products and services totals
  const subProjectProductsTotal = (data?.products || []).reduce((sum: number, pp: any) => 
    sum + (pp.product?.price || 0) * (pp.quantity || 0), 0);
  const subProjectServicesTotal = (data?.services || []).reduce((sum: number, ps: any) => 
    sum + (ps.service?.price || 0) * (ps.quantity || 1), 0);
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
        const [prods, servs, funs, statusTypes] = await Promise.all([
          ProductsService.getAll(),
          ServicesService.getAll(),
          SubProjectFunnelsService.getAll(),
          SaleStatusTypesService.getAll()
        ]);
        setAllProducts(prods);
        setAllServices(servs);
        setFunnels(funs);
        setStatusTypes(statusTypes);
        
        // reset edit toggles on load
        setEditDescription(false);
        setEditCost(false);
      } catch (e: any) {
        setError(e?.message || 'Помилка завантаження');
      } finally {
        setLoading(false);
      }
    })();
  }, [open, subprojectId]);

  const save = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!data || !subprojectId) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await SubProjectsService.update(subprojectId, data);
      
      // Update local data with the response
      setData(result);
      
      // Call onSaved callback to update parent component
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
    } catch (e: any) {
      // optionally show toast
    } finally {
      setSending(false);
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

  // Product management functions
  const handleAddProduct = async () => {
    if (!subprojectId || !selectedProductId) return;
    setAddingProduct(true);
    try {
      await SubProjectsService.addProduct(subprojectId, selectedProductId as number, productQuantity);
      // Reload subproject data
      const updated = await SubProjectsService.getById(subprojectId);
      setData(updated);
      setSelectedProductId('');
      setProductQuantity(1);
    } catch (e: any) {
      alert('Помилка додавання товару: ' + (e?.response?.data?.error || e?.message || 'Невідома помилка'));
    } finally {
      setAddingProduct(false);
    }
  };

  const handleRemoveProduct = async (productId: number) => {
    if (!subprojectId) return;
    if (!confirm('Видалити цей товар з підпроекту?')) return;
    try {
      await SubProjectsService.removeProduct(subprojectId, productId);
      // Reload subproject data
      const updated = await SubProjectsService.getById(subprojectId);
      setData(updated);
    } catch (e: any) {
      alert('Помилка видалення товару: ' + (e?.response?.data?.error || e?.message || 'Невідома помилка'));
    }
  };

  // Service management functions
  const handleAddService = async () => {
    if (!subprojectId || !selectedServiceId) return;
    setAddingService(true);
    try {
      await SubProjectsService.addService(subprojectId, selectedServiceId as number, serviceQuantity);
      // Reload subproject data
      const updated = await SubProjectsService.getById(subprojectId);
      setData(updated);
      setSelectedServiceId('');
      setServiceQuantity(1.0);
    } catch (e: any) {
      alert('Помилка додавання послуги: ' + (e?.response?.data?.error || e?.message || 'Невідома помилка'));
    } finally {
      setAddingService(false);
    }
  };

  const handleRemoveService = async (serviceId: number) => {
    if (!subprojectId) return;
    if (!confirm('Видалити цю послугу з підпроекту?')) return;
    try {
      await SubProjectsService.removeService(subprojectId, serviceId);
      // Reload subproject data
      const updated = await SubProjectsService.getById(subprojectId);
      setData(updated);
    } catch (e: any) {
      alert('Помилка видалення послуги: ' + (e?.response?.data?.error || e?.message || 'Невідома помилка'));
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
                  onChange={e => {
                    const stageId = Number(e.target.value) || null;
                    setData({ ...data, sub_project_funnel_stage_id: stageId });
                  }}
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
          <GlassButton 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              save(e);
            }} 
            disabled={saving || !data}
            type="button"
          >
            {saving ? 'Збереження…' : 'Зберегти'}
          </GlassButton>
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

                {activeTab === 'sales' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Продажі підпроекту</h3>
                      <GlassButton onClick={() => {
                        // Reset form and set current date/time
                        const now = new Date();
                        const currentDateTime = now.getFullYear() + '-' + 
                                              String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                                              String(now.getDate()).padStart(2, '0') + 'T' + 
                                              String(now.getHours()).padStart(2, '0') + ':' + 
                                              String(now.getMinutes()).padStart(2, '0');
                        setSaleDate(currentDateTime);
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
                        const productsTotal = (sale.products || []).reduce((sum: number, p: any) => {
                          const price = Number(p.product?.price) || Number(p.price) || 0;
                          const quantity = Number(p.quantity) || 0;
                          return sum + (price * quantity);
                        }, 0);
                        
                        const servicesTotal = (sale.services || []).reduce((sum: number, s: any) => {
                          const price = Number(s.service?.price) || Number(s.price) || 0;
                          const quantity = Number(s.quantity) || 0;
                          return sum + (price * quantity);
                        }, 0);
                        
                        const calculatedTotal = productsTotal + servicesTotal;
                        
                        return (
                          <GlassCard key={idx} className="p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{fmtMoney(calculatedTotal || sale.total_amount || 0)}</div>
                                <div className="text-sm opacity-75">
                                  {new Date(sale.sale_date).toLocaleDateString('uk-UA')} • {sale.status}
                                </div>
                                {sale.counterparty && (
                                  <div className="text-sm opacity-75">{sale.counterparty.name}</div>
                                )}
                              </div>
                              <GlassIconButton 
                                aria-label="Видалити продаж" 
                                title="Видалити продаж" 
                                onClick={async () => {
                                  if (confirm('Ви впевнені, що хочете видалити цей продаж?')) {
                                    try {
                                      await SalesService.delete(sale.sale_id);
                                      // Оновлюємо дані підпроекту
                                      if (data?.subproject_id) {
                                        const updatedSubProject = await SubProjectsService.getById(data.subproject_id);
                                        setData(updatedSubProject);
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
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Товари та послуги підпроекту</h3>
                    </div>
                    
                    {/* Products Section */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm opacity-90">Товари</h4>
                        <div className="flex gap-2 items-center">
                          <select 
                            className="glass-input rounded-lg px-2 py-1 text-sm" 
                            value={selectedProductId} 
                            onChange={e => setSelectedProductId(Number(e.target.value) || '')}
                          >
                            <option value="">Оберіть товар...</option>
                            {allProducts.filter(p => !data?.products?.some((pp: any) => pp.product_id === p.product_id)).map(p => (
                              <option key={p.product_id} value={p.product_id}>{p.name}</option>
                            ))}
                          </select>
                          <input 
                            type="number" 
                            min="1" 
                            className="glass-input rounded-lg px-2 py-1 text-sm w-20" 
                            value={productQuantity} 
                            onChange={e => setProductQuantity(Math.max(1, Number(e.target.value) || 1))}
                            placeholder="К-сть"
                          />
                          <GlassButton 
                            disabled={!selectedProductId || addingProduct} 
                            onClick={handleAddProduct}
                            className="text-sm px-3 py-1"
                          >
                            {addingProduct ? '...' : '+'}
                          </GlassButton>
                        </div>
                      </div>
                      
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
                              <div className="flex items-center gap-2">
                                <div className="font-bold">
                                  {fmtMoney((pp.product?.price || 0) * (pp.quantity || 0))}
                                </div>
                                <GlassIconButton 
                                  aria-label="Видалити товар" 
                                  onClick={() => handleRemoveProduct(pp.product_id)}
                                >
                                  ✕
                                </GlassIconButton>
                              </div>
                            </div>
                          </GlassCard>
                        ))}
                        {(!data?.products || data.products.length === 0) && (
                          <div className="text-center py-4 text-sm opacity-60">
                            Товарів поки немає
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Services Section */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm opacity-90">Послуги</h4>
                        <div className="flex gap-2 items-center">
                          <select 
                            className="glass-input rounded-lg px-2 py-1 text-sm" 
                            value={selectedServiceId} 
                            onChange={e => setSelectedServiceId(Number(e.target.value) || '')}
                          >
                            <option value="">Оберіть послугу...</option>
                            {allServices.filter(s => !data?.services?.some((ps: any) => ps.service_id === s.service_id)).map(s => (
                              <option key={s.service_id} value={s.service_id}>{s.name}</option>
                            ))}
                          </select>
                          <input 
                            type="number" 
                            min="0.1" 
                            step="0.1" 
                            className="glass-input rounded-lg px-2 py-1 text-sm w-20" 
                            value={serviceQuantity} 
                            onChange={e => setServiceQuantity(Math.max(0.1, Number(e.target.value) || 1))}
                            placeholder="К-сть"
                          />
                          <GlassButton 
                            disabled={!selectedServiceId || addingService} 
                            onClick={handleAddService}
                            className="text-sm px-3 py-1"
                          >
                            {addingService ? '...' : '+'}
                          </GlassButton>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {(data?.services || []).map((ps: any, idx: number) => (
                          <GlassCard key={idx} className="p-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">{ps.service?.name || `Послуга #${ps.service_id}`}</div>
                                <div className="text-sm opacity-75">
                                  Кількість: {ps.quantity || 1} • Ціна: {fmtMoney(ps.service?.price || 0)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="font-bold">
                                  {fmtMoney((ps.service?.price || 0) * (ps.quantity || 1))}
                                </div>
                                <GlassIconButton 
                                  aria-label="Видалити послугу" 
                                  onClick={() => handleRemoveService(ps.service_id)}
                                >
                                  ✕
                                </GlassIconButton>
                              </div>
                            </div>
                          </GlassCard>
                        ))}
                        {(!data?.services || data.services.length === 0) && (
                          <div className="text-center py-4 text-sm opacity-60">
                            Послуг поки немає
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Total */}
                    {((data?.products && data.products.length > 0) || (data?.services && data.services.length > 0)) && (
                      <div className="border-t border-white/10 pt-3">
                        <div className="flex justify-between text-sm">
                          <span>Сума товарів:</span>
                          <span className="font-medium">{fmtMoney(subProjectProductsTotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Сума послуг:</span>
                          <span className="font-medium">{fmtMoney(subProjectServicesTotal)}</span>
                        </div>
                        <div className="flex justify-between text-base font-semibold border-t border-white/10 pt-2 mt-2">
                          <span>Загалом:</span>
                          <span>{fmtMoney(subProjectGrandTotal)}</span>
                        </div>
                      </div>
                    )}
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
          <select className="glass-input rounded-xl px-3 py-2" value={saleStatusId} onChange={e=> setSaleStatusId(Number(e.target.value))}>
            <option value="">Оберіть статус</option>
            {statusTypes.map(s=> (
              <option key={s.sale_status_id} value={s.sale_status_id}>{s.name}</option>
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
                // reload subproject to reflect sales
                const sp = await SubProjectsService.getById(subprojectId);
                setData(sp);
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
    
    <TaskViewModal open={taskViewOpen} onClose={() => setTaskViewOpen(false)} task={activeTask} />
    </>
  );
}
