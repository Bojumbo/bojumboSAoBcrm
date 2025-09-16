import { Task } from '@/types/projects';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, User, Clock, AlertTriangle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick?: (e: React.MouseEvent) => void;
  isDragging?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, isDragging = false }) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'new':
        return 'secondary';
      case 'in_progress':
        return 'default';
      case 'blocked':
        return 'destructive';
      case 'done':
        return 'outline';
      case 'cancelled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new':
        return 'Нове';
      case 'in_progress':
        return 'В роботі';
      case 'blocked':
        return 'Заблоковане';
      case 'done':
        return 'Виконане';
      case 'cancelled':
        return 'Скасоване';
      default:
        return status;
    }
  };

  const formatDateWithTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ' ' + date.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done' && task.status !== 'cancelled';
  const isDueSoon = task.due_date && 
    new Date(task.due_date) > new Date() && 
    new Date(task.due_date) <= new Date(Date.now() + 24 * 60 * 60 * 1000) && 
    task.status !== 'done';

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-all duration-200 mb-3 select-none ${
        isOverdue ? 'border-red-500' : isDueSoon ? 'border-yellow-500' : ''
      }`}
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
          <Badge variant={getStatusBadgeVariant(task.status)} className="text-xs">
            {getStatusText(task.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {task.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="space-y-2">
          {task.responsible_manager && (
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-muted-foreground" />
              <div className="flex items-center gap-1">
                <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  {getInitials(task.responsible_manager.first_name, task.responsible_manager.last_name)}
                </div>
                <span className="text-xs text-muted-foreground">
                  {task.responsible_manager.first_name} {task.responsible_manager.last_name}
                </span>
              </div>
            </div>
          )}
          
          {task.due_date && (
            <div className={`flex items-center gap-2 ${
              isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-muted-foreground'
            }`}>
              {isOverdue ? (
                <AlertTriangle className="h-3 w-3" />
              ) : (
                <Calendar className="h-3 w-3" />
              )}
              <span className="text-xs">
                {formatDateWithTime(task.due_date)}
              </span>
              {isOverdue && (
                <span className="text-xs text-red-600 font-medium">Прострочено</span>
              )}
              {isDueSoon && (
                <span className="text-xs text-yellow-600 font-medium">Сьогодні</span>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {formatDateWithTime(task.created_at)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;