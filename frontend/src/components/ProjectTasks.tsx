'use client';

import React, { useState, useEffect } from 'react';
import { getAuthToken } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, CheckSquare, Search, Calendar, User, Clock, AlertCircle } from 'lucide-react';
import { Task } from '@/types/projects';
import TaskDetailsDialog from './TaskDetailsDialog';

interface ProjectTasksProps {
  projectId: number;
}

export default function ProjectTasks({ projectId }: ProjectTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
  const token = getAuthToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/tasks?project_id=${projectId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const result = await response.json();
        let data;
        if (result.success && result.data) {
          data = result.data;
        } else {
          data = result;
        }
        setTasks(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch tasks:', response.status);
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Не вказано';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new':
      case 'новий':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
      case 'в роботі':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
      case 'заблоковано':
        return 'bg-red-100 text-red-800';
      case 'done':
      case 'виконано':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'скасовано':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'Новий';
      case 'in_progress':
        return 'В роботі';
      case 'blocked':
        return 'Заблоковано';
      case 'done':
        return 'Виконано';
      case 'cancelled':
        return 'Скасовано';
      default:
        return status;
    }
  };

  const isPastDue = (dueDate: string | null | undefined, status: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !['done', 'cancelled'].includes(status);
  };

  const filteredTasks = Array.isArray(tasks) ? tasks.filter(task =>
    // Фільтруємо спочатку по projectId, потім по пошуку
    task.project_id === projectId && (
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.responsible_manager?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.responsible_manager?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) : [];

  const taskStats = {
    total: filteredTasks.length,
    new: filteredTasks.filter(t => t.status === 'new').length,
    inProgress: filteredTasks.filter(t => t.status === 'in_progress').length,
    done: filteredTasks.filter(t => t.status === 'done').length,
    overdue: filteredTasks.filter(t => isPastDue(t.due_date, t.status)).length,
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Завантаження завдань...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
  <>
  <div className="space-y-6 min-h-[600px]">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Завдання проекту</h3>
          <p className="text-sm text-muted-foreground">
            Управління завданнями та відстеженням прогресу
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Створити завдання
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{taskStats.total}</div>
            <div className="text-sm text-muted-foreground">Всього</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{taskStats.new}</div>
            <div className="text-sm text-muted-foreground">Нові</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{taskStats.inProgress}</div>
            <div className="text-sm text-muted-foreground">В роботі</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{taskStats.done}</div>
            <div className="text-sm text-muted-foreground">Виконано</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
            <div className="text-sm text-muted-foreground">Прострочено</div>
          </CardContent>
        </Card>
      </div>

      {/* Пошук */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Пошук завдань..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Список завдань */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'Завдання не знайдено' : 'Немає завдань'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Спробуйте змінити критерії пошуку' 
                : 'Створіть перше завдання для цього проекту'
              }
            </p>
            {!searchTerm && (
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Створити завдання
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <Card key={task.task_id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {task.title}
                      <Badge 
                        variant="secondary"
                        className={getStatusColor(task.status)}
                      >
                        {getStatusLabel(task.status)}
                      </Badge>
                      {isPastDue(task.due_date, task.status) && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Прострочено
                        </Badge>
                      )}
                    </CardTitle>
                    {task.description && (
                      <CardDescription className="mt-2">
                        {task.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Відповідальний:</span>
                      <span className="font-medium">
                        {task.responsible_manager 
                          ? `${task.responsible_manager.first_name} ${task.responsible_manager.last_name}`
                          : 'Не призначено'
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Автор:</span>
                      <span className="font-medium">
                        {task.creator_manager 
                          ? `${task.creator_manager.first_name} ${task.creator_manager.last_name}`
                          : 'Не вказано'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Дедлайн:</span>
                      <span className={isPastDue(task.due_date, task.status) ? 'text-red-600 font-medium' : ''}>
                        {formatDate(task.due_date)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Створено:</span>
                      <span>{formatDate(task.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    ID: {task.task_id}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedTask(task); setDialogOpen(true); }}>
                      Переглянути
                    </Button>
                    {task.status !== 'done' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Завершити
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    <TaskDetailsDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      task={selectedTask}
      onTaskUpdated={(updated: Task) => {
        setTasks(prev => prev.map(t => t.task_id === updated.task_id ? updated : t));
        setDialogOpen(false);
      }}
      onTaskDeleted={(deletedId: number) => {
        setTasks(prev => prev.filter(t => t.task_id !== deletedId));
        setDialogOpen(false);
      }}
    />
    </>
  );
}