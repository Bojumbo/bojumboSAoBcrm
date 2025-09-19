import { DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import CreateSubprojectForm from './CreateSubprojectForm';
import { projectsAPI } from '@/lib/api';
import { SubProjectFunnel, SubProjectFunnelStage, SubProject } from '@/types/projects';
import { subprojectsAPI, subprojectFunnelsAPI } from '@/lib/api';
import SubprojectKanbanColumn from './SubprojectKanbanColumn';
import LoadingSpinner from './ui/loading-spinner';
import { Card, CardContent } from './ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';
import { RefreshCw, Plus } from 'lucide-react';

interface SubprojectsKanbanProps {
  onSubprojectClick?: (subproject: SubProject) => void;
  onCreateSubproject?: () => void;
}

export default function SubprojectsKanban({ 
  onSubprojectClick, 
  onCreateSubproject 
}: SubprojectsKanbanProps) {
  const [funnels, setFunnels] = useState<SubProjectFunnel[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<SubProjectFunnel | null>(null);
  const [subprojects, setSubprojects] = useState<SubProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<Array<{ project_id: number; name: string }>>([]);

  const loadFunnels = async () => {
    try {
      const response = await subprojectFunnelsAPI.getAll();
      if (response.success && response.data) {
        setFunnels(response.data);
        if (response.data.length > 0 && !selectedFunnel) {
          setSelectedFunnel(response.data[0]);
        }
      } else {
        setError(response.error || 'Помилка завантаження воронок');
      }
    } catch (err) {
      setError('Помилка завантаження воронок');
    }
  };

  const loadSubprojects = async () => {
    try {
      const response = await subprojectsAPI.getAll();
      if (response.success && response.data) {
        setSubprojects(response.data);
      } else {
        setError(response.error || 'Помилка завантаження підпроектів');
      }
    } catch (err) {
      setError('Помилка завантаження підпроектів');
    } finally {
      setLoading(false);
    }
  };

  const handleSubprojectDrop = async (subprojectId: number, stageId: number) => {
    try {
      // Знаходимо підпроект для передачі project_id/parent_subproject_id
      const subproject = subprojects.find(sp => sp.subproject_id === subprojectId);
      let payload: any = { sub_project_funnel_stage_id: stageId };
      if (subproject) {
        if (subproject.project_id) payload.project_id = subproject.project_id;
        if (subproject.parent_subproject_id) payload.parent_subproject_id = subproject.parent_subproject_id;
      }
      const response = await subprojectsAPI.updateStage(subprojectId, payload);
      if (response.success) {
        await loadSubprojects(); // Перезавантажуємо підпроекти
      } else {
        setError(response.error || 'Помилка оновлення етапу підпроекту');
      }
    } catch (err) {
      setError('Помилка оновлення етапу підпроекту');
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    Promise.all([loadFunnels(), loadSubprojects()]);
  };

  useEffect(() => {
    loadFunnels();
    // Завантажити всі проекти для вибору
    projectsAPI.getAll().then(res => {
      if (res.success && res.data) {
        setAvailableProjects(res.data.map((p: any) => ({ project_id: p.project_id, name: p.name })));
      }
    });
  }, []);

  useEffect(() => {
    if (funnels.length > 0) {
      loadSubprojects();
    }
  }, [funnels]);

  // Фільтруємо підпроекти по обраній воронці
  const filteredSubprojects = selectedFunnel 
    ? subprojects.filter(subproject => subproject.sub_project_funnel_id === selectedFunnel.sub_project_funnel_id)
    : [];

  // Групуємо підпроекти по етапах
  const subprojectsByStage = selectedFunnel ? selectedFunnel.stages.reduce((acc, stage) => {
    acc[stage.sub_project_funnel_stage_id] = filteredSubprojects.filter(
      subproject => subproject.sub_project_funnel_stage_id === stage.sub_project_funnel_stage_id
    );
    return acc;
  }, {} as Record<number, SubProject[]>) : {};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Спробувати знову
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Заголовок та керування */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Підпроекти</h1>
          {funnels.length > 1 && (
            <Select 
              value={selectedFunnel?.sub_project_funnel_id.toString()} 
              onValueChange={(value) => {
                const funnel = funnels.find(f => f.sub_project_funnel_id === parseInt(value));
                setSelectedFunnel(funnel || null);
              }}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Оберіть воронку" />
              </SelectTrigger>
              <SelectContent>
                {funnels.map((funnel) => (
                  <SelectItem key={funnel.sub_project_funnel_id} value={funnel.sub_project_funnel_id.toString()}>
                    {funnel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Оновити
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Новий підпроект
          </Button>
        </div>
      </div>

      {/* Канбан дошка */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {selectedFunnel ? (
          <div className="flex gap-4 h-full overflow-x-auto overflow-y-hidden">
            {selectedFunnel.stages
              .sort((a, b) => a.order - b.order)
              .map((stage) => (
                <SubprojectKanbanColumn
                  key={stage.sub_project_funnel_stage_id}
                  stage={stage}
                  subprojects={subprojectsByStage[stage.sub_project_funnel_stage_id] || []}
                  onSubprojectClick={onSubprojectClick}
                  onSubprojectDrop={handleSubprojectDrop}
                  allProjects={availableProjects}
                  allSubprojects={subprojects}
                />
              ))}
          </div>
        ) : (
          <Card className="h-full">
            <CardContent className="p-6 h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                {funnels.length === 0 
                  ? 'Немає доступних воронок'
                  : 'Оберіть воронку для відображення підпроектів'
                }
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Діалог створення підпроекту */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
  <DialogContent className="max-w-2xl w-full flex flex-col overflow-y-auto min-h-[60vh] max-h-[95vh]">
          <DialogTitle>Створення підпроекту</DialogTitle>
          <DialogDescription>
            Створіть новий підпроект, заповнивши всі обов'язкові поля.
          </DialogDescription>
          <CreateSubprojectForm
            currentManagerId={1} // TODO: замінити на реальний id поточного менеджера
            onSubmit={async (data) => {
              // Формуємо payload згідно вимог бекенду
              const payload: any = { ...data };
              // secondary_responsible_managers має бути масивом чисел
              if (Array.isArray(data.secondary_responsible_managers)) {
                payload.secondary_responsible_managers = data.secondary_responsible_managers.map(obj =>
                  typeof obj === 'number' ? obj : obj.manager_id
                );
              }
              // Передаємо тільки одне з полів: project_id або parent_subproject_id
              if (payload.project_id && payload.parent_subproject_id) {
                // Якщо обидва вибрані, залишаємо тільки parent_subproject_id
                payload.project_id = null;
              }
              if (!payload.project_id && !payload.parent_subproject_id) {
                // Якщо не вибрано нічого, не надсилаємо запит
                alert('Потрібно вибрати проект або батьківський підпроект');
                return;
              }
              await subprojectsAPI.create(payload);
              setIsCreateDialogOpen(false);
              loadSubprojects();
            }}
            projects={availableProjects.map(p => ({
              project_id: p.project_id,
              name: p.name,
              forecast_amount: '',
              created_at: '',
              updated_at: ''
            }))}
            subprojects={subprojects.map(sp => ({
              subproject_id: sp.subproject_id,
              name: sp.name,
              project_id: sp.project_id ?? null,
              parent_subproject_id: sp.parent_subproject_id ?? null
            }))}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}