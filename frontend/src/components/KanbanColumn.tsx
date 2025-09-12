import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FunnelStage, Project } from '@/types/projects';
import ProjectCard from './ProjectCard';

interface KanbanColumnProps {
  stage: FunnelStage;
  projects: Project[];
  onProjectClick?: (project: Project) => void;
  onProjectDrop?: (projectId: number, stageId: number) => void;
}

export default function KanbanColumn({ 
  stage, 
  projects, 
  onProjectClick, 
  onProjectDrop 
}: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const projectId = parseInt(e.dataTransfer.getData('text/plain'));
    if (onProjectDrop && projectId) {
      onProjectDrop(projectId, stage.funnel_stage_id);
    }
  };

  const handleDragStart = (e: React.DragEvent, project: Project) => {
    e.dataTransfer.setData('text/plain', project.project_id.toString());
  };

  const totalAmount = projects.reduce((sum, project) => 
    sum + parseFloat(project.forecast_amount), 0
  );

  return (
    <div className="flex-shrink-0 w-80 h-full">
      <Card className="h-full bg-gray-50 flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {projects.length}
              </Badge>
            </div>
          </div>
          {totalAmount > 0 && (
            <div className="text-xs text-gray-600">
              Загалом: {totalAmount.toLocaleString('uk-UA')} ₴
            </div>
          )}
        </CardHeader>
        <CardContent 
          className="flex-1 min-h-0 overflow-y-auto space-y-0"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {projects.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              Немає проектів
            </div>
          ) : (
            projects.map((project) => (
              <ProjectCard
                key={project.project_id}
                project={project}
                onProjectClick={onProjectClick}
                onDragStart={handleDragStart}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
