import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types/projects';
import { User, Building2, Euro } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onProjectClick?: (project: Project) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, project: Project) => void;
}

export default function ProjectCard({ 
  project, 
  onProjectClick, 
  draggable = true,
  onDragStart 
}: ProjectCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, project);
    }
  };

  const handleClick = () => {
    if (onProjectClick) {
      onProjectClick(project);
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow mb-3 bg-white"
      draggable={draggable}
      onDragStart={handleDragStart}
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-sm leading-tight">{project.name}</h3>
          <Badge variant="outline" className="text-xs">
            #{project.project_id}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {project.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {project.description}
          </p>
        )}
        
        <div className="space-y-2">
          {project.counterparty && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{project.counterparty.name}</span>
            </div>
          )}
          
          {project.main_responsible_manager && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <User className="h-3 w-3" />
              <span className="truncate">
                {project.main_responsible_manager.first_name} {project.main_responsible_manager.last_name}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-xs">
            <Euro className="h-3 w-3 text-green-600" />
            <span className="font-medium text-green-600">
              {parseFloat(project.forecast_amount).toLocaleString('uk-UA')} ₴
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
