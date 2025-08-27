
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { SubProject, Manager, Project, SubProjectStatusType } from '../types';
import PageHeader from '../components/PageHeader';
import { FunnelIcon, BanknotesIcon } from '../components/Icons';

const SubProjectForm: React.FC<{
    subproject?: SubProject | null;
    onSave: () => void;
    onCancel: () => void;
    projects: Project[];
    statuses: SubProjectStatusType[];
}> = ({ subproject, onSave, onCancel, projects, statuses }) => {
    const [formData, setFormData] = useState({
        name: subproject?.name || '',
        cost: subproject?.cost || 0,
        status: subproject?.status || (statuses.length > 0 ? statuses[0].name : ''),
        project_id: subproject?.project_id?.toString() || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'cost' ? parseFloat(value) : value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            project_id: parseInt(formData.project_id),
        };
        if (subproject) {
            await api.update('subprojects', subproject.subproject_id, dataToSave);
        } else {
            await api.create('subprojects', dataToSave);
        }
        onSave();
    };

    const baseInputClasses = "w-full px-3 py-2 rounded-md focus:outline-none glass-input";

    return (
        <div className="fixed inset-0 bg-[var(--modal-backdrop-bg)] backdrop-blur-md overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="modal-animate relative p-6 border w-full max-w-lg shadow-lg rounded-2xl glass-pane">
                <h3 className="text-lg font-medium leading-6 text-[var(--text-primary)] mb-4">{subproject ? 'Редагувати' : 'Додати'} підпроект</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Назва підпроекту" required className={baseInputClasses}/>
                    <input type="number" name="cost" value={formData.cost} onChange={handleChange} placeholder="Вартість" required min="0" step="0.01" className={baseInputClasses}/>
                    <select name="project_id" value={formData.project_id} onChange={handleChange} required className={baseInputClasses}>
                        <option value="" disabled>-- Оберіть головний проект --</option>
                        {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.name}</option>)}
                    </select>
                    <select name="status" value={formData.status} onChange={handleChange} required className={baseInputClasses}>
                        {statuses.map(s => <option key={s.sub_project_status_id} value={s.name}>{s.name}</option>)}
                    </select>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-white/10 text-[var(--text-primary)] rounded-md hover:bg-white/20">Скасувати</button>
                        <button type="submit" className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-md hover:bg-[var(--brand-bg-hover)]">Зберегти</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const SubProjectCard: React.FC<{ subproject: SubProject }> = ({ subproject }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("subprojectId", subproject.subproject_id.toString());
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="glass-pane rounded-lg mb-4 border-l-4 border-blue-400 cursor-grab active:cursor-grabbing group transform hover:-translate-y-1 transition-transform duration-200"
        >
            <Link to={`/subprojects/${subproject.subproject_id}`} className="block p-4">
                <p className="font-semibold text-[var(--text-primary)] break-words group-hover:text-blue-300">{subproject.name}</p>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                    Проект: {subproject.project?.name || 'N/A'}
                </p>
                <div className="flex justify-between items-center mt-3">
                     <p className="text-xs text-[var(--text-muted)]">
                        {subproject.project?.main_responsible_manager ? `${subproject.project.main_responsible_manager.first_name.charAt(0)}. ${subproject.project.main_responsible_manager.last_name}` : 'N/A'}
                    </p>
                    <div className="flex items-center text-sm font-bold text-green-400">
                        <BanknotesIcon className="h-4 w-4 mr-1"/>
                        <span>{(subproject.cost || 0).toLocaleString('uk-UA')}</span>
                    </div>
                </div>
            </Link>
        </div>
    );
};

