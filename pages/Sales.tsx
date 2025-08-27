
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { Sale, Manager, Counterparty, Product, Service, SaleStatusType } from '../types';
import PageHeader from '../components/PageHeader';
import { TrashIcon, PlusIcon, FunnelIcon } from '../components/Icons';

// --- SaleForm Component ---
const SaleForm: React.FC<{
    onSave: () => void;
    onCancel: () => void;
    managers: Manager[];
    counterparties: Counterparty[];
    products: Product[];
    services: Service[];
    saleStatuses: SaleStatusType[];
}> = ({ onSave, onCancel, managers, counterparties, products, services, saleStatuses }) => {
    const [formData, setFormData] = useState<{
        counterparty_id: string;
        responsible_manager_id: string;
        products: { product_id: string; quantity: number }[];
        services: { service_id: string }[];
        status: string;
        deferred_payment_date: string;
    }>({
        counterparty_id: '',
        responsible_manager_id: '',
        products: [],
        services: [],
        status: saleStatuses[0]?.name || '',
        deferred_payment_date: '',
    });

    const totalPrice = useMemo(() => {
        const productsTotal = formData.products.reduce((sum, p) => {
            if (!p.product_id) return sum;
            const product = products.find(prod => prod.product_id.toString() === p.product_id);
            return sum + (product ? product.price * p.quantity : 0);
        }, 0);

        const servicesTotal = formData.services.reduce((sum, s) => {
            if (!s.service_id) return sum;
            const service = services.find(serv => serv.service_id.toString() === s.service_id);
            return sum + (service ? service.price : 0);
        }, 0);

        return productsTotal + servicesTotal;
    }, [formData.products, formData.services, products, services]);
    
    const DEFERRED_STATUS_NAME = 'Відтермінована оплата'; // This could be made more robust
    const isFormValid = formData.counterparty_id && formData.responsible_manager_id && (formData.status !== DEFERRED_STATUS_NAME || formData.deferred_payment_date);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Product Handlers
    const handleAddProduct = () => {
        setFormData(prev => ({ ...prev, products: [...prev.products, { product_id: '', quantity: 1 }] }));
    };

    const handleProductChange = (index: number, field: 'product_id' | 'quantity', value: string) => {
        const newProducts = [...formData.products];
        
        if (field === 'quantity') {
            const productInfo = products.find(p => p.product_id.toString() === newProducts[index].product_id);
            const availableStock = productInfo?.total_stock || 0;
            const requestedQuantity = parseInt(value, 10);
            
            if (requestedQuantity > availableStock) {
                alert(`Недостатньо товару на складі. Доступно: ${availableStock}`);
                newProducts[index] = { ...newProducts[index], quantity: availableStock };
            } else {
                 newProducts[index] = { ...newProducts[index], quantity: Math.max(1, requestedQuantity || 1) };
            }
        } else {
            newProducts[index] = { ...newProducts[index], product_id: value };
        }
        
        setFormData({ ...formData, products: newProducts });
    };

    const handleRemoveProduct = (index: number) => {
        setFormData(prev => ({ ...prev, products: prev.products.filter((_, i) => i !== index) }));
    };

    // Service Handlers
    const handleAddService = () => {
        setFormData(prev => ({ ...prev, services: [...prev.services, { service_id: '' }] }));
    };

    const handleServiceChange = (index: number, value: string) => {
        const newServices = [...formData.services];
        newServices[index] = { service_id: value };
        setFormData({ ...formData, services: newServices });
    };
    
    const handleRemoveService = (index: number) => {
        setFormData(prev => ({ ...prev, services: prev.services.filter((_, i) => i !== index) }));
    };

    // Submit Handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) {
            alert('Будь ласка, заповніть усі обов\'язкові поля.');
            return;
        }

        const dataToSave = {
            counterparty_id: parseInt(formData.counterparty_id),
            responsible_manager_id: parseInt(formData.responsible_manager_id),
            sale_date: new Date().toISOString(),
            status: formData.status,
            deferred_payment_date: formData.status === DEFERRED_STATUS_NAME ? formData.deferred_payment_date : null,
            products: formData.products
                .filter(p => p.product_id)
                .map(p => ({ product_id: parseInt(p.product_id), quantity: p.quantity })),
            services: formData.services
                .filter(s => s.service_id)
                .map(s => ({ service_id: parseInt(s.service_id) })),
        };
        
        await api.create('sales', dataToSave);
        onSave();
    };
    
    const baseInputClasses = "w-full px-3 py-2 rounded-md focus:outline-none glass-input";

    return (
        <div className="fixed inset-0 bg-[var(--modal-backdrop-bg)] backdrop-blur-md overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="modal-animate relative p-6 border w-full max-w-3xl shadow-lg rounded-2xl glass-pane max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-semibold leading-6 text-[var(--text-primary)] mb-6">Створення нового продажу</h3>
                <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 flex-grow">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Контрагент</label>
                            <select name="counterparty_id" value={formData.counterparty_id} onChange={handleChange} required className={baseInputClasses}>
                                <option value="" disabled>Виберіть контрагента</option>
                                {counterparties.map(c => <option key={c.counterparty_id} value={c.counterparty_id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Відповідальний менеджер</label>
                            <select name="responsible_manager_id" value={formData.responsible_manager_id} onChange={handleChange} required className={baseInputClasses}>
                                <option value="" disabled>Виберіть менеджера</option>
                                {managers.map(m => <option key={m.manager_id} value={m.manager_id}>{m.first_name} {m.last_name}</option>)}
                            </select>
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Статус оплати</label>
                            <select name="status" value={formData.status} onChange={handleChange} required className={baseInputClasses}>
                                {saleStatuses.map(s => <option key={s.sale_status_id} value={s.name}>{s.name}</option>)}
                            </select>
                        </div>
                        {formData.status === DEFERRED_STATUS_NAME && (
                             <div>
                                 <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Дата відтермінованої оплати</label>
                                <input type="date" name="deferred_payment_date" value={formData.deferred_payment_date} required className={baseInputClasses}/>
                            </div>
                        )}
                    </div>
                    
                    {/* Products */}
                    <fieldset className="border border-[var(--glass-border)] rounded-md p-4">
                        <legend className="px-2 text-base font-medium text-[var(--text-primary)]">Товари</legend>
                        <div className="space-y-3">
                            {formData.products.map((p, index) => {
                                 const availableProducts = products.filter(
                                    prod => (prod.total_stock || 0) > 0 && (prod.product_id.toString() === p.product_id || !formData.products.some(fp => fp.product_id === prod.product_id.toString()))
                                 );
                                 const selectedProduct = products.find(prod => prod.product_id.toString() === p.product_id);
                                return (
                                <div key={index} className="flex items-center gap-2">
                                    <select value={p.product_id} onChange={(e) => handleProductChange(index, 'product_id', e.target.value)} className={`${baseInputClasses} flex-grow`} required>
                                        <option value="" disabled>Виберіть товар</option>
                                        {availableProducts.map(prod => <option key={prod.product_id} value={prod.product_id}>{prod.name} (Залишок: {prod.total_stock || 0})</option>)}
                                    </select>
                                    <input type="number" min="1" value={p.quantity} onChange={(e) => handleProductChange(index, 'quantity', e.target.value)} className={`${baseInputClasses} w-24 text-center`} placeholder="К-сть"/>
                                    <span className="w-28 text-right text-sm font-medium text-[var(--text-primary)] pr-2">
                                        {selectedProduct ? `${(selectedProduct.price * p.quantity).toFixed(2)} грн` : '0.00 грн'}
                                    </span>
                                    <button type="button" onClick={() => handleRemoveProduct(index)} className="p-2 text-red-400 hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                            )})}
                        </div>
                         <button type="button" onClick={handleAddProduct} className="mt-4 inline-flex items-center px-3 py-1.5 text-sm font-medium text-[var(--text-brand)] bg-white/10 border border-transparent rounded-md hover:bg-white/20">
                           <PlusIcon className="h-4 w-4 mr-2"/>Додати товар
                         </button>
                    </fieldset>
                    
                    {/* Services */}
                    <fieldset className="border border-[var(--glass-border)] rounded-md p-4">
                        <legend className="px-2 text-base font-medium text-[var(--text-primary)]">Послуги</legend>
                         <div className="space-y-3">
                            {formData.services.map((s, index) => {
                                const availableServices = services.filter(
                                    serv => serv.service_id.toString() === s.service_id || !formData.services.some(fs => fs.service_id === serv.service_id.toString())
                                );
                                const selectedService = services.find(serv => serv.service_id.toString() === s.service_id);
                                return (
                                <div key={index} className="flex items-center gap-2">
                                    <select value={s.service_id} onChange={(e) => handleServiceChange(index, e.target.value)} className={`${baseInputClasses} flex-grow`} required>
                                        <option value="" disabled>Виберіть послугу</option>
                                        {availableServices.map(serv => <option key={serv.service_id} value={serv.service_id}>{serv.name} ({serv.price.toFixed(2)} грн)</option>)}
                                    </select>
                                     <span className="w-28 text-right text-sm font-medium text-[var(--text-primary)] pr-2">
                                        {selectedService ? `${selectedService.price.toFixed(2)} грн` : '0.00 грн'}
                                    </span>
                                    <button type="button" onClick={() => handleRemoveService(index)} className="p-2 text-red-400 hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                            )})}
                        </div>
                        <button type="button" onClick={handleAddService} className="mt-4 inline-flex items-center px-3 py-1.5 text-sm font-medium text-[var(--text-brand)] bg-white/10 border border-transparent rounded-md hover:bg-white/20">
                           <PlusIcon className="h-4 w-4 mr-2"/>Додати послугу
                        </button>
                    </fieldset>
                </form>
                <div className="flex justify-between items-center pt-6 border-t border-[var(--glass-border)] mt-auto">
                    <div>
                        <span className="text-lg font-medium text-[var(--text-secondary)]">До оплати:</span>
                        <span className="text-2xl font-bold text-[var(--text-primary)] ml-3">
                            {totalPrice.toFixed(2)} грн
                        </span>
                    </div>
                    <div className="flex space-x-2">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-white/10 text-[var(--text-primary)] rounded-md hover:bg-white/20">Скасувати</button>
                        <button type="button" onClick={handleSubmit} disabled={!isFormValid} className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-md hover:bg-[var(--brand-bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed">Зберегти</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main Sales Page Component ---
const Sales: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Data for the form and filters
    const [managers, setManagers] = useState<Manager[]>([]);
    const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [saleStatuses, setSaleStatuses] = useState<SaleStatusType[]>([]);
    const [filters, setFilters] = useState({
        counterparty_id: '',
        responsible_manager_id: '',
        status: '',
        startDate: '',
        endDate: '',
    });

    const fetchSalesAndDeps = useCallback(async () => {
        setLoading(true);
        try {
            const [salesData, managersData, counterpartiesData, productsData, servicesData, saleStatusesData] = await Promise.all([
                api.getAll<Sale>('sales'),
                api.getAll<Manager>('managers'),
                api.getAll<Counterparty>('counterparties'),
                api.getAll<Product>('products'),
                api.getAll<Service>('services'),
                api.getAll<SaleStatusType>('saleStatuses'),
            ]);
            setSales(salesData.sort((a, b) => b.sale_id - a.sale_id));
            setManagers(managersData);
            setCounterparties(counterpartiesData);
            setProducts(productsData);
            setServices(servicesData);
            setSaleStatuses(saleStatusesData);
        } catch (error) {
            console.error("Failed to fetch sales data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSalesAndDeps();
    }, [fetchSalesAndDeps]);

    const filteredSales = useMemo(() => {
        return sales.filter(s => {
            const counterpartyMatch = filters.counterparty_id ? s.counterparty_id.toString() === filters.counterparty_id : true;
            const managerMatch = filters.responsible_manager_id ? s.responsible_manager_id.toString() === filters.responsible_manager_id : true;
            const statusMatch = filters.status ? s.status === filters.status : true;
            
            const saleDate = new Date(s.sale_date);
            const startDateMatch = filters.startDate ? saleDate >= new Date(filters.startDate) : true;
            const endDateMatch = filters.endDate ? saleDate <= new Date(new Date(filters.endDate).setHours(23, 59, 59, 999)) : true;

            return counterpartyMatch && managerMatch && statusMatch && startDateMatch && endDateMatch;
        });
    }, [sales, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const resetFilters = () => {
        setFilters({
            counterparty_id: '',
            responsible_manager_id: '',
            status: '',
            startDate: '',
            endDate: '',
        });
    };

    const handleAdd = () => {
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Ви впевнені, що хочете видалити цей продаж?')) {
            await api.delete('sales', id);
            fetchSalesAndDeps();
        }
    };

    const handleSave = () => {
        setIsModalOpen(false);
        fetchSalesAndDeps();
    };
    
    const baseInputClasses = "w-full px-3 py-2 text-sm rounded-md focus:outline-none glass-input";

    return (
        <div>
            <PageHeader title="Продажі" buttonLabel="Додати продаж" onButtonClick={handleAdd} />
            
            <div className="mb-6 p-4 rounded-xl glass-pane">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center mb-4">
                    <FunnelIcon className="h-5 w-5 mr-2" />
                    Фільтри
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <select name="counterparty_id" value={filters.counterparty_id} onChange={handleFilterChange} className={baseInputClasses}>
                        <option value="">Всі контрагенти</option>
                        {counterparties.map(c => <option key={c.counterparty_id} value={c.counterparty_id}>{c.name}</option>)}
                    </select>
                    <select name="responsible_manager_id" value={filters.responsible_manager_id} onChange={handleFilterChange} className={baseInputClasses}>
                        <option value="">Всі менеджери</option>
                        {managers.map(m => <option key={m.manager_id} value={m.manager_id}>{m.first_name} {m.last_name}</option>)}
                    </select>
                    <select name="status" value={filters.status} onChange={handleFilterChange} className={baseInputClasses}>
                        <option value="">Всі статуси</option>
                        {saleStatuses.map(s => <option key={s.sale_status_id} value={s.name}>{s.name}</option>)}
                    </select>
                    <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Дата від</label>
                            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className={baseInputClasses} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Дата до</label>
                            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className={baseInputClasses} />
                        </div>
                    </div>
                </div>
                 <div className="mt-4 flex justify-end">
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-white/10 border border-transparent rounded-md hover:bg-white/20"
                    >
                        Скинути фільтри
                    </button>
                </div>
            </div>

            <div className="rounded-xl glass-pane overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-[var(--table-header-bg)]">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Дата</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Контрагент</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Менеджер</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Сума</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Статус</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Дії</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--table-divide-color)]">
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-4 text-[var(--text-secondary)]">Завантаження...</td></tr>
                        ) : (
                            filteredSales.map((s) => (
                                <tr key={s.sale_id} className="hover:bg-[var(--table-row-hover-bg)] transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{new Date(s.sale_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">{s.counterparty?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{s.responsible_manager ? `${s.responsible_manager.first_name} ${s.responsible_manager.last_name}` : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{(s.total_price || 0).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{s.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleDelete(s.sale_id)} className="text-red-400 hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))
                        )}
                        {!loading && filteredSales.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-4 text-[var(--text-secondary)]">Немає продажів, що відповідають фільтрам.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <SaleForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} managers={managers} counterparties={counterparties} products={products} services={services} saleStatuses={saleStatuses} />}
        </div>
    );
};

export default Sales;
