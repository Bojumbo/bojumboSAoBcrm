  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
// ...existing code...
}
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { managerService } from '@/services/managerService';
import { subProjectFunnelService } from '@/services/subProjectFunnelService';
import { projectService } from '@/services/projectService';
import { SubProjectFormData, Manager, SubProjectFunnel, SubProjectFunnelStage, Project } from '@/types/projects';

interface CreateSubprojectFormProps {
  currentManagerId: number;
  onSubmit: (data: SubProjectFormData) => void;
  projects: Project[];
  subprojects: { subproject_id: number; name: string; project_id: number | null; parent_subproject_id: number | null }[];
}

export default function CreateSubprojectForm({ currentManagerId, onSubmit, projects, subprojects }: CreateSubprojectFormProps) {
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [showFunnelDropdown, setShowFunnelDropdown] = useState(false);
  const [showStageDropdown, setShowStageDropdown] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    cost: '',
    sub_project_funnel_id: undefined as number | undefined,
    sub_project_funnel_stage_id: undefined as number | undefined,
    main_responsible_manager_id: currentManagerId,
    secondary_responsible_managers: [] as { manager_id: number }[],
    project_id: null as number | null,
    parent_subproject_id: null as number | null,
    status: '',
  });
  const [managers, setManagers] = useState<Manager[]>([]);
  const [funnels, setFunnels] = useState<SubProjectFunnel[]>([]);
  const [stages, setStages] = useState<SubProjectFunnelStage[]>([]);
  const [searchManager, setSearchManager] = useState('');
  const [searchAdditionalManager, setSearchAdditionalManager] = useState('');
  const [showAdditionalManagersDropdown, setShowAdditionalManagersDropdown] = useState(false);
  const [searchProject, setSearchProject] = useState('');
  const [searchSubproject, setSearchSubproject] = useState('');

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
  }, [form.sub_project_funnel_id, funnels]);

  const handleChange = (field: keyof SubProjectFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleManagerChange = (managerId: number) => {
    if (managerId !== currentManagerId) {
      setForm(prev => ({
        ...prev,
        main_responsible_manager_id: managerId,
        secondary_responsible_managers: Array.from(new Set([...(prev.secondary_responsible_managers || []).map(obj => obj.manager_id), currentManagerId]))
          .map(id => ({ manager_id: id }))
      }));
    } else {
      setForm(prev => ({ ...prev, main_responsible_manager_id: managerId }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sub_project_funnel_stage_id) return;
    // Формуємо payload згідно з очікуваннями бекенду
    const payload: any = {
      name: form.name,
      description: form.description,
      cost: parseFloat(form.cost) || 0,
      project_id: form.project_id ?? null,
      parent_subproject_id: form.parent_subproject_id ?? null,
      sub_project_funnel_id: form.sub_project_funnel_id,
      sub_project_funnel_stage_id: form.sub_project_funnel_stage_id,
      main_responsible_manager_id: form.main_responsible_manager_id,
      status: form.status || undefined,
      secondary_responsible_managers: form.secondary_responsible_managers || [],
    };
    onSubmit(payload);
  };

  return (
    <Card className="max-w-xl w-full mx-auto">
      <CardContent className="p-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label>Назва підпроекту</Label>
            <Input value={form.name} onChange={e => handleChange('name', e.target.value)} required />
          </div>
          <div>
            <Label>Опис</Label>
            <Textarea value={form.description} onChange={e => handleChange('description', e.target.value)} />
          </div>
          <div className="relative">
            <Label>Відповідальний менеджер</Label>
            <button
              type="button"
              className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
              onClick={() => setShowManagerDropdown(v => !v)}
              tabIndex={0}
              onBlur={() => setShowManagerDropdown(false)}
            >
              <span>
                {managers.find(m => m.manager_id === form.main_responsible_manager_id)?.first_name || 'Оберіть менеджера'}
                {managers.find(m => m.manager_id === form.main_responsible_manager_id)?.last_name ? ' ' + managers.find(m => m.manager_id === form.main_responsible_manager_id)?.last_name : ''}
              </span>
              <svg className="ml-2 h-4 w-4 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
            </button>
            {showManagerDropdown && (
              <div className="absolute z-10 mt-2 w-full bg-white border rounded shadow-lg">
                <Input placeholder="Пошук..." value={searchManager} onChange={e => setSearchManager(e.target.value)} className="mb-2" />
                <ScrollArea className="max-h-48">
                  {managers.filter(m => `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchManager.toLowerCase())).map(m => (
                    <button
                      key={m.manager_id}
                      type="button"
                      className={`w-full text-left px-2 py-1 hover:bg-accent ${form.main_responsible_manager_id === m.manager_id ? 'bg-accent' : ''}`}
                      onClick={() => { handleManagerChange(m.manager_id); setShowManagerDropdown(false); }}
                    >
                      {m.first_name} {m.last_name}
                    </button>
                  ))}
                </ScrollArea>
              </div>
            )}
          </div>
          <div className="relative">
            <Label>Додаткові менеджери</Label>
            <Button type="button" variant="outline" className="w-full text-left" onClick={() => setShowAdditionalManagersDropdown(v => !v)}>
              {form.secondary_responsible_managers.length > 0
                ? `Обрано: ${managers.filter(m => form.secondary_responsible_managers.some(obj => obj.manager_id === m.manager_id)).map(m => m.first_name + ' ' + m.last_name).join(', ')}`
                : 'Оберіть додаткових менеджерів'}
            </Button>
            {showAdditionalManagersDropdown && (
              <div>
                <div className="absolute z-10 mt-2 w-full bg-white border rounded shadow-lg p-2">
                  <Input placeholder="Пошук..." value={searchAdditionalManager} onChange={e => setSearchAdditionalManager(e.target.value)} className="mb-2" />
                  <ScrollArea className="max-h-48">
                    {managers.filter(m => `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchAdditionalManager.toLowerCase())).map(m => (
                      <label key={m.manager_id} className="flex items-center gap-2 py-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.secondary_responsible_managers.some(obj => obj.manager_id === m.manager_id)}
                          onChange={() => handleAdditionalManagersChange(m.manager_id)}
                        />
                        <span>{m.first_name} {m.last_name}</span>
                      </label>
                    ))}
                  </ScrollArea>
                  <div className="pt-2 text-right">
                    <Button type="button" size="sm" onClick={() => setShowAdditionalManagersDropdown(false)}>Готово</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div>
            <Label>Прогнозована сума</Label>
            <Input type="number" value={form.cost} onChange={e => handleChange('cost', e.target.value)} />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Label>Воронка</Label>
              <div>
                <button
                  type="button"
                  className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                  onClick={() => setShowFunnelDropdown(v => !v)}
                  tabIndex={0}
                  onBlur={() => setShowFunnelDropdown(false)}
                >
                  <span>
                    {funnels.find(f => f.sub_project_funnel_id === form.sub_project_funnel_id)?.name || 'Оберіть воронку'}
                  </span>
                  <svg className="ml-2 h-4 w-4 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
                </button>
                {showFunnelDropdown && (
                  <div className="absolute z-10 mt-2 w-full bg-white border rounded shadow-lg">
                    <ScrollArea className="max-h-48">
                      {funnels.filter(f => f.name.toLowerCase().includes(searchManager.toLowerCase())).map(funnel => (
                        <button
                          key={funnel.sub_project_funnel_id}
                          type="button"
                          className={`w-full text-left px-2 py-1 hover:bg-accent ${form.sub_project_funnel_id === funnel.sub_project_funnel_id ? 'bg-accent' : ''}`}
                          onClick={() => { handleChange('sub_project_funnel_id', funnel.sub_project_funnel_id); setShowFunnelDropdown(false); }}
                        >
                          {funnel.name}
                        </button>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
}
