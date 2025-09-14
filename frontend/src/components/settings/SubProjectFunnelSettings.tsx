'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Funnel, Plus, Edit2, Trash2, Save, X, ArrowUp, ArrowDown } from 'lucide-react';
import { subProjectFunnelService } from '@/services/subProjectFunnelService';
import { SubProjectFunnel, SubProjectFunnelStage } from '@/types/projects';

export default function SubProjectFunnelSettings() {
  const [funnels, setFunnels] = useState<SubProjectFunnel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFunnels, setIsLoadingFunnels] = useState(true);
  const [editingFunnel, setEditingFunnel] = useState<SubProjectFunnel | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFunnelName, setNewFunnelName] = useState('');
  const [newStageName, setNewStageName] = useState('');
  const [activeNewStageInput, setActiveNewStageInput] = useState<number | null>(null);
  const [movingStageId, setMovingStageId] = useState<number | null>(null);

  // Завантаження воронок при ініціалізації
  useEffect(() => {
    loadFunnels();
  }, []);

  const loadFunnels = async () => {
    setIsLoadingFunnels(true);
    try {
      const loadedFunnels = await subProjectFunnelService.getAll();
      setFunnels(loadedFunnels);
    } catch (error) {
      console.error('Помилка завантаження воронок підпроектів:', error);
      alert('Помилка завантаження воронок підпроектів. Спробуйте оновити сторінку.');
    } finally {
      setIsLoadingFunnels(false);
    }
  };

  const createFunnel = async () => {
    if (!newFunnelName.trim()) return;

    setIsLoading(true);
    try {
      const newFunnel = await subProjectFunnelService.create(newFunnelName);
      setFunnels(prev => [...prev, newFunnel]);
      setNewFunnelName('');
      setIsDialogOpen(false);
      alert('Воронку підпроектів успішно створено!');
    } catch (error) {
      console.error('Помилка створення воронки підпроектів:', error);
      alert('Помилка створення воронки підпроектів. Спробуйте ще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFunnel = async (funnelId: number) => {
    if (!confirm('Ви впевнені, що хочете видалити цю воронку підпроектів? Ця дія незворотна.')) {
      return;
    }

    setIsLoading(true);
    try {
      await subProjectFunnelService.delete(funnelId);
      setFunnels(prev => prev.filter(f => f.sub_project_funnel_id !== funnelId));
      alert('Воронку підпроектів успішно видалено!');
    } catch (error) {
      console.error('Помилка видалення воронки підпроектів:', error);
      alert('Помилка видалення воронки підпроектів. Можливо, вона використовується в підпроектах.');
    } finally {
      setIsLoading(false);
    }
  };

  const addStageToFunnel = async (funnelId: number) => {
    if (!newStageName.trim()) return;

    setIsLoading(true);
    try {
      const funnel = funnels.find(f => f.sub_project_funnel_id === funnelId);
      const nextOrder = funnel && funnel.stages ? Math.max(...funnel.stages.map(s => s.order), 0) + 1 : 1;
      
      const newStage = await subProjectFunnelService.createStage(funnelId, newStageName, nextOrder);
      
      setFunnels(prev => prev.map(f => 
        f.sub_project_funnel_id === funnelId 
          ? { ...f, stages: [...(f.stages || []), newStage] }
          : f
      ));
      
      setNewStageName('');
      setActiveNewStageInput(null);
      alert('Етап підпроекту успішно додано!');
    } catch (error) {
      console.error('Помилка додавання етапу підпроекту:', error);
      alert('Помилка додавання етапу підпроекту. Спробуйте ще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStage = async (funnelId: number, stageId: number) => {
    if (!confirm('Ви впевнені, що хочете видалити цей етап підпроекту?')) {
      return;
    }

    setIsLoading(true);
    try {
      await subProjectFunnelService.deleteStage(stageId);
      
      setFunnels(prev => prev.map(f => 
        f.sub_project_funnel_id === funnelId 
          ? { ...f, stages: (f.stages || []).filter(s => s.sub_project_funnel_stage_id !== stageId) }
          : f
      ));
      
      alert('Етап підпроекту успішно видалено!');
    } catch (error) {
      console.error('Помилка видалення етапу підпроекту:', error);
      alert('Помилка видалення етапу підпроекту. Можливо, він використовується в підпроектах.');
    } finally {
      setIsLoading(false);
    }
  };

  const moveStage = async (funnelId: number, stageId: number, direction: 'up' | 'down') => {
    console.log('Moving subproject stage:', { funnelId, stageId, direction });
    
    const funnel = funnels.find(f => f.sub_project_funnel_id === funnelId);
    if (!funnel) {
      console.error('Subproject funnel not found:', funnelId);
      return;
    }

    const sortedStages = [...(funnel.stages || [])].sort((a, b) => a.order - b.order);
    const currentIndex = sortedStages.findIndex(s => s.sub_project_funnel_stage_id === stageId);
    
    console.log('Current subproject stage index:', currentIndex, 'Total stages:', sortedStages.length);
    
    if ((direction === 'up' && currentIndex === 0) || 
        (direction === 'down' && currentIndex === sortedStages.length - 1)) {
      console.log('Cannot move subproject stage in this direction');
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Поміняти місцями етапи в масиві
    const newSortedStages = [...sortedStages];
    [newSortedStages[currentIndex], newSortedStages[newIndex]] = [newSortedStages[newIndex], newSortedStages[currentIndex]];
    
    // Присвоїти нові порядкові номери
    const updatedStages = newSortedStages.map((stage, index) => ({
      ...stage,
      order: index + 1
    }));

    console.log('Updated subproject stages order:', updatedStages.map(s => ({ id: s.sub_project_funnel_stage_id, name: s.name, order: s.order })));

    setMovingStageId(stageId);
    setIsLoading(true);
    try {
      // Оновити локальний стан спочатку для швидкої реакції UI
      setFunnels(prev => prev.map(f => 
        f.sub_project_funnel_id === funnelId 
          ? { ...f, stages: updatedStages }
          : f
      ));

      // Оновити порядок кожного етапу на сервері
      const updatePromises = updatedStages.map(stage => 
        subProjectFunnelService.updateStage(stage.sub_project_funnel_stage_id, { order: stage.order })
      );
      
      await Promise.all(updatePromises);

      console.log('Етапи підпроектів успішно переміщено!');
    } catch (error) {
      console.error('Помилка переміщення етапу підпроекту:', error);
      alert('Помилка переміщення етапу підпроекту. Спробуйте ще раз.');
      // Відновити попередній стан при помилці
      await loadFunnels();
    } finally {
      setIsLoading(false);
      setMovingStageId(null);
    }
  };

  if (isLoadingFunnels) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <p>Завантаження воронок підпроектів...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Воронки підпроектів</h2>
          <p className="text-muted-foreground">
            Налаштуйте воронки та їх етапи для відстеження прогресу підпроектів
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Створити воронку
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Створити нову воронку підпроектів</DialogTitle>
              <DialogDescription>
                Введіть назву для нової воронки підпроектів
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="funnelName">Назва воронки</Label>
                <Input
                  id="funnelName"
                  value={newFunnelName}
                  onChange={(e) => setNewFunnelName(e.target.value)}
                  placeholder="Введіть назву воронки підпроектів"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={createFunnel} disabled={!newFunnelName.trim() || isLoading}>
                  {isLoading ? 'Створення...' : 'Створити'}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Скасувати
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {funnels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Funnel className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Немає воронок підпроектів</p>
            <p className="text-muted-foreground text-center mb-4">
              Створіть першу воронку для відстеження прогресу ваших підпроектів
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {funnels.map((funnel) => (
            <Card key={funnel.sub_project_funnel_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Funnel className="h-5 w-5" />
                      {funnel.name}
                    </CardTitle>
                    <CardDescription>
                      Створено: {new Date(funnel.created_at).toLocaleDateString('uk-UA')}
                      {(funnel.stages?.length || 0) > 0 && (
                        <span className="ml-2">• {funnel.stages?.length || 0} етапів</span>
                      )}
                    </CardDescription>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteFunnel(funnel.sub_project_funnel_id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {(funnel.stages?.length || 0) > 0 ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {(funnel.stages || [])
                        .sort((a, b) => a.order - b.order)
                        .map((stage, index) => (
                          <Badge 
                            key={stage.sub_project_funnel_stage_id} 
                            variant="secondary" 
                            className={`flex items-center gap-2 ${
                              movingStageId === stage.sub_project_funnel_stage_id 
                                ? 'opacity-50 bg-blue-100 dark:bg-blue-900' 
                                : ''
                            }`}
                          >
                            <span>{index + 1}. {stage.name}</span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                                onClick={() => moveStage(funnel.sub_project_funnel_id, stage.sub_project_funnel_stage_id, 'up')}
                                disabled={index === 0 || isLoading || movingStageId === stage.sub_project_funnel_stage_id}
                                title="Перемістити вгору"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                                onClick={() => moveStage(funnel.sub_project_funnel_id, stage.sub_project_funnel_stage_id, 'down')}
                                disabled={index === (funnel.stages?.length || 0) - 1 || isLoading || movingStageId === stage.sub_project_funnel_stage_id}
                                title="Перемістити вниз"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 text-destructive hover:bg-red-100 dark:hover:bg-red-900"
                                onClick={() => deleteStage(funnel.sub_project_funnel_id, stage.sub_project_funnel_stage_id)}
                                disabled={isLoading}
                                title="Видалити етап"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                
                {/* Додавання нового етапу */}
                <div className="flex gap-2 items-end mt-4">
                  <div className="flex-1">
                    <Label htmlFor={`newStage-${funnel.sub_project_funnel_id}`}>
                      {(funnel.stages?.length || 0) === 0 ? 'Назва першого етапу' : 'Додати етап'}
                    </Label>
                    <Input
                      id={`newStage-${funnel.sub_project_funnel_id}`}
                      value={activeNewStageInput === funnel.sub_project_funnel_id ? newStageName : ''}
                      onChange={(e) => {
                        setNewStageName(e.target.value);
                        setActiveNewStageInput(funnel.sub_project_funnel_id);
                      }}
                      placeholder={(funnel.stages?.length || 0) === 0 ? "Наприклад: Планування" : "Назва нового етапу"}
                    />
                  </div>
                  <Button
                    onClick={() => addStageToFunnel(funnel.sub_project_funnel_id)}
                    disabled={!newStageName.trim() || isLoading || activeNewStageInput !== funnel.sub_project_funnel_id}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}