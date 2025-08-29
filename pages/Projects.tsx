
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProjectsService, ManagersService, CounterpartiesService, FunnelsService, FunnelStagesService } from '../src/services/apiService';
import { Project, Manager, Counterparty, Funnel, FunnelStage } from '../types';
import PageHeader from '../components/PageHeader';
import { TrashIcon, FunnelIcon, BanknotesIcon } from '../components/Icons';
import { usePaginatedApi } from '../src/hooks/useApi';
import { ApiErrorDisplay } from '../src/components/ApiErrorDisplay';

const ProjectForm: React.FC<{
    project?: Project | null;
    onSave: () => void;
    onCancel: () => void;
    managers: Manager[];
    counterparties: Counterparty[];
    funnels: Funnel[];
    funnelStages: FunnelStage[];
}> = ({ project, onSave, onCancel, managers, counterparties, funnels, funnelStages }) => {
    const [formData, setFormData] = useState({
        name: '',
        forecast_amount: 0,
        ...project,
        main_responsible_manager_id: project?.main_responsible_manager_id?.toString() || '',
        secondary_responsible_manager_ids: project?.secondary_responsible_manager_ids?.map(String) || [],
        counterparty_id: project?.counterparty_id?.toString() || '',
        funnel_id: project?.funnel_id?.toString() || (funnels[0]?.funnel_id.toString() ?? ''),
        funnel_stage_id: project?.funnel_stage_id?.toString() || '',
    });

    const availableStages = useMemo(() => {
        return funnelStages.filter(s => s.funnel_id.toString() === formData.funnel_id).sort((a, b) => a.order - b.order);
    }, [formData.funnel_id, funnelStages]);

    useEffect(() => {
        // If the project is new or the funnel is changed, set stage to the first available stage
        if (!project || (project && project.funnel_id?.toString() !== formData.funnel_id)) {
            const firstStageId = availableStages[0]?.funnel_stage_id.toString() || '';
            if (formData.funnel_stage_id !== firstStageId) {
                 setFormData(prev => ({ ...prev, funnel_stage_id: firstStageId }));
            }
        }
    }, [formData.funnel_id, availableStages, project]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'main_responsible_manager_id') {
             // Remove the new main manager from the secondary list if they are there
            const newSecondaryIds = formData.secondary_responsible_manager_ids.filter(id => id !== value);
            setFormData(prev => ({ ...prev, main_responsible_manager_id: value, secondary_responsible_manager_ids: newSecondaryIds }));
            return;
        }

        setFormData({ ...formData, [name]: name === 'forecast_amount' ? parseFloat(value) : value });
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        const currentIds = formData.secondary_responsible_manager_ids;
        let newIds;
        if (checked) {
            newIds = [...currentIds, value];
        } else {
            newIds = currentIds.filter(id => id !== value);
        }
        setFormData({ ...formData, secondary_responsible_manager_ids: newIds });
    };

    const availableSecondaryManagers = useMemo(() => {
        return managers.filter(m => m.manager_id.toString() !== formData.main_responsible_manager_id);
    }, [managers, formData.main_responsible_manager_id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            main_responsible_manager_id: formData.main_responsible_manager_id ? parseInt(formData.main_responsible_manager_id) : null,
            secondary_responsible_manager_ids: formData.secondary_responsible_manager_ids.map(id => parseInt(id)),
            counterparty_id: formData.counterparty_id ? parseInt(formData.counterparty_id) : null,
            funnel_id: formData.funnel_id ? parseInt(formData.funnel_id) : null,
            funnel_stage_id: formData.funnel_stage_id ? parseInt(formData.funnel_stage_id) : null,
            forecast_amount: Number(formData.forecast_amount) || 0,
        };
        if (project) {
            await ProjectsService.update(project.project_id, dataToSave);
        } else {
            await ProjectsService.create(dataToSave);
        }
        onSave();
    };
    
    const baseInputClasses = "w-full px-3 py-2 rounded-md focus:outline-none glass-input";

    return (
        <div className="fixed inset-0 bg-[var(--modal-backdrop-bg)] backdrop-blur-md overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="modal-animate relative p-6 border w-full max-w-lg shadow-lg rounded-2xl glass-pane">
                <h3 className="text-lg font-medium leading-6 text-[var(--text-primary)] mb-4">{project ? 'Редагувати' : 'Додати'} проект</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Назва проекту" required className={baseInputClasses}/>
                    <input type="number" name="forecast_amount" value={formData.forecast_amount} onChange={handleChange} placeholder="Прогнозована сума" required min="0" step="0.01" className={baseInputClasses}/>
                    <select name="counterparty_id" value={formData.counterparty_id} onChange={handleChange} className={baseInputClasses}>
                        <option value="">-- Контрагент --</option>
                        {counterparties.map(c => <option key={c.counterparty_id} value={c.counterparty_id}>{c.name}</option>)}
                    </select>
                    <label className="block text-sm font-medium text-[var(--text-secondary)]">Головний відповідальний</label>
                    <select name="main_responsible_manager_id" value={formData.main_responsible_manager_id} onChange={handleChange} className={baseInputClasses}>
                        <option value="">-- Не вибрано --</option>
                        {managers.map(m => <option key={m.manager_id} value={m.manager_id}>{m.first_name} {m.last_name}</option>)}
                    </select>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)]">Другорядні відповідальні</label>
                        <div className="mt-1 border border-[var(--input-border)] rounded-md p-2 h-24 overflow-y-auto space-y-1 bg-[var(--input-bg)]">
                            {availableSecondaryManagers.map(m => (
                                <div key={m.manager_id} className="flex items-center">
                                    <input
                                        id={`sec-manager-form-${m.manager_id}`}
                                        name="secondary_responsible_manager_ids"
                                        type="checkbox"
                                        value={m.manager_id.toString()}
                                        checked={formData.secondary_responsible_manager_ids.includes(m.manager_id.toString())}
                                        onChange={handleCheckboxChange}
                                        className="h-4 w-4 text-[var(--brand-primary)] bg-transparent border-[var(--input-border)] rounded focus:ring-[var(--brand-secondary)]"
                                    />
                                    <label htmlFor={`sec-manager-form-${m.manager_id}`} className="ml-2 text-sm text-[var(--text-primary)]">
                                        {m.first_name} {m.last_name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                     <div className="grid grid-cols-2 gap-4">
                        <select name="funnel_id" value={formData.funnel_id} onChange={handleChange} required className={baseInputClasses}>
                            {funnels.map(f => <option key={f.funnel_id} value={f.funnel_id}>{f.name}</option>)}
                        </select>
                        <select name="funnel_stage_id" value={formData.funnel_stage_id} onChange={handleChange} required className={baseInputClasses} disabled={availableStages.length === 0}>
                            {availableStages.map(s => <option key={s.funnel_stage_id} value={s.funnel_stage_id}>{s.name}</option>)}
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

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("projectId", project.project_id.toString());
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="glass-pane rounded-lg p-4 mb-4 border-l-4 border-[var(--brand-secondary)] cursor-grab active:cursor-grabbing transform hover:-translate-y-1 transition-transform duration-200"
        >
            <Link to={`/projects/${project.project_id}`} className="font-semibold text-[var(--text-primary)] hover:text-[var(--brand-secondary)] break-words">
                {project.name}
            </Link>
            <p className="text-sm text-[var(--text-secondary)] mt-2">{project.counterparty?.name || 'N/A'}</p>
            <div className="flex justify-between items-center mt-3">
                 <p className="text-xs text-[var(--text-muted)]">
                    {project.main_responsible_manager ? `${project.main_responsible_manager.first_name.charAt(0)}. ${project.main_responsible_manager.last_name}` : 'N/A'}
                </p>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center text-sm font-bold text-green-400">
                        <BanknotesIcon className="h-4 w-4 mr-1"/>
                        <span>{(project.forecast_amount || 0).toLocaleString('uk-UA')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
    const [funnels, setFunnels] = useState<Funnel[]>([]);
    const [funnelStages, setFunnelStages] = useState<FunnelStage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedFunnelId, setSelectedFunnelId] = useState<string>('');
    const [filters, setFilters] = useState({
        counterparty_id: '',
        responsible_manager_id: '',
    });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [pData, mData, cData, fData, fsData] = await Promise.all([
                ProjectsService.getAll(),
                ManagersService.getAll(),
                CounterpartiesService.getAll(),
                FunnelsService.getAll(),
                FunnelStagesService.getAll(),
            ]);
            setProjects(pData.data);
            setManagers(mData.data);
            setCounterparties(cData.data);
            setFunnels(fData.data);
            setFunnelStages(fsData.data);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Set default selected funnel to the first one when data loads
    useEffect(() => {
        if (!selectedFunnelId && funnels.length > 0) {
            setSelectedFunnelId(funnels[0].funnel_id.toString());
        }
    }, [funnels, selectedFunnelId]);

    const activeStages = useMemo(() => {
        return funnelStages.filter(s => s.funnel_id.toString() === selectedFunnelId).sort((a,b) => a.order - b.order);
    }, [selectedFunnelId, funnelStages]);

    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const funnelMatch = selectedFunnelId ? (p.funnel_id?.toString() === selectedFunnelId) : true;
            const counterpartyMatch = filters.counterparty_id ? p.counterparty_id?.toString() === filters.counterparty_id : true;
            const managerMatch = filters.responsible_manager_id ? p.main_responsible_manager_id?.toString() === filters.responsible_manager_id : true;
            return funnelMatch && counterpartyMatch && managerMatch;
        });
    }, [projects, filters, selectedFunnelId]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const resetFilters = () => {
        setFilters({ counterparty_id: '', responsible_manager_id: '' });
    };

    const handleAdd = () => {
        setSelectedProject(null);
        setIsModalOpen(true);
    };
    
    const handleSave = () => {
        setIsModalOpen(false);
        loadData();
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, stageId: number) => {
        e.preventDefault();
        const projectId = parseInt(e.dataTransfer.getData("projectId"));
        
        const projectToMove = projects.find(p => p.project_id === projectId);
        if (!projectToMove || projectToMove.funnel_stage_id === stageId) {
            return; // No change needed
        }
        
        // Optimistic UI update
        const updatedProjects = projects.map(p =>
            p.project_id === projectId ? { ...p, funnel_stage_id: stageId } : p
        );
        setProjects(updatedProjects);

        try {
            await ProjectsService.update(projectId, { funnel_stage_id: stageId });
        } catch (error) {
            console.error("Failed to update project stage", error);
            // Revert on failure
            setProjects(projects);
            alert("Не вдалося оновити етап проекту.");
        }
    };

    const baseInputClasses = "w-full px-3 py-2 text-sm rounded-md focus:outline-none glass-input";
    
    if (loading) {
        return <div>Завантаження...</div>
    }

    return (
        <div className="flex flex-col h-full">
            <PageHeader title="Проекти" buttonLabel="Додати проект" onButtonClick={handleAdd} />
            
            <div className="mb-6 p-4 glass-pane rounded-xl flex-shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                        <select
                            value={selectedFunnelId}
                            onChange={(e) => setSelectedFunnelId(e.target.value)}
                            className={baseInputClasses}
                        >
                            {funnels.map(f => <option key={f.funnel_id} value={f.funnel_id}>{f.name}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-3">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="flex items-center">
                                <FunnelIcon className="h-5 w-5 mr-2 text-[var(--text-secondary)]" />
                                <span className="text-sm font-medium mr-2 text-[var(--text-secondary)]">Фільтри:</span>
                            </div>
                            <select name="counterparty_id" value={filters.counterparty_id} onChange={handleFilterChange} className={baseInputClasses}>
                                <option value="">Всі контрагенти</option>
                                {counterparties.map(c => <option key={c.counterparty_id} value={c.counterparty_id}>{c.name}</option>)}
                            </select>
                            <select name="responsible_manager_id" value={filters.responsible_manager_id} onChange={handleFilterChange} className={baseInputClasses}>
                                <option value="">Всі менеджери</option>
                                {managers.map(m => <option key={m.manager_id} value={m.manager_id}>{m.first_name} {m.last_name}</option>)}
                            </select>
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

            <div className="flex-grow min-h-0 overflow-x-auto pb-4">
                <div className="flex space-x-4 h-full">
                    {activeStages.map(stage => {
                        const projectsInStage = filteredProjects.filter(p => p.funnel_stage_id === stage.funnel_stage_id);
                        const stageTotalAmount = projectsInStage.reduce((sum, p) => sum + p.forecast_amount, 0);

                        return (
                            <div
                                key={stage.funnel_stage_id}
                                className="w-80 bg-white/5 backdrop-blur-sm rounded-lg flex flex-col flex-shrink-0"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, stage.funnel_stage_id)}
                            >
                                <div className="p-3 font-semibold text-[var(--text-primary)] bg-[var(--glass-bg)] border-b border-[var(--glass-border)] rounded-t-lg shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm uppercase tracking-wider">{stage.name}</h3>
                                        <span className="text-xs font-bold text-[var(--text-secondary)] bg-white/10 px-2 py-1 rounded-full">{projectsInStage.length}</span>
                                    </div>
                                    <p className="text-xs text-green-400 font-bold mt-1">
                                        {stageTotalAmount.toLocaleString('uk-UA')} грн
                                    </p>
                                </div>
                                <div className="p-2 flex-grow overflow-y-auto">
                                    {projectsInStage.map(p => (
                                        <ProjectCard key={p.project_id} project={p} />
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

             {isModalOpen && (
                <ProjectForm
                    project={selectedProject}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                    managers={managers}
                    counterparties={counterparties}
                    funnels={funnels}
                    funnelStages={funnelStages}
                />
            )}
        </div>
    );
};

export default Projects;
