
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ServicesService } from '../src/services/apiService';
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
            await ServicesService.update(service.service_id, formData as any);
        } else {
            await ServicesService.create(formData as any);
        }
        onSave();
    };

    return (
        <div className="fixed inset-0 bg-[var(--modal-backdrop-bg)] backdrop-blur-md overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="modal-animate relative p-6 border w-full max-w-md shadow-lg rounded-2xl glass-pane">
                <h3 className="text-lg font-medium leading-6 text-[var(--text-primary)]">{service ? 'Редагувати' : 'Додати'} послугу</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Назва" required className="w-full px-3 py-2 rounded-md focus:outline-none glass-input"/>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Опис" className="w-full px-3 py-2 rounded-md focus:outline-none glass-input"></textarea>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Ціна" required min="0" step="0.01" className="w-full px-3 py-2 rounded-md focus:outline-none glass-input"/>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-white/10 text-[var(--text-primary)] rounded-md hover:bg-white/20">Скасувати</button>
                        <button type="submit" className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-md hover:bg-[var(--brand-bg-hover)]">Зберегти</button>
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
            const data = await ServicesService.getAll();
            setServices((data as any).data);
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
            await ServicesService.delete(id);
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
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Дії</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--table-divide-color)]">
                        {loading ? (
                            <tr><td colSpan={4} className="text-center py-4 text-[var(--text-secondary)]">Завантаження...</td></tr>
                        ) : (
                            filteredServices.map((s) => (
                                <tr key={s.service_id} className="hover:bg-[var(--table-row-hover-bg)] transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">{s.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)] max-w-sm truncate">{s.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{Number(s.price).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleEdit(s)} className="text-indigo-400 hover:text-indigo-300"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(s.service_id)} className="text-red-400 hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))
                        )}
                        {!loading && filteredServices.length === 0 && (
                            <tr><td colSpan={4} className="text-center py-4 text-[var(--text-secondary)]">Немає послуг, що відповідають пошуку.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <ServiceForm service={selectedService} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default Services;
