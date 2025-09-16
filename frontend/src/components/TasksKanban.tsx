import { useState, useEffect } from 'react';
import { Task } from '@/types/projects';
import { tasksAPI } from '@/lib/api';
import TaskCard from './TaskCard';
import LoadingSpinner from './ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RefreshCw, Plus } from 'lucide-react';

interface TasksKanbanProps {
  onTaskClick?: (task: Task) => void;
  onCreateTask?: () => void;
}

const TasksKanban: React.FC<TasksKanbanProps> = ({ 
  onTaskClick, 
  onCreateTask 
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const statusColumns = [
    { key: 'new', title: 'Нові', color: 'bg-gray-50' },
    { key: 'in_progress', title: 'В роботі', color: 'bg-blue-50' },
    { key: 'blocked', title: 'Заблоковані', color: 'bg-red-50' },
    { key: 'done', title: 'Виконані', color: 'bg-green-50' },
    { key: 'cancelled', title: 'Скасовані', color: 'bg-yellow-50' },
  ];

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tasksAPI.getAll();
      if (response.success && response.data) {
        setTasks(response.data);
      } else {
        setError(response.error || 'Помилка завантаження завдань');
      }
    } catch (err) {
      setError('Помилка завантаження завдань');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getStatusCount = (status: string) => {
    return getTasksByStatus(status).length;
  };

  const handleTaskClick = (task: Task) => {
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  const handleRefresh = () => {
    loadTasks();
  };

  // Drag and Drop обробники
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', (e.currentTarget as HTMLElement).outerHTML);
    
    const element = e.currentTarget as HTMLElement;
    element.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const element = e.currentTarget as HTMLElement;
    if (element) {
      element.style.opacity = '1';
    }
    setDraggedTask(null);
    setDragOverColumn(null);
    
    // Затримка для запобігання спрацьовуванню кліка після закінчення drag
    setTimeout(() => {
      setIsDragging(false);
    }, 100);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    setDragOverColumn(columnKey);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Перевіряємо, чи ми дійсно покинули колонку
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      
      // Оптимістичне оновлення UI
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.task_id === draggedTask.task_id 
            ? { ...task, status: newStatus as Task['status'] }
            : task
        )
      );

      // Відправляємо запит на сервер
      const response = await tasksAPI.updateStatus(draggedTask.task_id, newStatus);

      if (!response.success) {
        // Якщо помилка, відкатуємо зміни
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.task_id === draggedTask.task_id 
              ? { ...task, status: draggedTask.status }
              : task
          )
        );
        setError(response.error || 'Помилка оновлення статусу завдання');
      }
    } catch (err) {
      // Відкатуємо зміни при помилці
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.task_id === draggedTask.task_id 
            ? { ...task, status: draggedTask.status }
            : task
        )
      );
      setError('Помилка оновлення статусу завдання');
    } finally {
      setUpdating(false);
    }

    setDraggedTask(null);
  };

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Завантаження завдань...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Спробувати знову
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Показ помилки */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <Button
              onClick={() => setError(null)}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-800"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Індикатор оновлення */}
      {updating && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <LoadingSpinner size="sm" className="mr-2" />
            <p className="text-sm text-blue-600">Оновлення статусу завдання...</p>
          </div>
        </div>
      )}

      {/* Заголовок з кнопками */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Завдання</h1>
          <p className="text-muted-foreground">
            Всього завдань: {tasks.length}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Оновити
          </Button>
          {onCreateTask && (
            <Button onClick={onCreateTask} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Створити завдання
            </Button>
          )}
        </div>
      </div>

      {/* Канбан дошка */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 h-full">
          {statusColumns.map((column) => (
            <Card 
              key={column.key} 
              className={`flex flex-col h-full transition-colors ${column.color} ${
                dragOverColumn === column.key ? 'ring-2 ring-blue-400 bg-blue-100' : ''
              }`}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, column.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.key)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>{column.title}</span>
                  <span className="bg-white rounded-full px-2 py-1 text-xs font-normal">
                    {getStatusCount(column.key)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pt-0">
                <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto min-h-[200px]">
                  {getTasksByStatus(column.key).map((task) => (
                    <div
                      key={task.task_id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className={`cursor-move transition-all duration-200 ${
                        draggedTask?.task_id === task.task_id ? 'opacity-50 scale-95' : ''
                      }`}
                    >
                      <TaskCard
                        task={task}
                        isDragging={isDragging}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTaskClick(task);
                        }}
                      />
                    </div>
                  ))}
                  {getTasksByStatus(column.key).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">
                        {dragOverColumn === column.key ? 'Перетягніть завдання сюди' : 'Немає завдань'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TasksKanban;