const SubProjects: React.FC = () => {
    const [subprojects, setSubprojects] = useState<SubProject[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [statuses, setStatuses] = useState<SubProjectStatusType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubProject, setSelectedSubProject] = useState<SubProject | null>(null);
    const [filters, setFilters] = useState({
        project_id: '',
        responsible_manager_id: '',
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [spData, pData, mData, sData] = await Promise.all([
                api.getAll<SubProject>('subprojects'),
                api.getAll<Project>('projects'),
                api.getAll<Manager>('managers'),
                api.getAll<SubProjectStatusType>('subProjectStatuses'),
            ]);
            setSubprojects(spData);
            setProjects(pData);
            setManagers(mData);
            setStatuses(sData);
        } catch (error) {
            console.error("Failed to fetch subprojects data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredSubprojects = useMemo(() => {
        return subprojects.filter(sp => {
            const projectMatch = filters.project_id ? sp.project_id.toString() === filters.project_id : true;
            const managerMatch = filters.responsible_manager_id ? sp.project?.main_responsible_manager_id?.toString() === filters.responsible_manager_id : true;
            return projectMatch && managerMatch;
        });
    }, [subprojects, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const resetFilters = () => {
        setFilters({ project_id: '', responsible_manager_id: '' });
    };

    const handleAdd = () => {
        setSelectedSubProject(null);
        setIsModalOpen(true);
    };
    
    const handleSave = () => {
        setIsModalOpen(false);
        fetchData();
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, statusName: string) => {
        e.preventDefault();
        const subprojectId = parseInt(e.dataTransfer.getData("subprojectId"));
        
        const subprojectToMove = subprojects.find(sp => sp.subproject_id === subprojectId);
        if (!subprojectToMove || subprojectToMove.status === statusName) {
            return;
        }
        
        const updatedSubprojects = subprojects.map(sp =>
            sp.subproject_id === subprojectId ? { ...sp, status: statusName } : sp
        );
        setSubprojects(updatedSubprojects);

        try {
            await api.update('subprojects', subprojectId, { status: statusName });
        } catch (error) {
            console.error("Failed to update subproject status", error);
            setSubprojects(subprojects);
            alert("Не вдалося оновити статус підпроекту.");
        }
    };

    const baseInputClasses = "w-full px-3 py-2 text-sm rounded-md focus:outline-none glass-input";
    
    if (loading) {
        return <div>Завантаження...</div>
    }

    return (
        <div className="flex flex-col h-full">
            <PageHeader title="Підпроекти" buttonLabel="Додати підпроект" onButtonClick={handleAdd} />
            
            <div className="mb-6 p-4 rounded-xl glass-pane flex-shrink-0">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <select name="project_id" value={filters.project_id} onChange={handleFilterChange} className={baseInputClasses}>
                        <option value="">Всі проекти</option>
                        {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.name}</option>)}
                    </select>
                    <select name="responsible_manager_id" value={filters.responsible_manager_id} onChange={handleFilterChange} className={baseInputClasses}>
                        <option value="">Всі менеджери</option>
                        {managers.map(m => <option key={m.manager_id} value={m.manager_id}>{m.first_name} {m.last_name}</option>)}
                    </select>
                     <div className="flex justify-end items-center">
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-white/10 border border-transparent rounded-md hover:bg-white/20"
                        >
                            Скинути фільтри
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-grow min-h-0 overflow-x-auto pb-4">
                <div className="flex space-x-4 h-full">
                    {statuses.map(status => {
                        const subprojectsInStatus = filteredSubprojects.filter(sp => sp.status === status.name);
                        const statusTotalAmount = subprojectsInStatus.reduce((sum, sp) => sum + sp.cost, 0);

                        return (
                            <div
                                key={status.sub_project_status_id}
                                className="w-80 bg-white/5 backdrop-blur-sm rounded-lg flex flex-col flex-shrink-0"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, status.name)}
                            >
                                <div className="p-3 font-semibold text-[var(--text-primary)] bg-[var(--glass-bg)] border-b border-[var(--glass-border)] rounded-t-lg shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm uppercase tracking-wider">{status.name}</h3>
                                        <span className="text-xs font-bold text-[var(--text-secondary)] bg-white/10 px-2 py-1 rounded-full">{subprojectsInStatus.length}</span>
                                    </div>
                                    <p className="text-xs text-green-400 font-bold mt-1">
                                        {statusTotalAmount.toLocaleString('uk-UA')} грн
                                    </p>
                                </div>
                                <div className="p-2 flex-grow overflow-y-auto">
                                    {subprojectsInStatus.map(sp => (
                                        <SubProjectCard key={sp.subproject_id} subproject={sp} />
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

             {isModalOpen && (
                <SubProjectForm
                    subproject={selectedSubProject}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                    projects={projects}
                    statuses={statuses}
                />
            )}
        </div>
    );
};

export default SubProjects;
