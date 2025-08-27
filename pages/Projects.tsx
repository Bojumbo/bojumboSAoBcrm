
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Project, Manager, Counterparty, ProjectStatusType } from '../types';
import PageHeader from '../components/PageHeader';
import { PencilIcon, TrashIcon } from '../components/Icons';

const ProjectForm: React.FC<{
    project?: Project | null;
    onSave: () => void;
    onCancel: () => void;
    managers: Manager[];
    counterparties: Counterparty[];
    projectStatuses: ProjectStatusType[];
}> = ({ project, onSave, onCancel, managers, counterparties, projectStatuses }) => {
    const [formData, setFormData] = useState({
        name: '',
        status: projectStatuses[0]?.name || '',
        forecast_amount: 0,
        ...project,
        // FIX: Removed duplicate `responsible_manager_id` and `counterparty_id` properties. The versions below handle both create and edit cases correctly.
        responsible_manager_id: project?.responsible_manager_id?.toString() || '',
        counterparty_id: project?.counterparty_id?.toString() || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'forecast_amount' ? parseFloat(value) : value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            responsible_manager_id: formData.responsible_manager_id ? parseInt(formData.responsible_manager_id) : null,
            counterparty_id: formData.counterparty_id ? parseInt(formData.counterparty_id) : null,
            forecast_amount: Number(formData.forecast_amount) || 0,
        };
        if (project) {
            await api.update('projects', project.project_id, dataToSave);
        } else {
            await api.create('projects', dataToSave);
        }
        onSave();
    };
    
    const baseInputClasses = "w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{project ? 'Редагувати' : 'Додати'} проект</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Назва проекту" required className={baseInputClasses}/>
                    <input type="number" name="forecast_amount" value={formData.forecast_amount} onChange={handleChange} placeholder="Прогнозована сума" required min="0" step="0.01" className={baseInputClasses}/>
                    <select name="counterparty_id" value={formData.counterparty_id} onChange={handleChange} className={baseInputClasses}>
                        <option value="">-- Контрагент --</option>
                        {counterparties.map(c => <option key={c.counterparty_id} value={c.counterparty_id}>{c.name}</option>)}
                    </select>
                    <select name="responsible_manager_id" value={formData.responsible_manager_id} onChange={handleChange} className={baseInputClasses}>
                        <option value="">-- Відповідальний менеджер --</option>
                        {managers.map(m => <option key={m.manager_id} value={m.manager_id}>{m.first_name} {m.last_name}</option>)}
                    </select>
                     <select name="status" value={formData.status} onChange={handleChange} required className={baseInputClasses}>
                        {projectStatuses.map(s => <option key={s.project_status_id} value={s.name}>{s.name}</option>)}
                    </select>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Скасувати</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Зберегти</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
    const [projectStatuses, setProjectStatuses] = useState<ProjectStatusType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [pData, mData, cData, psData] = await Promise.all([
                api.getAll<Project>('projects'),
                api.getAll<Manager>('managers'),
                api.getAll<Counterparty>('counterparties'),
                api.getAll<ProjectStatusType>('projectStatuses')
            ]);
            const projectsWithDetails = pData.map(p => ({
                ...p,
                responsible_manager: mData.find(m => m.manager_id === p.responsible_manager_id),
                counterparty: cData.find(c => c.counterparty_id === p.counterparty_id)
            }));
            setProjects(projectsWithDetails);
            setManagers(mData);
            setCounterparties(cData);
            setProjectStatuses(psData);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAdd = () => {
        setSelectedProject(null);
        setIsModalOpen(true);
    };

    const handleEdit = (project: Project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Ви впевнені, що хочете видалити цей проект? Усі пов\'язані підпроекти та завдання також будуть видалені.')) {
            await api.delete('projects', id);
            fetchData();
        }
    };

    const handleSave = () => {
        setIsModalOpen(false);
        fetchData();
    };

    return (
        <div>
            <PageHeader title="Проекти" buttonLabel="Додати проект" onButtonClick={handleAdd} />
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Назва проекту</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Контрагент</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Відповідальний</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Статус</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Дії</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-4">Завантаження...</td></tr>
                        ) : (
                            projects.map((p) => (
                                <tr key={p.project_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{p.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.counterparty?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.responsible_manager ? `${p.responsible_manager.first_name} ${p.responsible_manager.last_name}` : 'N/A'}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <Link to={`/projects/${p.project_id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Деталі</Link>
                                        <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(p.project_id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
             {isModalOpen && (
                <ProjectForm
                    project={selectedProject}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                    managers={managers}
                    counterparties={counterparties}
                    projectStatuses={projectStatuses}
                />
            )}
        </div>
    );
};

export default Projects;