
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Project, Manager, Counterparty } from '../types';
import PageHeader from '../components/PageHeader';

const Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const [pData, mData, cData] = await Promise.all([
                api.getAll<Project>('projects'),
                api.getAll<Manager>('managers'),
                api.getAll<Counterparty>('counterparties')
            ]);
            const projectsWithDetails = pData.map(p => ({
                ...p,
                responsible_manager: mData.find(m => m.manager_id === p.responsible_manager_id),
                counterparty: cData.find(c => c.counterparty_id === p.counterparty_id)
            }));
            setProjects(projectsWithDetails);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);
    
    // Modal for creation/editing would be here, similar to other pages.

    return (
        <div>
            <PageHeader title="Проекти" buttonLabel="Додати проект" onButtonClick={() => alert('Форма створення проекту буде тут')} />
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Назва проекту</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Контрагент</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Відповідальний</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Переглянути</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan={4} className="text-center py-4">Завантаження...</td></tr>
                        ) : (
                            projects.map((p) => (
                                <tr key={p.project_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{p.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.counterparty?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.responsible_manager ? `${p.responsible_manager.first_name} ${p.responsible_manager.last_name}` : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/projects/${p.project_id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Деталі</Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Projects;
