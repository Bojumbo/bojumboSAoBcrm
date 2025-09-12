import { useState, useEffect } from 'react';
import { Funnel, FunnelStage, Project } from '@/types/projects';
import { projectsAPI, funnelsAPI } from '@/lib/api';
import KanbanColumn from './KanbanColumn';
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

interface ProjectsKanbanProps {
  onProjectClick?: (project: Project) => void;
  onCreateProject?: () => void;
}

export default function ProjectsKanban({ 
  onProjectClick, 
  onCreateProject 
}: ProjectsKanbanProps) {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<Funnel | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFunnels = async () => {
    try {
      const response = await funnelsAPI.getAll();
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

  const loadProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      if (response.success && response.data) {
        setProjects(response.data);
      } else {
        setError(response.error || 'Помилка завантаження проектів');
      }
    } catch (err) {
      setError('Помилка завантаження проектів');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectDrop = async (projectId: number, stageId: number) => {
    try {
      const response = await projectsAPI.updateStage(projectId, stageId);
      if (response.success) {
        await loadProjects(); // Перезавантажуємо проекти
      } else {
        setError(response.error || 'Помилка оновлення етапу проекту');
      }
    } catch (err) {
      setError('Помилка оновлення етапу проекту');
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    Promise.all([loadFunnels(), loadProjects()]);
  };

  useEffect(() => {
    loadFunnels();
  }, []);

  useEffect(() => {
    if (funnels.length > 0) {
      loadProjects();
    }
  }, [funnels]);

  // Фільтруємо проекти по обраній воронці
  const filteredProjects = selectedFunnel 
    ? projects.filter(project => project.funnel_id === selectedFunnel.funnel_id)
    : [];

  // Групуємо проекти по етапах
  const projectsByStage = selectedFunnel ? selectedFunnel.stages.reduce((acc, stage) => {
    acc[stage.funnel_stage_id] = filteredProjects.filter(
      project => project.funnel_stage_id === stage.funnel_stage_id
    );
    return acc;
  }, {} as Record<number, Project[]>) : {};

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
          <h1 className="text-2xl font-bold">Проекти</h1>
          {funnels.length > 1 && (
            <Select 
              value={selectedFunnel?.funnel_id.toString()} 
              onValueChange={(value) => {
                const funnel = funnels.find(f => f.funnel_id === parseInt(value));
                setSelectedFunnel(funnel || null);
              }}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Оберіть воронку" />
              </SelectTrigger>
              <SelectContent>
                {funnels.map((funnel) => (
                  <SelectItem key={funnel.funnel_id} value={funnel.funnel_id.toString()}>
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
          {onCreateProject && (
            <Button onClick={onCreateProject} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Новий проект
            </Button>
          )}
        </div>
      </div>

      {/* Канбан дошка */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {selectedFunnel ? (
          <div className="flex gap-4 h-full overflow-x-auto overflow-y-hidden">
            {selectedFunnel.stages
              .sort((a, b) => a.order - b.order)
              .map((stage) => (
                <KanbanColumn
                  key={stage.funnel_stage_id}
                  stage={stage}
                  projects={projectsByStage[stage.funnel_stage_id] || []}
                  onProjectClick={onProjectClick}
                  onProjectDrop={handleProjectDrop}
                />
              ))}
          </div>
        ) : (
          <Card className="h-full">
            <CardContent className="p-6 h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                {funnels.length === 0 
                  ? 'Немає доступних воронок'
                  : 'Оберіть воронку для відображення проектів'
                }
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
