import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SubProject } from '@/types/projects';
import { GitBranch, Euro, FolderOpen } from 'lucide-react';

interface SubprojectCardProps {
  subproject: SubProject;
  onSubprojectClick?: (subproject: SubProject) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, subproject: SubProject) => void;
}

export default function SubprojectCard({ 
  subproject, 
  onSubprojectClick, 
  draggable = true,
  onDragStart 
}: SubprojectCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, subproject);
    }
  };

  const handleClick = () => {
    if (onSubprojectClick) {
      onSubprojectClick(subproject);
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
          <h3 className="font-medium text-sm leading-tight">{subproject.name}</h3>
          <Badge variant="outline" className="text-xs">
            #{subproject.subproject_id}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {subproject.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {subproject.description}
          </p>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <FolderOpen className="h-3 w-3" />
            <span className="truncate">Проект #{subproject.project_id}</span>
          </div>
          
          {subproject.status && (
            <div className="flex items-center gap-2 text-xs">
              <GitBranch className="h-3 w-3 text-blue-600" />
              <Badge variant="secondary" className="text-xs">
                {subproject.status}
              </Badge>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-xs">
            <Euro className="h-3 w-3 text-green-600" />
            <span className="font-medium text-green-600">
              {parseFloat(subproject.cost).toLocaleString('uk-UA')} ₴
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}