import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SubProjectFunnelStage, SubProject } from '@/types/projects';
import { SubprojectCard } from './SubprojectCard';

interface SubprojectKanbanColumnProps {
  stage: SubProjectFunnelStage;
  subprojects: SubProject[];
  onSubprojectClick?: (subproject: SubProject) => void;
  onSubprojectDrop?: (subprojectId: number, stageId: number) => void;
  allProjects: Array<{ project_id: number; name: string }>;
  allSubprojects: SubProject[];
}

export default function SubprojectKanbanColumn({ 
  stage, 
  subprojects, 
  onSubprojectClick, 
  onSubprojectDrop,
  allProjects,
  allSubprojects
}: SubprojectKanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const subprojectId = parseInt(e.dataTransfer.getData('text/plain'));
    if (onSubprojectDrop && subprojectId) {
      onSubprojectDrop(subprojectId, stage.sub_project_funnel_stage_id);
    }
  };

  const handleDragStart = (e: React.DragEvent, subproject: SubProject) => {
    e.dataTransfer.setData('text/plain', subproject.subproject_id.toString());
  };

  const totalCost = subprojects.reduce((sum, subproject) => 
    sum + parseFloat(subproject.cost), 0
  );

  return (
    <div className="flex-shrink-0 w-80 h-full">
      <Card className="h-full bg-gray-50 flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {subprojects.length}
              </Badge>
            </div>
          </div>
          {totalCost > 0 && (
            <div className="text-xs text-gray-600">
              Загалом: {totalCost.toLocaleString('uk-UA')} ₴
            </div>
          )}
        </CardHeader>
        <CardContent 
          className="flex-1 min-h-0 overflow-y-auto space-y-0"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {subprojects.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              Немає підпроектів
            </div>
          ) : (
            subprojects.map((subproject) => (
              <SubprojectCard
                key={subproject.subproject_id}
                subproject={subproject}
                onSubprojectClick={onSubprojectClick}
                onDragStart={handleDragStart}
                allProjects={allProjects}
                allSubprojects={allSubprojects}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}