
import { useState, useEffect } from 'react';
import { Task, Project, SubProject, Manager } from '@/types/projects';
import { tasksAPI, projectsAPI, subprojectsAPI, managersAPI } from '@/lib/api';
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
import LoadingSpinner from './ui/loading-spinner';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated?: (task: Task) => void;
}

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({
  open,
  onOpenChange,
  onTaskCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [subprojects, setSubprojects] = useState<SubProject[]>([]);
  const [filteredSubprojects, setFilteredSubprojects] = useState<SubProject[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    responsible_manager_id: '',
    project_id: '',
    subproject_id: '',
    due_date: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [managerSearch, setManagerSearch] = useState('');

  // Функція для завантаження проектів
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
  // Завантаження даних
  useEffect(() => {
    if (open) {
      loadProjects();
      loadSubprojects();
      loadManagers();
    }
  }, [open]);

  // Фільтрація підпроектів при зміні проекту
  useEffect(() => {
    if (formData.project_id) {
      const filtered = subprojects.filter(
        sub => sub.project_id === parseInt(formData.project_id)
      );
      setFilteredSubprojects(filtered);
      // Скинути вибраний підпроект якщо він не відноситься до нового проекту
      if (formData.subproject_id && !filtered.find(sub => sub.subproject_id === parseInt(formData.subproject_id))) {
        setFormData(prev => ({ ...prev, subproject_id: '' }));
      }
    } else {
      setFilteredSubprojects([]);
    }
  }, [formData.project_id, formData.subproject_id, subprojects]);

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

  const loadManagers = async () => {
    try {
      console.log('Loading managers for assignment...');
      const response = await managersAPI.getAllForAssignment();
      console.log('Managers API response:', response);
      if (response.success && response.data) {
        console.log('Managers loaded:', response.data);
        setManagers(response.data);
      } else {
        console.error('Failed to load managers:', response.error);
      }
    } catch (error) {
      console.error('Помилка завантаження менеджерів:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Назва завдання є обов\'язковою';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // creator_manager_id буде братись на бекенді як поточний користувач
      const taskData: Partial<Task> = {
        title: formData.title,
        description: formData.description || undefined,
        responsible_manager_id: formData.responsible_manager_id ? parseInt(formData.responsible_manager_id) : undefined,
        project_id: formData.project_id ? parseInt(formData.project_id) : undefined,
        subproject_id: formData.subproject_id ? parseInt(formData.subproject_id) : undefined,
        due_date: formData.due_date || undefined,
      };

      const response = await tasksAPI.create(taskData);
      
      if (response.success && response.data) {
        if (onTaskCreated) {
          onTaskCreated(response.data);
        }
        handleClose();
      } else {
        setErrors({ submit: response.error || 'Помилка створення завдання' });
      }
    } catch (error) {
      setErrors({ submit: 'Помилка створення завдання' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      responsible_manager_id: '',
      project_id: '',
      subproject_id: '',
      due_date: '',
    });
    setErrors({});
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Створити завдання</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-2">
            <Label htmlFor="title">Назва завдання *</Label>
            <Input
              id="title"
              placeholder="Введіть назву завдання"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Опис</Label>
            <Textarea
              id="description"
              placeholder="Введіть опис завдання"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Виконавець</Label>
            <Select
              value={formData.responsible_manager_id}
              onValueChange={(value) => handleInputChange('responsible_manager_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Виберіть виконавця" />
              </SelectTrigger>
              <SelectContent>
                {managers.map((manager) => (
                  <SelectItem key={manager.manager_id} value={manager.manager_id.toString()}>
                    {manager.first_name} {manager.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
              disabled={!formData.project_id || filteredSubprojects.length === 0}
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

          <div className="space-y-2">
            <Label htmlFor="due_date">Дата дедлайну</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => handleInputChange('due_date', e.target.value)}
            />
          </div>


          {errors.submit && (
            <p className="text-sm text-red-600">{errors.submit}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Скасувати
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Створення...
                </>
              ) : (
                'Створити завдання'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;