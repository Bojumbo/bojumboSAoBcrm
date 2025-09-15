import { useState, useEffect } from 'react';
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
      const response = await subprojectsAPI.updateStage(subprojectId, stageId);
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
          {onCreateSubproject && (
            <Button onClick={onCreateSubproject} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Новий підпроект
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
                <SubprojectKanbanColumn
                  key={stage.sub_project_funnel_stage_id}
                  stage={stage}
                  subprojects={subprojectsByStage[stage.sub_project_funnel_stage_id] || []}
                  onSubprojectClick={onSubprojectClick}
                  onSubprojectDrop={handleSubprojectDrop}
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
    </div>
  );
}