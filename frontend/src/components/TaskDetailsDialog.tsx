import { useState, useEffect } from 'react';
import { Task, Project, SubProject, Manager } from '@/types/projects';
import { managersAPI } from '@/lib/api';
import { tasksAPI, projectsAPI, subprojectsAPI } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import LoadingSpinner from './ui/loading-spinner';
import { 
  Calendar, 
  User, 
  Clock, 
  Edit, 
  Save, 
  X, 
  Trash2,
  AlertTriangle 
} from 'lucide-react';

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: number) => void;
}

const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
  open,
  onOpenChange,
  task,
  onTaskUpdated,
  onTaskDeleted,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [managerSearch, setManagerSearch] = useState('');
  const [managers, setManagers] = useState<Manager[]>([]);
  // Завантаження менеджерів для вибору виконавця
  useEffect(() => {
    if (isEditing) {
      managersAPI.getAllForAssignment().then((response: { success: boolean; data?: Manager[]; error?: string }) => {
        if (response.success && response.data) {
          setManagers(response.data);
        }
      });
    }
  }, [isEditing]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [subprojects, setSubprojects] = useState<SubProject[]>([]);
  const [filteredSubprojects, setFilteredSubprojects] = useState<SubProject[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    responsible_manager_id: '',
    project_id: '',
    subproject_id: '',
    due_date: '',
    status: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Заповнення форми даними завдання
  useEffect(() => {
    if (task && open) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        responsible_manager_id: task.responsible_manager_id?.toString() || '',
        project_id: task.project_id?.toString() || '',
        subproject_id: task.subproject_id?.toString() || '',
        due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
        status: task.status || '',
      });
      setIsEditing(false);
      setErrors({});
    }
  }, [task, open]);

  // Обробка клавіші Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        if (isEditing) {
          setIsEditing(false);
        } else {
          handleClose();
        }
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, isEditing]);

  // Завантаження даних
  useEffect(() => {
    if (open && isEditing) {
      loadProjects();
      loadSubprojects();
    }
  }, [open, isEditing]);

  // Фільтрація підпроектів при зміні проекту
  useEffect(() => {
    if (formData.project_id) {
      const filtered = subprojects.filter(
        sub => sub.project_id === parseInt(formData.project_id)
      );
      setFilteredSubprojects(filtered);
      if (formData.subproject_id && !filtered.find(sub => sub.subproject_id === parseInt(formData.subproject_id))) {
        setFormData(prev => ({ ...prev, subproject_id: '' }));
      }
    } else {
      setFilteredSubprojects([]);
      setFormData(prev => ({ ...prev, subproject_id: '' }));
    }
  }, [formData.project_id, subprojects]);

  const loadProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      if (response.success && response.data) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error('Помилка завантаження проектів:', error);
    }
  };

  const loadSubprojects = async () => {
    try {
      const response = await subprojectsAPI.getAll();
      if (response.success && response.data) {
        setSubprojects(response.data);
      }
    } catch (error) {
      console.error('Помилка завантаження підпроектів:', error);
    }
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Назва завдання є обов\'язковою';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!task || !validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const taskData: Partial<Task> = {
        title: formData.title,
        description: formData.description || undefined,
        responsible_manager_id: formData.responsible_manager_id ? parseInt(formData.responsible_manager_id) : undefined,
        project_id: formData.project_id ? parseInt(formData.project_id) : undefined,
        subproject_id: formData.subproject_id ? parseInt(formData.subproject_id) : undefined,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
        status: formData.status as Task['status'],
      };

      console.log('Sending task data:', taskData);
      const response = await tasksAPI.partialUpdate(task.task_id, taskData);
      
      if (response.success && response.data) {
        if (onTaskUpdated) {
          onTaskUpdated(response.data);
        }
        setIsEditing(false);
      } else {
        setErrors({ submit: response.error || 'Помилка оновлення завдання' });
      }
    } catch (error) {
      setErrors({ submit: 'Помилка оновлення завдання' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm('Ви впевнені, що хочете видалити це завдання?')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await tasksAPI.delete(task.task_id);
      
      if (response.success) {
        if (onTaskDeleted) {
          onTaskDeleted(task.task_id);
        }
        onOpenChange(false);
      } else {
        setErrors({ submit: response.error || 'Помилка видалення завдання' });
      }
    } catch (error) {
      setErrors({ submit: 'Помилка видалення завдання' });
    } finally {
      setDeleting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    setErrors({});
    onOpenChange(false);
  };

  if (!task) return null;

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {isEditing ? 'Редагувати завдання' : 'Деталі завдання'}
              <Badge variant={getStatusBadgeVariant(task.status)}>
                {getStatusText(task.status)}
              </Badge>
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Назва */}
          <div className="space-y-2">
            <Label htmlFor="title">Назва завдання</Label>
            {isEditing ? (
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={errors.title ? 'border-red-500' : ''}
              />
            ) : (
              <h3 className="text-lg font-medium">{task.title}</h3>
            )}
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Опис */}
          <div className="space-y-2">
            <Label>Опис</Label>
            {isEditing ? (
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
              />
            ) : (
              <p className="text-muted-foreground whitespace-pre-wrap">
                {task.description || 'Опис відсутній'}
              </p>
            )}
          </div>

          {/* Метадані */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Виконавець */}
            <div className="space-y-2">
              <Label>Виконавець</Label>
              {isEditing ? (
                <Select
                  value={formData.responsible_manager_id}
                  onValueChange={(value) => handleInputChange('responsible_manager_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Виберіть виконавця" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-2">
                      <Input
                        placeholder="Пошук виконавця..."
                        value={managerSearch}
                        onChange={(e) => setManagerSearch(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    {managers
                      .filter((manager) =>
                        manager.first_name.toLowerCase().includes(managerSearch.toLowerCase()) ||
                        manager.last_name.toLowerCase().includes(managerSearch.toLowerCase())
                      )
                      .map((manager) => (
                        <SelectItem key={manager.manager_id} value={manager.manager_id.toString()}>
                          {manager.first_name} {manager.last_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2">
                  {task.responsible_manager ? (
                    <>
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {getInitials(task.responsible_manager.first_name, task.responsible_manager.last_name)}
                      </div>
                      <span>{task.responsible_manager.first_name} {task.responsible_manager.last_name}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Не призначено</span>
                  )}
                </div>
              )}
            </div>

            {/* Статус */}
            {isEditing && (
              <div className="space-y-2">
                <Label>Статус</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Нове</SelectItem>
                    <SelectItem value="in_progress">В роботі</SelectItem>
                    <SelectItem value="blocked">Заблоковане</SelectItem>
                    <SelectItem value="done">Виконане</SelectItem>
                    <SelectItem value="cancelled">Скасоване</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Проект та підпроект */}
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Проект</Label>
                <Select
                  value={formData.project_id}
                  onValueChange={(value) => handleInputChange('project_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Виберіть проект" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.project_id} value={project.project_id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Підпроект</Label>
                <Select
                  value={formData.subproject_id}
                  onValueChange={(value) => handleInputChange('subproject_id', value)}
                  disabled={!formData.project_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Виберіть підпроект" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubprojects.map((subproject) => (
                      <SelectItem key={subproject.subproject_id} value={subproject.subproject_id.toString()}>
                        {subproject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="mb-1">Проект</Label>
                <div className="text-sm font-medium">
                  {task.project_id
                    ? (projects.find(p => p.project_id === task.project_id)?.name || `ID: ${task.project_id}`)
                    : <span className="text-muted-foreground">Не вказано</span>}
                </div>
              </div>
              <div>
                <Label className="mb-1">Підпроект</Label>
                <div className="text-sm font-medium">
                  {task.subproject_id
                    ? (subprojects.find(sp => sp.subproject_id === task.subproject_id)?.name || `ID: ${task.subproject_id}`)
                    : <span className="text-muted-foreground">Не вказано</span>}
                </div>
              </div>
            </div>
          )}

          {/* Дедлайн */}
          <div className="space-y-2">
            <Label>Дедлайн</Label>
            {isEditing ? (
              <Input
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
              />
            ) : task.due_date ? (
              <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600' : ''}`}>
                {isOverdue ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Calendar className="h-4 w-4" />
                )}
                <span>{formatDate(task.due_date)}</span>
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs text-black">
                    Прострочено
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">Не встановлено</span>
            )}
          </div>

          {/* Дати створення та оновлення */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Створено: {formatDate(task.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Оновлено: {formatDate(task.updated_at)}</span>
            </div>
          </div>

          {/* Автор */}
          {task.creator_manager && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Автор:</span>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-medium">
                  {getInitials(task.creator_manager.first_name, task.creator_manager.last_name)}
                </div>
                <span>{task.creator_manager.first_name} {task.creator_manager.last_name}</span>
              </div>
            </div>
          )}

          {errors.submit && (
            <p className="text-sm text-red-600">{errors.submit}</p>
          )}
        </div>

        <DialogFooter>
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Скасувати
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Збереження...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Зберегти
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                size="sm"
                disabled={deleting}
                className="text-red-600 hover:text-red-800"
              >
                {deleting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsDialog;