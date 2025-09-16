'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import TasksKanban from '@/components/TasksKanban';
import CreateTaskDialog from '@/components/CreateTaskDialog';
import TaskDetailsDialog from '@/components/TaskDetailsDialog';
import { Task } from '@/types/projects';

export default function TasksPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateTask = () => {
    setCreateDialogOpen(true);
  };

  const handleTaskCreated = (task: Task) => {
    // Оновлюємо список завдань
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDetailsDialogOpen(true);
  };

  const handleTaskUpdated = (task: Task) => {
    // Оновлюємо список завдань
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTaskDeleted = (taskId: number) => {
    // Оновлюємо список завдань
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="h-full px-4 py-6 md:px-8 md:py-8">
        <TasksKanban
          key={refreshTrigger}
          onTaskClick={handleTaskClick}
          onCreateTask={handleCreateTask}
        />
        <CreateTaskDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onTaskCreated={handleTaskCreated}
        />
        <TaskDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          task={selectedTask}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      </div>
    </DashboardLayout>
  );
}
