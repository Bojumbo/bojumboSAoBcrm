
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Project } from '../types';
import { BriefcaseIcon, UsersIcon, BuildingOfficeIcon } from '../components/Icons';

const InfoCard: React.FC<{title: string; value: string | undefined; icon: React.ElementType}> = ({ title, value, icon: Icon }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
        <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/50 rounded-md p-3">
                <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="ml-4 min-w-0">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">{value || 'Не вказано'}</p>
            </div>
        </div>
    </div>
);

const ProjectDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProject = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await api.getById<Project>('projects', parseInt(id));
            setProject(data);
        } catch (error) {
            console.error("Failed to fetch project details", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    if (loading) {
        return <div className="text-center py-10">Завантаження деталей проекту...</div>;
    }

    if (!project) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold mb-4">Проект не знайдено</h2>
                <Link to="/projects" className="text-indigo-600 hover:underline">Повернутися до списку проектів</Link>
            </div>
        );
    }
    
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white break-words">{project.name}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <InfoCard title="Проект" value={project.name} icon={BriefcaseIcon}/>
                <InfoCard title="Контрагент" value={project.counterparty?.name} icon={BuildingOfficeIcon}/>
                <InfoCard title="Відповідальний менеджер" value={project.responsible_manager ? `${project.responsible_manager.first_name} ${project.responsible_manager.last_name}` : undefined} icon={UsersIcon}/>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Підпроекти</h2>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {project.subprojects && project.subprojects.length > 0 ? (
                            project.subprojects.map(sp => (
                                <li key={sp.subproject_id} className="py-3 text-gray-700 dark:text-gray-300">{sp.name}</li>
                            ))
                        ) : (
                            <li className="py-3 text-gray-500 dark:text-gray-400">Немає підпроектів.</li>
                        )}
                    </ul>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Завдання</h2>
                     <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {project.tasks && project.tasks.length > 0 ? (
                            project.tasks.map(task => (
                                <li key={task.task_id} className="py-3">
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{task.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex flex-wrap gap-x-2">
                                        <span>До: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</span>
                                        <span className="hidden sm:inline">|</span>
                                        <span>Виконавець: {task.responsible_manager ? `${task.responsible_manager.first_name} ${task.responsible_manager.last_name}` : 'N/A'}</span>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="py-3 text-gray-500 dark:text-gray-400">Немає завдань.</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
