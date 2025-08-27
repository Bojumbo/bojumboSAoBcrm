
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { Product, Unit, Warehouse } from '../types';
import PageHeader from '../components/PageHeader';
import { PencilIcon, TrashIcon, CubeIcon, FunnelIcon } from '../components/Icons';

const ProductForm: React.FC<{ product?: Product | null; onSave: () => void; onCancel: () => void; units: Unit[] }> = ({ product, onSave, onCancel, units }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        // FIX: Removed duplicate `unit_id` property to resolve "An object literal cannot have multiple properties with the same name" error.
        ...product,
        unit_id: product?.unit_id?.toString() || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'price' ? parseFloat(value) : value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { stocks, total_stock, ...dataToSubmit } = formData;
        const dataToSave = {
            ...dataToSubmit,
            unit_id: formData.unit_id ? parseInt(formData.unit_id) : null,
        };
        if (product) {
            await api.update('products', product.product_id, dataToSave);
        } else {
            await api.create('products', dataToSave);
        }
        onSave();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{product ? 'Редагувати' : 'Додати'} товар</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Назва" required className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Опис" className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                    <div className="flex gap-4">
                        <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Ціна" required min="0" step="0.01" className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                        <select name="unit_id" value={formData.unit_id} onChange={handleChange} className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="">-- Одиниця --</option>
                            {units.map(u => <option key={u.unit_id} value={u.unit_id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Скасувати</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Зберегти</button>
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
        await api.setProductStocks(product.product_id, stocksToUpdate);
        onSave();
    };

    return (
         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative p-5 border w-full max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Керування залишками: {product.name}</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {warehouses.map(w => (
                         <div key={w.warehouse_id} className="flex items-center justify-between">
                            <div>
                                <label className="font-medium text-gray-800 dark:text-gray-200">{w.name}</label>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{w.location}</p>
                            </div>
                            <input
                                type="number"
                                value={stockLevels[w.warehouse_id] || 0}
                                onChange={(e) => handleStockChange(w.warehouse_id, e.target.value)}
                                min="0"
                                className="w-32 px-3 py-2 text-right text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    ))}
                </form>
                 <div className="flex justify-end space-x-2 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Скасувати</button>
                    <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Зберегти</button>
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
                api.getAll<Product>('products'),
                api.getAll<Unit>('units'),
                api.getAll<Warehouse>('warehouses'),
            ]);
            setProducts(productsData);
            setUnits(unitsData);
            setWarehouses(warehousesData);
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
            await api.delete('products', id);
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
            
             <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="flex items-center">
                    <FunnelIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                    <input
                        type="text"
                        placeholder="Пошук за назвою..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Назва</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Опис</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ціна</th>
                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Од.</th>
                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Залишок</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Дії</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-4">Завантаження...</td></tr>
                        ) : (
                            filteredProducts.map((p) => (
                                <tr key={p.product_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{p.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 max-w-sm truncate">{p.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.unit?.name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-200">{p.total_stock || 0}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleManageStock(p)} title="Керувати залишками" className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"><CubeIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleEdit(p)} title="Редагувати" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(p.product_id)} title="Видалити" className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))
                        )}
                        {!loading && filteredProducts.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-4 text-gray-500 dark:text-gray-400">Немає товарів, що відповідають пошуку.</td></tr>
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
