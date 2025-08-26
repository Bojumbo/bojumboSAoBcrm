import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { Sale, Manager, Counterparty, Product, Service, SaleStatus } from '../types';
import PageHeader from '../components/PageHeader';
import { TrashIcon, PlusIcon } from '../components/Icons';

// --- SaleForm Component ---
const SaleForm: React.FC<{
    onSave: () => void;
    onCancel: () => void;
    managers: Manager[];
    counterparties: Counterparty[];
    products: Product[];
    services: Service[];
}> = ({ onSave, onCancel, managers, counterparties, products, services }) => {
    const [formData, setFormData] = useState<{
        counterparty_id: string;
        responsible_manager_id: string;
        products: { product_id: string; quantity: number }[];
        services: { service_id: string }[];
        status: SaleStatus;
        deferred_payment_date: string;
    }>({
        counterparty_id: '',
        responsible_manager_id: '',
        products: [],
        services: [],
        status: SaleStatus.NOT_PAID,
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

    const isFormValid = formData.counterparty_id && formData.responsible_manager_id && (formData.status !== SaleStatus.DEFERRED || formData.deferred_payment_date);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Product Handlers
    const handleAddProduct = () => {
        setFormData(prev => ({ ...prev, products: [...prev.products, { product_id: '', quantity: 1 }] }));
    };

    const handleProductChange = (index: number, field: 'product_id' | 'quantity', value: string) => {
        const newProducts = [...formData.products];
        const val = field === 'quantity' ? Math.max(1, parseInt(value) || 1) : value;
        newProducts[index] = { ...newProducts[index], [field]: val };
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
            deferred_payment_date: formData.status === SaleStatus.DEFERRED ? formData.deferred_payment_date : null,
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
    
    const baseInputClasses = "w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative p-6 border w-full max-w-3xl shadow-lg rounded-md bg-white dark:bg-gray-800 max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-white mb-6">Створення нового продажу</h3>
                <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 flex-grow">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Контрагент</label>
                            <select name="counterparty_id" value={formData.counterparty_id} onChange={handleChange} required className={baseInputClasses}>
                                <option value="" disabled>Виберіть контрагента</option>
                                {counterparties.map(c => <option key={c.counterparty_id} value={c.counterparty_id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Відповідальний менеджер</label>
                            <select name="responsible_manager_id" value={formData.responsible_manager_id} onChange={handleChange} required className={baseInputClasses}>
                                <option value="" disabled>Виберіть менеджера</option>
                                {managers.map(m => <option key={m.manager_id} value={m.manager_id}>{m.first_name} {m.last_name}</option>)}
                            </select>
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Статус оплати</label>
                            <select name="status" value={formData.status} onChange={handleChange} required className={baseInputClasses}>
                                {Object.values(SaleStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        {formData.status === SaleStatus.DEFERRED && (
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Дата відтермінованої оплати</label>
                                <input type="date" name="deferred_payment_date" value={formData.deferred_payment_date} onChange={handleChange} required className={baseInputClasses}/>
                            </div>
                        )}
                    </div>
                    
                    {/* Products */}
                    <fieldset className="border border-gray-300 dark:border-gray-600 rounded-md p-4">
                        <legend className="px-2 text-base font-medium text-gray-900 dark:text-white">Товари</legend>
                        <div className="space-y-3">
                            {formData.products.map((p, index) => {
                                 const availableProducts = products.filter(
                                    prod => prod.product_id.toString() === p.product_id || !formData.products.some(fp => fp.product_id === prod.product_id.toString())
                                 );
                                 const selectedProduct = products.find(prod => prod.product_id.toString() === p.product_id);
                                return (
                                <div key={index} className="flex items-center gap-2">
                                    <select value={p.product_id} onChange={(e) => handleProductChange(index, 'product_id', e.target.value)} className={`${baseInputClasses} flex-grow`} required>
                                        <option value="" disabled>Виберіть товар</option>
                                        {availableProducts.map(prod => <option key={prod.product_id} value={prod.product_id}>{prod.name} ({prod.price.toFixed(2)} грн)</option>)}
                                    </select>
                                    <input type="number" min="1" value={p.quantity} onChange={(e) => handleProductChange(index, 'quantity', e.target.value)} className={`${baseInputClasses} w-24 text-center`} placeholder="К-сть"/>
                                    <span className="w-28 text-right text-sm font-medium text-gray-700 dark:text-gray-300 pr-2">
                                        {selectedProduct ? `${(selectedProduct.price * p.quantity).toFixed(2)} грн` : '0.00 грн'}
                                    </span>
                                    <button type="button" onClick={() => handleRemoveProduct(index)} className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                            )})}
                        </div>
                         <button type="button" onClick={handleAddProduct} className="mt-4 inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900">
                           <PlusIcon className="h-4 w-4 mr-2"/>Додати товар
                         </button>
                    </fieldset>
                    
                    {/* Services */}
                    <fieldset className="border border-gray-300 dark:border-gray-600 rounded-md p-4">
                        <legend className="px-2 text-base font-medium text-gray-900 dark:text-white">Послуги</legend>
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
                                     <span className="w-28 text-right text-sm font-medium text-gray-700 dark:text-gray-300 pr-2">
                                        {selectedService ? `${selectedService.price.toFixed(2)} грн` : '0.00 грн'}
                                    </span>
                                    <button type="button" onClick={() => handleRemoveService(index)} className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                            )})}
                        </div>
                        <button type="button" onClick={handleAddService} className="mt-4 inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900">
                           <PlusIcon className="h-4 w-4 mr-2"/>Додати послугу
                        </button>
                    </fieldset>
                </form>
                <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700 mt-auto">
                    <div>
                        <span className="text-lg font-medium text-gray-700 dark:text-gray-300">До оплати:</span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white ml-3">
                            {totalPrice.toFixed(2)} грн
                        </span>
                    </div>
                    <div className="flex space-x-2">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Скасувати</button>
                        <button type="button" onClick={handleSubmit} disabled={!isFormValid} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed">Зберегти</button>
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
    
    // Data for the form
    const [managers, setManagers] = useState<Manager[]>([]);
    const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [services, setServices] = useState<Service[]>([]);

    const fetchSalesAndDeps = useCallback(async () => {
        setLoading(true);
        try {
            const [salesData, managersData, counterpartiesData, productsData, servicesData] = await Promise.all([
                api.getAll<Sale>('sales'),
                api.getAll<Manager>('managers'),
                api.getAll<Counterparty>('counterparties'),
                api.getAll<Product>('products'),
                api.getAll<Service>('services'),
            ]);
            setSales(salesData.sort((a, b) => b.sale_id - a.sale_id));
            setManagers(managersData);
            setCounterparties(counterpartiesData);
            setProducts(productsData);
            setServices(servicesData);
        } catch (error) {
            console.error("Failed to fetch sales data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSalesAndDeps();
    }, [fetchSalesAndDeps]);

    const handleDelete = async (id: number) => {
        if (window.confirm('Ви впевнені, що хочете видалити цей продаж?')) {
            await api.delete('sales', id);
            fetchSalesAndDeps();
        }
    };
    
    const handleAdd = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    const handleSave = () => {
        handleCloseModal();
        fetchSalesAndDeps();
    };

    return (
        <div>
            <PageHeader title="Продажі" buttonLabel="Додати продаж" onButtonClick={handleAdd} />
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Контрагент</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Менеджер</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Дата</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Статус</th>
                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Сума</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Дії</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-4">Завантаження...</td></tr>
                        ) : (
                            sales.map((s) => (
                                <tr key={s.sale_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{s.sale_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{s.counterparty?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{s.responsible_manager ? `${s.responsible_manager.first_name} ${s.responsible_manager.last_name}` : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(s.sale_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {s.status}
                                        {s.status === SaleStatus.DEFERRED && s.deferred_payment_date && (
                                            <span className="block text-xs text-gray-400">
                                                до {new Date(s.deferred_payment_date).toLocaleDateString()}
                                            </span>
                                        )}
                                    </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-medium">{(s.total_price || 0).toFixed(2)} грн.</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleDelete(s.sale_id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
             {isModalOpen && (
                <SaleForm
                    onSave={handleSave}
                    onCancel={handleCloseModal}
                    managers={managers}
                    counterparties={counterparties}
                    products={products}
                    services={services}
                />
            )}
        </div>
    );
};

export default Sales;