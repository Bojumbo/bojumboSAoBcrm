
import React, { useEffect, useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { managerService } from '../services/managerService';
import { subProjectFunnelService } from '../services/subProjectFunnelService';
import { SubProjectFormData, Manager, SubProjectFunnel, SubProjectFunnelStage, Project, Subproject } from '../types/projects';
import { CustomSelect } from './CustomSelect';
import { useClickOutside } from '../hooks/useClickOutside';
import { HierarchicalSelect } from './ui/HierarchicalSelect';


interface CreateSubprojectFormProps {
  currentManagerId: number;
  onSubmit: (data: SubProjectFormData) => void;
  projects: Project[];
  subprojects: Subproject[];
}

const CreateSubprojectForm = ({ currentManagerId, onSubmit, projects, subprojects }: CreateSubprojectFormProps) => {
  const [form, setForm] = useState<SubProjectFormData>({
    name: '',
    description: '',
    cost: '',
    sub_project_funnel_id: undefined,
    sub_project_funnel_stage_id: undefined,
    main_responsible_manager_id: currentManagerId,
    secondary_responsible_managers: [],
    project_id: null,
    parent_subproject_id: null,
    status: '',
  });
  
  const [managers, setManagers] = useState<Manager[]>([]);
  const [funnels, setFunnels] = useState<SubProjectFunnel[]>([]);
  const [stages, setStages] = useState<SubProjectFunnelStage[]>([]);

  const [searchAdditionalManager, setSearchAdditionalManager] = useState('');
  const [showAdditionalManagersDropdown, setShowAdditionalManagersDropdown] = useState(false);

  const additionalManagerDropdownRef = useClickOutside<HTMLDivElement>(() => {
      setShowAdditionalManagersDropdown(false);
  });

  useEffect(() => {
    managerService.getAll().then(setManagers);
    subProjectFunnelService.getAll().then(setFunnels);
  }, []);

  useEffect(() => {
    if (form.sub_project_funnel_id) {
      const funnel = funnels.find(f => f.sub_project_funnel_id === form.sub_project_funnel_id);
      setStages(funnel ? funnel.stages : []);
    } else {
      setStages([]);
    }
    // Reset stage when funnel changes
    setForm(prev => ({ ...prev, sub_project_funnel_stage_id: undefined }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.sub_project_funnel_id, funnels]);

  const handleChange = (field: keyof SubProjectFormData, value: string | number | { manager_id: number }[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleManagerChange = (managerId: number | null) => {
    const newManagerId = managerId ?? currentManagerId;
    if (newManagerId !== currentManagerId) {
      setForm(prev => ({
        ...prev,
        main_responsible_manager_id: newManagerId,
        secondary_responsible_managers: Array.from(new Set([...prev.secondary_responsible_managers.map(obj => obj.manager_id), currentManagerId]))
          .filter(id => id !== newManagerId)
          .map(id => ({ manager_id: id }))
      }));
    } else {
      setForm(prev => ({ ...prev, main_responsible_manager_id: newManagerId }));
    }
  };

  const handleAdditionalManagersChange = (managerId: number) => {
    setForm(prev => {
      const exists = prev.secondary_responsible_managers.some(obj => obj.manager_id === managerId);
      let updated: { manager_id: number }[];
      if (exists) {
        updated = prev.secondary_responsible_managers.filter(obj => obj.manager_id !== managerId);
      } else {
        updated = [...prev.secondary_responsible_managers, { manager_id: managerId }];
      }
      return { ...prev, secondary_responsible_managers: updated };
    });
  };

  const handleParentChange = (selection: { type: 'project' | 'subproject', id: number } | null) => {
    if (!selection) {
      setForm(prev => ({ ...prev, project_id: null, parent_subproject_id: null }));
      return;
    }
  
    if (selection.type === 'project') {
      setForm(prev => ({ ...prev, project_id: selection.id, parent_subproject_id: null }));
    } else { // 'subproject'
      let current = subprojects.find(sp => sp.subproject_id === selection.id);
      let rootProjectId = null;

      // Traverse up the hierarchy to find the root project_id
      while (current) {
        if (current.project_id) {
          rootProjectId = current.project_id;
          break;
        }
        if (current.parent_subproject_id) {
          current = subprojects.find(sp => sp.subproject_id === current!.parent_subproject_id);
        } else {
          break; // Reached the top of this subproject branch without finding a project
        }
      }

      if (rootProjectId) {
         setForm(prev => ({
           ...prev,
           project_id: rootProjectId,
           parent_subproject_id: selection.id
         }));
      } else {
          console.error(`Could not determine project for selected subproject ID: ${selection.id}`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sub_project_funnel_stage_id) {
        alert("Будь ласка, заповніть обов'язкові поля: Назва та Етап воронки.");
        return;
    }
    
    const payload: SubProjectFormData = {
      ...form,
      cost: form.cost ? parseFloat(form.cost).toString() : '0',
    };
    onSubmit(payload);
  };
  
  const managerOptions = useMemo(() => 
    managers.map(m => ({ value: m.manager_id, label: `${m.first_name} ${m.last_name}` })), [managers]);
  
  const funnelOptions = useMemo(() =>
    funnels.map(f => ({ value: f.sub_project_funnel_id, label: f.name })), [funnels]);
    
  const stageOptions = useMemo(() => 
    stages.map(s => ({ value: s.sub_project_funnel_stage_id, label: s.name })), [stages]);

  const availableAdditionalManagers = useMemo(() => 
    managers.filter(m => m.manager_id !== form.main_responsible_manager_id),
    [managers, form.main_responsible_manager_id]
  );
  
  const filteredAdditionalManagers = useMemo(() =>
    availableAdditionalManagers.filter(m => `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchAdditionalManager.toLowerCase())),
    [availableAdditionalManagers, searchAdditionalManager]
  );
  
  const selectedAdditionalManagersNames = useMemo(() =>
    managers
      .filter(m => form.secondary_responsible_managers.some(obj => obj.manager_id === m.manager_id))
      .map(m => `${m.first_name} ${m.last_name}`)
      .join(', '),
    [managers, form.secondary_responsible_managers]
  );
  
  const selectedParentValue = useMemo(() => {
    if (form.parent_subproject_id) {
      return { type: 'subproject' as const, id: form.parent_subproject_id };
    }
    if (form.project_id) {
      return { type: 'project' as const, id: form.project_id };
    }
    return null;
  }, [form.project_id, form.parent_subproject_id]);

  return (
    <Card className="max-w-3xl w-full mx-auto">
  <CardContent className="p-6 pt-5 pb-5 flex flex-col overflow-y-auto max-h-[80vh] md:max-h-[calc(100vh-64px)] box-border">
  <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="subprojectName">Назва підпроекту <span className="text-red-500">*</span></Label>
            <Input id="subprojectName" value={form.name} onChange={e => handleChange('name', e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="description">Опис</Label>
            <Textarea id="description" value={form.description} onChange={e => handleChange('description', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Відповідальний менеджер</Label>
              <CustomSelect
                options={managerOptions}
                value={form.main_responsible_manager_id}
                onChange={handleManagerChange}
                placeholder="Оберіть менеджера"
              />
            </div>
            <div className="relative" ref={additionalManagerDropdownRef}>
                <Label>Додаткові менеджери</Label>
                <button type="button" className="w-full text-left flex h-10 items-center justify-between rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:ring-offset-gray-900 truncate" onClick={() => setShowAdditionalManagersDropdown(v => !v)}>
                  <span className={selectedAdditionalManagersNames ? '' : 'text-gray-500 dark:text-gray-400'}>
                    {selectedAdditionalManagersNames || 'Оберіть менеджерів'}
                  </span>
                </button>
                {showAdditionalManagersDropdown && (
                    <div className="absolute z-20 mt-2 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg p-2">
                      <Input placeholder="Пошук..." value={searchAdditionalManager} onChange={e => setSearchAdditionalManager(e.target.value)} className="mb-2" />
                      <ScrollArea className="max-h-48">
                        {filteredAdditionalManagers.map(m => (
                          <label key={m.manager_id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={form.secondary_responsible_managers.some(obj => obj.manager_id === m.manager_id)}
                              onChange={() => handleAdditionalManagersChange(m.manager_id)}
                            />
                            <span>{m.first_name} {m.last_name}</span>
                          </label>
                        ))}
                      </ScrollArea>
                    </div>
                )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="cost">Прогнозована сума</Label>
            <Input id="cost" type="number" value={form.cost} onChange={e => handleChange('cost', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <Label>Воронка <span className="text-red-500">*</span></Label>
                <CustomSelect
                    options={funnelOptions}
                    value={form.sub_project_funnel_id}
                    onChange={(value) => handleChange('sub_project_funnel_id', value)}
                    placeholder="Оберіть воронку"
                />
            </div>
            <div>
                <Label>Етап <span className="text-red-500">*</span></Label>
                <CustomSelect
                    options={stageOptions}
                    value={form.sub_project_funnel_stage_id}
                    onChange={(value) => handleChange('sub_project_funnel_stage_id', value)}
                    placeholder="Оберіть етап"
                    disabled={!form.sub_project_funnel_id}
                />
            </div>
          </div>

          <div>
            <Label>Проект / Батьківський підпроект</Label>
            <HierarchicalSelect
              projects={projects}
              subprojects={subprojects}
              value={selectedParentValue}
              onChange={handleParentChange}
              placeholder="Оберіть прив'язку"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg">Створити підпроект</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
export default CreateSubprojectForm;
