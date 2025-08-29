
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ProductsService } from '../src/services/apiService';
import { HttpClient, PaginatedResponse } from '../src/services/httpClient';
import { API_CONFIG } from '../src/config/api';
import { Product, Unit, Warehouse } from '../types';
import PageHeader from '../components/PageHeader';
import { PencilIcon, TrashIcon, CubeIcon, FunnelIcon } from '../components/Icons';

const ProductForm: React.FC<{ product?: Product | null; onSave: () => void; onCancel: () => void; units: Unit[] }> = ({ product, onSave, onCancel, units }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        ...product,
        unit_id: product?.unit_id?.toString() || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'price' ? parseFloat(value) : value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { stocks, total_stock, unit, ...dataToSubmit } = formData as any;
        const dataToSave = {
            ...dataToSubmit,
            unit_id: formData.unit_id ? parseInt(formData.unit_id) : null,
        };
        if (product) {
            await ProductsService.update(product.product_id, dataToSave as any);
        } else {
            await ProductsService.create(dataToSave as any);
        }
        onSave();
    };

    return (
        <div className="fixed inset-0 bg-[var(--modal-backdrop-bg)] backdrop-blur-md overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="modal-animate relative p-6 border w-full max-w-md shadow-lg rounded-2xl glass-pane">
                <h3 className="text-lg font-medium leading-6 text-[var(--text-primary)]">{product ? 'Редагувати' : 'Додати'} товар</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Назва" required className="w-full px-3 py-2 rounded-md focus:outline-none glass-input"/>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Опис" className="w-full px-3 py-2 rounded-md focus:outline-none glass-input"></textarea>
                    <div className="flex gap-4">
                        <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Ціна" required min="0" step="0.01" className="w-full px-3 py-2 rounded-md focus:outline-none glass-input"/>
                        <select name="unit_id" value={formData.unit_id} onChange={handleChange} className="w-full px-3 py-2 rounded-md focus:outline-none glass-input">
                            <option value="">-- Одиниця --</option>
                            {units.map(u => <option key={u.unit_id} value={u.unit_id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-white/10 text-[var(--text-primary)] rounded-md hover:bg-white/20">Скасувати</button>
                        <button type="submit" className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-md hover:bg-[var(--brand-bg-hover)]">Зберегти</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const StockManagerModal: React.FC<{
    product: Product;
    warehouses: Warehouse[];
    onSave: () => void;
    onCancel: () => void;
}> = ({ product, warehouses, onSave, onCancel }) => {
    const [stockLevels, setStockLevels] = useState<{[key: number]: number}>({});

    useEffect(() => {
        const initialLevels: {[key: number]: number} = {};
        warehouses.forEach(w => {
            const stock = product.stocks?.find(s => s.warehouse_id === w.warehouse_id);
            initialLevels[w.warehouse_id] = stock?.quantity || 0;
        });
        setStockLevels(initialLevels);
    }, [product, warehouses]);
    
    const handleStockChange = (warehouseId: number, quantity: string) => {
        setStockLevels(prev => ({
            ...prev,
            [warehouseId]: Math.max(0, parseInt(quantity) || 0)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const stocksToUpdate = Object.entries(stockLevels).map(([warehouse_id, quantity]) => ({
            warehouse_id: parseInt(warehouse_id),
            quantity
        }));
        await ProductsService.setProductStocks(product.product_id, stocksToUpdate as any);
        onSave();
    };

    return (
        <div className="fixed inset-0 bg-[var(--modal-backdrop-bg)] backdrop-blur-md overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="modal-animate relative p-6 border w-full max-w-lg shadow-lg rounded-2xl glass-pane">
                <h3 className="text-lg font-medium leading-6 text-[var(--text-primary)]">Керування залишками: {product.name}</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {warehouses.map(w => (
                         <div key={w.warehouse_id} className="flex items-center justify-between">
                            <div>
                                <label className="font-medium text-[var(--text-primary)]">{w.name}</label>
                                <p className="text-sm text-[var(--text-secondary)]">{w.location}</p>
                            </div>
                            <input
                                type="number"
                                value={stockLevels[w.warehouse_id] || 0}
                                onChange={(e) => handleStockChange(w.warehouse_id, e.target.value)}
                                min="0"
                                className="w-32 px-3 py-2 text-right rounded-md focus:outline-none glass-input"
                            />
                        </div>
                    ))}
                </form>
                 <div className="flex justify-end space-x-2 pt-4 mt-4 border-t border-[var(--glass-border)]">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-white/10 text-[var(--text-primary)] rounded-md hover:bg-white/20">Скасувати</button>
                    <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-md hover:bg-[var(--brand-bg-hover)]">Зберегти</button>
                </div>
            </div>
        </div>
    )
}

const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isStockModalOpen, setStockModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [productsData, unitsData, warehousesData] = await Promise.all([
                ProductsService.getAll(),
                HttpClient.get<PaginatedResponse<Unit>>(API_CONFIG.ENDPOINTS.UNITS),
                HttpClient.get<PaginatedResponse<Warehouse>>(API_CONFIG.ENDPOINTS.WAREHOUSES),
            ]);
            setProducts((productsData as any).data);
            setUnits(unitsData.data);
            setWarehouses(warehousesData.data);
        } catch (error) {
            console.error("Failed to fetch products or units", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const handleAdd = () => {
        setSelectedProduct(null);
        setFormModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setFormModalOpen(true);
    };
    
    const handleManageStock = (product: Product) => {
        setSelectedProduct(product);
        setStockModalOpen(true);
    }

    const handleDelete = async (id: number) => {
        if (window.confirm('Ви впевнені, що хочете видалити цей товар? Усі пов\'язані записи про залишки на складах також будуть видалені.')) {
            await ProductsService.delete(id);
            fetchData();
        }
    };

    const handleSave = () => {
        setFormModalOpen(false);
        setStockModalOpen(false);
        fetchData();
    };

    return (
        <div>
            <PageHeader title="Товари" buttonLabel="Додати товар" onButtonClick={handleAdd} />
            
            <div className="mb-6 p-4 rounded-xl glass-pane">
                <div className="flex items-center">
                    <FunnelIcon className="h-5 w-5 mr-3 text-[var(--text-secondary)]" />
                    <input
                        type="text"
                        placeholder="Пошук за назвою..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-md focus:outline-none glass-input"
                    />
                </div>
            </div>

            <div className="rounded-xl glass-pane overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-[var(--table-header-bg)]">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Назва</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Опис</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Ціна</th>
                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Од.</th>
                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Залишок</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Дії</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--table-divide-color)]">
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-4 text-[var(--text-secondary)]">Завантаження...</td></tr>
                        ) : (
                            filteredProducts.map((p) => (
                                <tr key={p.product_id} className="hover:bg-[var(--table-row-hover-bg)] transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">{p.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)] max-w-sm truncate">{p.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{Number(p.price).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{p.unit?.name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[var(--text-primary)]">{(p as any).total_stock ?? (p.stocks ? p.stocks.reduce((sum, s) => sum + (s.quantity || 0), 0) : 0)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleManageStock(p)} title="Керувати залишками" className="text-green-400 hover:text-green-300"><CubeIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleEdit(p)} title="Редагувати" className="text-indigo-400 hover:text-indigo-300"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(p.product_id)} title="Видалити" className="text-red-400 hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))
                        )}
                        {!loading && filteredProducts.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-4 text-[var(--text-secondary)]">Немає товарів, що відповідають пошуку.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isFormModalOpen && <ProductForm product={selectedProduct} onSave={handleSave} onCancel={() => setFormModalOpen(false)} units={units} />}
            {isStockModalOpen && selectedProduct && <StockManagerModal product={selectedProduct} warehouses={warehouses} onSave={handleSave} onCancel={() => setStockModalOpen(false)} />}
        </div>
    );
};

export default Products;
