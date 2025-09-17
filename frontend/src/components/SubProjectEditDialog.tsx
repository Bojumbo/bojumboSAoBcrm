// Кастомний компонент для ієрархічного вибору з розкриванням
import { ChevronDown, ChevronRight } from 'lucide-react';

function TreeSelectContent({ tree, selectedValue, onSelect }: {
  tree: (ProjectNode | SubprojectNode)[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  const [openIds, setOpenIds] = React.useState<Set<string | number>>(new Set());
  const [search, setSearch] = React.useState('');
  // Фільтрація дерева по назві
  function filterTree(nodes: (ProjectNode | SubprojectNode)[], path: (string | number)[] = []): { filtered: (ProjectNode | SubprojectNode)[], openIds: Set<string | number> } {
    let openSet = new Set<string | number>();
    const filtered = nodes
      .map(node => {
        const match = node.name.toLowerCase().includes(search.toLowerCase());
        const nodeValue = node.type === 'project' ? `project_${node.id}` : `subproject_${node.id}`;
        const filteredChildren = node.children ? filterTree(node.children, [...path, nodeValue]) : { filtered: [], openIds: new Set() };
        if (match || filteredChildren.filtered.length > 0) {
          // Якщо знайдено дочірній вузол, додаємо поточний вузол у openIds
          if (filteredChildren.filtered.length > 0) {
            openSet.add(nodeValue);
            filteredChildren.openIds.forEach(id => openSet.add(id as string | number));
          }
          return { ...node, children: filteredChildren.filtered };
        }
        return null;
      })
      .filter(Boolean) as (ProjectNode | SubprojectNode)[];
    return { filtered, openIds: openSet };
  }
  const { filtered: filteredTree, openIds: autoOpenIds } = search.trim() ? filterTree(tree) : { filtered: tree, openIds: new Set<string | number>() };
  // Автоматично відкривати вузли при пошуку
  React.useEffect(() => {
    if (search.trim()) {
      setOpenIds(new Set<string | number>(Array.from(autoOpenIds)));
    }
  }, [search, tree]);
  const toggleOpen = (id: string | number) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const renderNode = (node: ProjectNode | SubprojectNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const nodeValue = node.type === 'project' ? `project_${node.id}` : `subproject_${node.id}`;
    const isOpen = openIds.has(nodeValue);
    return (
      <div key={nodeValue} style={{ paddingLeft: `${level * 20}px` }} className="flex flex-col">
        <div className="flex items-center gap-2">
          {hasChildren && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); toggleOpen(nodeValue); }}
              className="w-5 h-5 flex items-center justify-center"
              tabIndex={-1}
            >
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          <div
            className={`text-left w-full px-2 py-1 rounded cursor-pointer select-none ${selectedValue === nodeValue ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => onSelect(nodeValue)}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onSelect(nodeValue); }}
          >
            {node.name}
          </div>
        </div>
        {hasChildren && isOpen && (
          <div className="ml-4">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="py-1">
      <div className="px-2 pb-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Пошук..."
          className="w-full px-2 py-1 border rounded"
        />
      </div>
      {filteredTree.length === 0 ? (
        <div className="px-2 py-2 text-muted-foreground text-sm">Нічого не знайдено</div>
      ) : (
        filteredTree.map(node => renderNode(node))
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubProject, SubProjectFunnel } from '@/types/projects';
import { subprojectsAPI, subprojectFunnelsAPI } from '@/lib/api';

// Побудова дерева підпроектів
interface ProjectNode {
  type: 'project';
  id: number;
  name: string;
  children: SubprojectNode[];
}
interface SubprojectNode {
  type: 'subproject';
  id: number;
  name: string;
  level: number;
  children: SubprojectNode[];
}
function buildSubprojectTree(
  projects: Array<{ project_id: number; name: string }>,
  subprojects: Array<{ subproject_id: number; name: string; project_id: number | null; parent_subproject_id?: number | null }>
): ProjectNode[] {
  // Створюємо мапу підпроектів за parent_subproject_id
  const subMap: Record<string | number, Array<{ subproject_id: number; name: string; project_id: number | null; parent_subproject_id?: number | null }>> = {};
  subprojects.forEach((sp) => {
    // Якщо є parent_subproject_id — це дочірній підпроект
    if (sp.parent_subproject_id !== null && sp.parent_subproject_id !== undefined) {
      if (!subMap[sp.parent_subproject_id]) subMap[sp.parent_subproject_id] = [];
      subMap[sp.parent_subproject_id].push(sp);
    } else if (sp.project_id !== null && sp.project_id !== undefined) {
      // Якщо немає parent_subproject_id, але є project_id — це підпроект першого рівня
      const key = `project_${sp.project_id}`;
      if (!subMap[key]) subMap[key] = [];
      subMap[key].push(sp);
    }
  });
  // Рекурсивно будуємо дерево для кожного проекту
  function buildSubTreeRec(parentId: string | number, level: number = 1): SubprojectNode[] {
    return (subMap[parentId] || []).map(sp => ({
      type: 'subproject',
      id: sp.subproject_id,
      name: sp.name,
      level,
      children: buildSubTreeRec(sp.subproject_id, level + 1)
    }));
  }
  const tree: ProjectNode[] = projects.map(project => ({
    type: 'project' as const,
    id: project.project_id,
    name: project.name,
    children: buildSubTreeRec(`project_${project.project_id}`, 1)
  }));
  console.log('Subproject tree:', tree);
  return tree;
}
function buildSubTree(
  subproject: { subproject_id: number; name: string; project_id: number; parent_subproject_id?: number | null },
  subMap: Record<string | number, Array<{ subproject_id: number; name: string; project_id: number; parent_subproject_id?: number | null }>>,
  level: number = 1
): SubprojectNode {
  return {
    type: 'subproject',
    id: subproject.subproject_id,
    name: subproject.name,
    level,
    children: (subMap[subproject.subproject_id] || []).map((sp) => buildSubTree(sp, subMap, level + 1))
  };
}
function renderTreeOptions(tree: (ProjectNode | SubprojectNode)[], level: number = 0): React.ReactNode[] {
  return tree.map((node) => [
    <SelectItem
      key={(node.type === 'project' ? 'p_' : 'sp_') + node.id}
      value={(node.type === 'project' ? 'project_' : 'subproject_') + node.id}
      style={{ paddingLeft: `${level * 20}px` }}
    >
      {node.name}
    </SelectItem>,
    ...renderTreeOptions(node.children || [], level + 1)
  ]).flat();
}

interface SubProjectEditDialogProps {
  subproject?: SubProject;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSubproject: SubProject) => void;
  mode: 'create' | 'edit';
  projectId?: number;
  parentSubprojectId?: number;
  availableProjects?: Array<{ project_id: number; name: string }>;
  availableSubprojects?: Array<{ subproject_id: number; name: string; project_id: number | null; parent_subproject_id?: number | null }>; 
}

export default function SubProjectEditDialog({
  subproject,
  isOpen,
  onClose,
  onSave,
  mode,
  projectId,
  parentSubprojectId,
  availableProjects = [],
  availableSubprojects = [],
}: SubProjectEditDialogProps) {
  console.log('availableSubprojects:', availableSubprojects);
  const [formData, setFormData] = useState({
    name: subproject?.name || '',
    description: subproject?.description || '',
    cost: subproject?.cost?.toString() || '',
    sub_project_funnel_id: subproject?.sub_project_funnel_id?.toString() || 'none',
    sub_project_funnel_stage_id: subproject?.sub_project_funnel_stage_id?.toString() || 'none',
    project_id: projectId ?? subproject?.project_id ?? null,
    parent_subproject_id: parentSubprojectId ?? subproject?.parent_subproject_id ?? null,
  });

  const [funnels, setFunnels] = useState<SubProjectFunnel[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
    // Стан для керування відкриттям Select
    const [treeSelectOpen, setTreeSelectOpen] = useState(false);

  // Скидання форми при відкритті діалогу
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: subproject?.name || '',
        description: subproject?.description || '',
        cost: subproject?.cost?.toString() || '',
        sub_project_funnel_id: subproject?.sub_project_funnel_id?.toString() || 'none',
        sub_project_funnel_stage_id: subproject?.sub_project_funnel_stage_id?.toString() || 'none',
        project_id: projectId ?? subproject?.project_id ?? null,
        parent_subproject_id: parentSubprojectId ?? subproject?.parent_subproject_id ?? null,
      });
      fetchFunnels();
    }
  }, [isOpen, subproject, projectId, parentSubprojectId]);

  const fetchFunnels = async () => {
    try {
      setLoading(true);
      const response = await subprojectFunnelsAPI.getAll();
      if (response.success && response.data) {
        setFunnels(response.data);
      }
    } catch (error) {
      console.error('Error fetching funnels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: any = {
        name: formData.name,
        description: formData.description || undefined,
        cost: formData.cost,
        sub_project_funnel_id: formData.sub_project_funnel_id === 'none' ? undefined : parseInt(formData.sub_project_funnel_id),
        sub_project_funnel_stage_id: formData.sub_project_funnel_stage_id === 'none' ? undefined : parseInt(formData.sub_project_funnel_stage_id),
      };
      if (mode === 'create') {
        if (formData.project_id) payload.project_id = formData.project_id;
        if (formData.parent_subproject_id) payload.parent_subproject_id = formData.parent_subproject_id;
        // Викликати API створення
        const response = await subprojectsAPI.create(payload);
        if (response.success && response.data) {
          onSave(response.data);
        } else {
          throw new Error(response.error || 'Помилка створення підпроекту');
        }
      } else {
        // Оновлення
        const response = await subprojectsAPI.update(subproject!.subproject_id, payload);
        if (response.success && response.data) {
          onSave(response.data);
        } else {
          throw new Error(response.error || 'Помилка оновлення підпроекту');
        }
      }
    } catch (error) {
      console.error('Error saving subproject:', error);
      alert('Помилка при збереженні підпроекту. Спробуйте ще раз.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    // Скидаємо форму до початкових значень
    setFormData({
      name: subproject?.name || '',
      description: subproject?.description || '',
      cost: subproject?.cost?.toString() || '',
      sub_project_funnel_id: subproject?.sub_project_funnel_id?.toString() || 'none',
      sub_project_funnel_stage_id: subproject?.sub_project_funnel_stage_id?.toString() || 'none',
      project_id: projectId ?? subproject?.project_id ?? null,
      parent_subproject_id: parentSubprojectId ?? subproject?.parent_subproject_id ?? null,
    });
    onClose();
  };

  const isFormValid = () => {
    return formData.name.trim() && 
           formData.cost && 
           !isNaN(parseFloat(formData.cost)) && 
           parseFloat(formData.cost) >= 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редагувати підпроект</DialogTitle>
          <DialogDescription>
            Внесіть зміни до підпроекту "{subproject?.name || ''}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Назва підпроекту */}
          <div className="space-y-2">
            <Label htmlFor="name">Назва підпроекту *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Введіть назву підпроекту"
              className="w-full"
            />
          </div>

          {/* Опис */}
          <div className="space-y-2">
            <Label htmlFor="description">Опис</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Введіть опис підпроекту"
              className="w-full min-h-[100px]"
            />
          </div>

          {/* Вартість, воронка та етап */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Вартість */}
            <div className="space-y-2">
              <Label htmlFor="cost">Вартість (₴) *</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', e.target.value)}
                placeholder="0.00"
                className="w-full"
              />
            </div>

            {/* Воронка */}
            <div className="space-y-2">
              <Label htmlFor="funnel">Воронка</Label>
              <Select
                value={formData.sub_project_funnel_id}
                onValueChange={(value) => {
                  handleInputChange('sub_project_funnel_id', value);
                  // Скидаємо етап при зміні воронки
                  handleInputChange('sub_project_funnel_stage_id', 'none');
                }}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Виберіть воронку" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не вибрано</SelectItem>
                  {funnels.map((funnel) => (
                    <SelectItem key={funnel.sub_project_funnel_id} value={funnel.sub_project_funnel_id.toString()}>
                      {funnel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Етап воронки */}
            <div className="space-y-2">
              <Label htmlFor="stage">Етап</Label>
              <Select
                value={formData.sub_project_funnel_stage_id}
                onValueChange={(value) => handleInputChange('sub_project_funnel_stage_id', value)}
                disabled={loading || formData.sub_project_funnel_id === 'none'}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Виберіть етап" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не вибрано</SelectItem>
                  {formData.sub_project_funnel_id !== 'none' && 
                    funnels
                      .find(f => f.sub_project_funnel_id.toString() === formData.sub_project_funnel_id)
                      ?.stages?.map((stage) => (
                        <SelectItem 
                          key={stage.sub_project_funnel_stage_id} 
                          value={stage.sub_project_funnel_stage_id.toString()}
                        >
                          {stage.name}
                        </SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Єдине поле вибору проекту/підпроекту (ієрархічно) */}
          {mode === 'create' && !projectId && !parentSubprojectId && (
            <div className="space-y-2">
              <Label htmlFor="tree_select">Проект або підпроект</Label>
                <Select
                  open={treeSelectOpen}
                  onOpenChange={setTreeSelectOpen}
                  value={formData.parent_subproject_id ? `subproject_${formData.parent_subproject_id}` : (formData.project_id ? `project_${formData.project_id}` : 'none')}
                  onValueChange={value => {
                    if (value.startsWith('project_')) {
                      setFormData(f => ({ ...f, project_id: parseInt(value.replace('project_', '')), parent_subproject_id: null }));
                    } else if (value.startsWith('subproject_')) {
                      setFormData(f => ({ ...f, parent_subproject_id: parseInt(value.replace('subproject_', '')), project_id: null }));
                    } else {
                      setFormData(f => ({ ...f, project_id: null, parent_subproject_id: null }));
                    }
                    setTreeSelectOpen(false); // Закриваємо Select після вибору
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Оберіть проект або підпроект">
                      {(() => {
                        const value = formData.parent_subproject_id ? `subproject_${formData.parent_subproject_id}` : (formData.project_id ? `project_${formData.project_id}` : 'none');
                        if (value === 'none') return 'Не вибрано';
                        // Шукаємо назву вибраного вузла
                        if (value.startsWith('project_')) {
                          const project = availableProjects.find(p => `project_${p.project_id}` === value);
                          return project ? `Проект: ${project.name}` : value;
                        }
                        if (value.startsWith('subproject_')) {
                          const subproject = availableSubprojects.find(sp => `subproject_${sp.subproject_id}` === value);
                          return subproject ? `Підпроект: ${subproject.name}` : value;
                        }
                        return value;
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Не вибрано</SelectItem>
                    <TreeSelectContent
                      tree={buildSubprojectTree(availableProjects, availableSubprojects)}
                      selectedValue={formData.parent_subproject_id ? `subproject_${formData.parent_subproject_id}` : (formData.project_id ? `project_${formData.project_id}` : 'none')}
                      onSelect={value => {
                        if (value.startsWith('project_')) {
                          setFormData(f => ({ ...f, project_id: parseInt(value.replace('project_', '')), parent_subproject_id: null }));
                        } else if (value.startsWith('subproject_')) {
                          setFormData(f => ({ ...f, parent_subproject_id: parseInt(value.replace('subproject_', '')), project_id: null }));
                        } else {
                          setFormData(f => ({ ...f, project_id: null, parent_subproject_id: null }));
                        }
                        setTreeSelectOpen(false); // Закриваємо Select після вибору
                      }}
                    />
                  </SelectContent>
                </Select>
            </div>
          )}
          {/* Інформація про проект/підпроект */}
          {mode === 'edit' && (
            <div className="p-4 bg-gray-50 rounded-lg">
              {subproject?.project_id && (
                <>
                  <Label className="text-sm font-medium text-gray-700">
                    Проект: #{subproject.project_id}
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Підпроект належить до проекту з ID {subproject.project_id}
                  </p>
                </>
              )}
              {subproject?.parent_subproject_id && (
                <>
                  <Label className="text-sm font-medium text-gray-700">
                    Батьківський підпроект: #{subproject.parent_subproject_id}
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Підпроект належить до підпроекту з ID {subproject.parent_subproject_id}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Кнопки дій */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={saving}
          >
            Скасувати
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !isFormValid()}
          >
            {saving ? 'Збереження...' : 'Зберегти'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}