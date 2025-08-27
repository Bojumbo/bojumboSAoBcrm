
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { Service } from '../types';
import PageHeader from '../components/PageHeader';
import { PencilIcon, TrashIcon, FunnelIcon } from '../components/Icons';

const ServiceForm: React.FC<{ service?: Service | null; onSave: () => void; onCancel: () => void; }> = ({ service, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        ...service
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'price' ? parseFloat(value) : value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (service) {
            await api.update('services', service.service_id, formData);
        } else {
            await api.create('services', formData);
        }
        onSave();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{service ? 'Редагувати' : 'Додати'} послугу</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Назва" required className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Опис" className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Ціна" required min="0" step="0.01" className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Скасувати</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Зберегти</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Services: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchServices = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getAll<Service>('services');
            setServices(data);
        } catch (error) {
            console.error("Failed to fetch services", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const filteredServices = useMemo(() => {
        return services.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [services, searchTerm]);
    
    const handleAdd = () => {
        setSelectedService(null);
        setIsModalOpen(true);
    };

    const handleEdit = (service: Service) => {
        setSelectedService(service);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Ви впевнені, що хочете видалити цю послугу?')) {
            await api.delete('services', id);
            fetchServices();
        }
    };

    const handleSave = () => {
        setIsModalOpen(false);
        fetchServices();
    };

    return (
        <div>
            <PageHeader title="Послуги" buttonLabel="Додати послугу" onButtonClick={handleAdd} />
            
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
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Дії</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan={4} className="text-center py-4">Завантаження...</td></tr>
                        ) : (
                            filteredServices.map((s) => (
                                <tr key={s.service_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{s.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 max-w-sm truncate">{s.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{s.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleEdit(s)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(s.service_id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))
                        )}
                        {!loading && filteredServices.length === 0 && (
                            <tr><td colSpan={4} className="text-center py-4 text-gray-500 dark:text-gray-400">Немає послуг, що відповідають пошуку.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <ServiceForm service={selectedService} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default Services;
