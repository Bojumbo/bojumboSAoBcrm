'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Funnel, Plus, Edit2, Trash2, Save, X, ArrowUp, ArrowDown } from 'lucide-react';
import { funnelService } from '@/services/funnelService';
import { Funnel as FunnelType, FunnelStage } from '@/types/projects';

export default function FunnelSettings() {
  const [funnels, setFunnels] = useState<FunnelType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFunnels, setIsLoadingFunnels] = useState(true);
  const [editingFunnel, setEditingFunnel] = useState<FunnelType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFunnelName, setNewFunnelName] = useState('');
  const [newStageName, setNewStageName] = useState('');
  const [activeNewStageInput, setActiveNewStageInput] = useState<number | null>(null);

  // Завантаження воронок при ініціалізації
  useEffect(() => {
    loadFunnels();
  }, []);

  const loadFunnels = async () => {
    setIsLoadingFunnels(true);
    try {
      const loadedFunnels = await funnelService.getAll();
      setFunnels(loadedFunnels);
    } catch (error) {
      console.error('Помилка завантаження воронок:', error);
      alert('Помилка завантаження воронок. Спробуйте оновити сторінку.');
    } finally {
      setIsLoadingFunnels(false);
    }
  };

  const createFunnel = async () => {
    if (!newFunnelName.trim()) return;

    setIsLoading(true);
    try {
      const newFunnel = await funnelService.create(newFunnelName);
      setFunnels(prev => [...prev, newFunnel]);
      setNewFunnelName('');
      setIsDialogOpen(false);
      alert('Воронку успішно створено!');
    } catch (error) {
      console.error('Помилка створення воронки:', error);
      alert('Помилка створення воронки. Спробуйте ще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFunnel = async (funnelId: number) => {
    if (!confirm('Ви впевнені, що хочете видалити цю воронку? Ця дія незворотна.')) {
      return;
    }

    setIsLoading(true);
    try {
      await funnelService.delete(funnelId);
      setFunnels(prev => prev.filter(f => f.funnel_id !== funnelId));
      alert('Воронку успішно видалено!');
    } catch (error) {
      console.error('Помилка видалення воронки:', error);
      alert('Помилка видалення воронки. Можливо, вона використовується в проектах.');
    } finally {
      setIsLoading(false);
    }
  };

  const addStageToFunnel = async (funnelId: number) => {
    if (!newStageName.trim()) return;

    setIsLoading(true);
    try {
      const funnel = funnels.find(f => f.funnel_id === funnelId);
      const nextOrder = funnel ? funnel.stages.length + 1 : 1;
      
      const newStage = await funnelService.createStage(funnelId, newStageName, nextOrder);
      
      setFunnels(prev => prev.map(f => 
        f.funnel_id === funnelId 
          ? { ...f, stages: [...f.stages, newStage] }
          : f
      ));
      
      setNewStageName('');
      setActiveNewStageInput(null);
      alert('Етап успішно додано!');
    } catch (error) {
      console.error('Помилка додавання етапу:', error);
      alert('Помилка додавання етапу. Спробуйте ще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStage = async (funnelId: number, stageId: number) => {
    if (!confirm('Ви впевнені, що хочете видалити цей етап?')) {
      return;
    }

    setIsLoading(true);
    try {
      await funnelService.deleteStage(stageId);
      
      setFunnels(prev => prev.map(f => 
        f.funnel_id === funnelId 
          ? { ...f, stages: f.stages.filter(s => s.funnel_stage_id !== stageId) }
          : f
      ));
      
      alert('Етап успішно видалено!');
    } catch (error) {
      console.error('Помилка видалення етапу:', error);
      alert('Помилка видалення етапу. Можливо, він використовується в проектах.');
    } finally {
      setIsLoading(false);
    }
  };

  const moveStage = async (funnelId: number, stageId: number, direction: 'up' | 'down') => {
    const funnel = funnels.find(f => f.funnel_id === funnelId);
    if (!funnel) return;

    const sortedStages = [...funnel.stages].sort((a, b) => a.order - b.order);
    const currentIndex = sortedStages.findIndex(s => s.funnel_stage_id === stageId);
    
    if ((direction === 'up' && currentIndex === 0) || 
        (direction === 'down' && currentIndex === sortedStages.length - 1)) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentStage = sortedStages[currentIndex];
    const targetStage = sortedStages[newIndex];

    setIsLoading(true);
    try {
      // Оновлюємо порядок етапів
      await funnelService.updateStage(currentStage.funnel_stage_id, { order: targetStage.order });
      await funnelService.updateStage(targetStage.funnel_stage_id, { order: currentStage.order });

      // Оновлюємо локальний стан
      setFunnels(prev => prev.map(f => 
        f.funnel_id === funnelId 
          ? {
              ...f, 
              stages: f.stages.map(s => {
                if (s.funnel_stage_id === currentStage.funnel_stage_id) {
                  return { ...s, order: targetStage.order };
                }
                if (s.funnel_stage_id === targetStage.funnel_stage_id) {
                  return { ...s, order: currentStage.order };
                }
                return s;
              })
            }
          : f
      ));
    } catch (error) {
      console.error('Помилка переміщення етапу:', error);
      alert('Помилка переміщення етапу. Спробуйте ще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingFunnels) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <p>Завантаження воронок...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Воронки проектів</h2>
          <p className="text-muted-foreground">
            Налаштуйте воронки продажів та їх етапи для відстеження прогресу проектів
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
              <DialogTitle>Створити нову воронку</DialogTitle>
              <DialogDescription>
                Введіть назву для нової воронки продажів
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="funnelName">Назва воронки</Label>
                <Input
                  id="funnelName"
                  value={newFunnelName}
                  onChange={(e) => setNewFunnelName(e.target.value)}
                  placeholder="Введіть назву воронки"
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
            <p className="text-lg font-medium mb-2">Немає воронок</p>
            <p className="text-muted-foreground text-center mb-4">
              Створіть першу воронку для відстеження прогресу ваших проектів
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {funnels.map((funnel) => (
            <Card key={funnel.funnel_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Funnel className="h-5 w-5" />
                      {funnel.name}
                    </CardTitle>
                    <CardDescription>
                      Створено: {new Date(funnel.created_at).toLocaleDateString('uk-UA')}
                      {funnel.stages.length > 0 && (
                        <span className="ml-2">• {funnel.stages.length} етапів</span>
                      )}
                    </CardDescription>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteFunnel(funnel.funnel_id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {funnel.stages.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {funnel.stages
                        .sort((a, b) => a.order - b.order)
                        .map((stage, index) => (
                          <Badge key={stage.funnel_stage_id} variant="secondary" className="flex items-center gap-2">
                            <span>{index + 1}. {stage.name}</span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={() => moveStage(funnel.funnel_id, stage.funnel_stage_id, 'up')}
                                disabled={index === 0 || isLoading}
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={() => moveStage(funnel.funnel_id, stage.funnel_stage_id, 'down')}
                                disabled={index === funnel.stages.length - 1 || isLoading}
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 text-destructive"
                                onClick={() => deleteStage(funnel.funnel_id, stage.funnel_stage_id)}
                                disabled={isLoading}
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
                    <Label htmlFor={`newStage-${funnel.funnel_id}`}>
                      {funnel.stages.length === 0 ? 'Назва першого етапу' : 'Додати етап'}
                    </Label>
                    <Input
                      id={`newStage-${funnel.funnel_id}`}
                      value={activeNewStageInput === funnel.funnel_id ? newStageName : ''}
                      onChange={(e) => {
                        setNewStageName(e.target.value);
                        setActiveNewStageInput(funnel.funnel_id);
                      }}
                      placeholder={funnel.stages.length === 0 ? "Наприклад: Лід" : "Назва нового етапу"}
                    />
                  </div>
                  <Button
                    onClick={() => addStageToFunnel(funnel.funnel_id)}
                    disabled={!newStageName.trim() || isLoading || activeNewStageInput !== funnel.funnel_id}
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