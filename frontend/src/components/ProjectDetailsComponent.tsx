'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, FileText, ShoppingCart, TrendingUp, CheckSquare } from 'lucide-react';
import { Project, Funnel } from '@/types/projects';
import { projectService } from '@/services/projectService';
import { funnelService } from '@/services/funnelService';
import ProjectInfoPanel from './ProjectInfoPanel';
import ProjectChat from './ProjectChat';
import ProjectSubprojects from './ProjectSubprojects';
import ProjectProducts from './ProjectProducts';
import ProjectSales from './ProjectSales';
import ProjectTasks from './ProjectTasks';
import ProjectEditDialog from './ProjectEditDialog';

interface ProjectDetailsComponentProps {
  projectId: number;
}

export default function ProjectDetailsComponent({ projectId }: ProjectDetailsComponentProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [updatingFunnel, setUpdatingFunnel] = useState(false);
  const [updatingStage, setUpdatingStage] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        const projectData = await projectService.getById(projectId);
        setProject(projectData);
      } catch (err) {
        console.error('Error fetching project:', err);
        if (err instanceof Error) {
          if (err.message.includes('Authentication failed') || err.message.includes('No authentication token')) {
            setError('Помилка авторизації. Будь ласка, увійдіть в систему.');
          } else if (err.message.includes('403')) {
            setError('У вас немає прав доступу до цього проекту.');
          } else if (err.message.includes('404')) {
            setError('Проект не знайдено.');
          } else {
            setError('Помилка завантаження проекту. Спробуйте пізніше.');
          }
        } else {
          setError('Невідома помилка завантаження проекту.');
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchFunnels = async () => {
      try {
        const funnelsData = await funnelService.getAll();
        setFunnels(funnelsData);
      } catch (err) {
        console.error('Error fetching funnels:', err);
      }
    };

    fetchProject();
    fetchFunnels();
  }, [projectId]);

  const handleFunnelChange = async (funnelId: string) => {
    if (!project || updatingFunnel) return;
    
    try {
      setUpdatingFunnel(true);
      const updatedProject = await projectService.update(project.project_id, {
        funnel_id: funnelId === 'none' ? undefined : parseInt(funnelId),
        funnel_stage_id: undefined // Скидаємо етап при зміні воронки
      });
      
      // Отримуємо повні дані проекту з новою воронкою та етапами
      const fullProject = await projectService.getById(project.project_id);
      setProject(fullProject);
    } catch (err) {
      console.error('Error updating funnel:', err);
    } finally {
      setUpdatingFunnel(false);
    }
  };

  const handleStageChange = async (stageId: string) => {
    if (!project || updatingStage) return;
    
    try {
      setUpdatingStage(true);
      const updatedProject = await projectService.update(project.project_id, {
        funnel_stage_id: stageId === 'none' ? undefined : parseInt(stageId)
      });
      
      // Отримуємо повні дані проекту
      const fullProject = await projectService.getById(project.project_id);
      setProject(fullProject);
    } catch (err) {
      console.error('Error updating stage:', err);
    } finally {
      setUpdatingStage(false);
    }
  };

  // Отримуємо етапи для поточної воронки
  const currentStages = project?.funnel_id 
    ? funnels.find(f => f.funnel_id === project.funnel_id)?.stages || []
    : [];

  // Додаємо логування для діагностики
  useEffect(() => {
    console.log('Project funnel_id:', project?.funnel_id);
    console.log('Available funnels:', funnels.map(f => ({ id: f.funnel_id, name: f.name, stagesCount: f.stages?.length })));
    console.log('Current stages for selected funnel:', currentStages.map(s => ({ id: s.funnel_stage_id, name: s.name })));
  }, [project?.funnel_id, funnels, currentStages]);

  const handleEditProject = () => {
    setIsEditDialogOpen(true);
  };

  const handleProjectUpdated = (updatedProject: Project) => {
    setProject(updatedProject);
    setIsEditDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Завантаження проекту #{projectId}...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-lg text-red-600">{error || 'Проект не знайдено'}</div>
        <div className="text-sm text-muted-foreground">
          Проект ID: {projectId}
        </div>
        <div className="text-sm text-muted-foreground">
          Debug: project = {project ? 'існує' : 'null/undefined'}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Основний контент - центральна частина */}
          <div className="flex-1 min-w-0 xl:order-1">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 break-words">{project.name}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">ID: {project.project_id}</Badge>
                
                {/* Спадаюче меню для воронки */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Воронка:</span>
                  <Select
                    value={project.funnel_id?.toString() || "none"}
                    onValueChange={handleFunnelChange}
                    disabled={updatingFunnel}
                  >
                    <SelectTrigger className="w-auto min-w-[120px] h-8">
                      <SelectValue placeholder="Не вибрано">
                        {project.funnel ? project.funnel.name : "Не вибрано"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Не вибрано</SelectItem>
                      {funnels.map((funnel) => (
                        <SelectItem key={funnel.funnel_id} value={funnel.funnel_id.toString()}>
                          {funnel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Спадаюче меню для етапу */}
                {project.funnel_id && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Етап:</span>
                    <Select
                      value={project.funnel_stage_id?.toString() || "none"}
                      onValueChange={handleStageChange}
                      disabled={updatingStage}
                    >
                      <SelectTrigger className="w-auto min-w-[120px] h-8">
                        <SelectValue placeholder="Не вибрано">
                          {project.funnel_stage ? project.funnel_stage.name : "Не вибрано"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Не вибрано</SelectItem>
                        {currentStages.map((stage) => (
                          <SelectItem key={stage.funnel_stage_id} value={stage.funnel_stage_id.toString()}>
                            {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1">
                <TabsTrigger value="chat" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                  <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="truncate">Чат</span>
                </TabsTrigger>
                <TabsTrigger value="subprojects" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                  <FileText className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="truncate hidden sm:inline">Підпроекти</span>
                  <span className="truncate sm:hidden">Підпр.</span>
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                  <ShoppingCart className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="truncate">Товари</span>
                </TabsTrigger>
                <TabsTrigger value="sales" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                  <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="truncate">Продажі</span>
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                  <CheckSquare className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="truncate">Завдання</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="chat" className="space-y-4">
                  <ProjectChat projectId={projectId} />
                </TabsContent>
                
                <TabsContent value="subprojects" className="space-y-4">
                  <ProjectSubprojects projectId={projectId} />
                </TabsContent>
                
                <TabsContent value="products" className="space-y-4">
                  <ProjectProducts projectId={projectId} />
                </TabsContent>
                
                <TabsContent value="sales" className="space-y-4">
                  <ProjectSales projectId={projectId} />
                </TabsContent>
                
                <TabsContent value="tasks" className="space-y-4">
                  <ProjectTasks projectId={projectId} />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Права панель з інформацією про проект */}
          <div className="w-full xl:w-80 xl:max-w-sm xl:order-2 flex-shrink-0">
            <ProjectInfoPanel project={project} onEdit={handleEditProject} />
          </div>
        </div>

        {/* Діалог редагування проекту */}
        <ProjectEditDialog
          project={project}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleProjectUpdated}
        />
      </div>
    </div>
  );
}
