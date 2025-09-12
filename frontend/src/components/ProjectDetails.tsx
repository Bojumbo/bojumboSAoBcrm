'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Building2, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  FolderOpen, 
  ShoppingCart, 
  Package, 
  CheckSquare,
  Edit,
  UserPlus,
  Mail,
  Phone,
  Save,
  X
} from 'lucide-react';
import { 
  Project, 
  ProjectComment, 
  SubProject, 
  Sale, 
  ProjectProduct, 
  Task,
  Manager,
  Counterparty
} from '@/types/projects';

interface ProjectDetailsProps {
  projectId: number;
}

export default function ProjectDetails({ projectId }: ProjectDetailsProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<ProjectProduct[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  
  // Стейт для режиму редагування
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    forecast_amount: '',
    description: '',
    counterparty_id: '0',
    main_responsible_manager_id: '0'
  });
  
  // Списки для селектів
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  
  // Стейт для пошуку
  const [counterpartySearch, setCounterpartySearch] = useState('');
  const [managerSearch, setManagerSearch] = useState('');
  const [showCounterpartyDropdown, setShowCounterpartyDropdown] = useState(false);
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);

  // Refs для випадаючих списків
  const counterpartyRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<HTMLDivElement>(null);

  // Закриття випадаючих списків при кліку поза ними
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (counterpartyRef.current && !counterpartyRef.current.contains(event.target as Node)) {
        setShowCounterpartyDropdown(false);
      }
      if (managerRef.current && !managerRef.current.contains(event.target as Node)) {
        setShowManagerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Очищуємо стейт при зміні проекту
    setProject(null);
    setComments([]);
    setSubProjects([]);
    setSales([]);
    setProducts([]);
    setTasks([]);
    
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setDataLoading(true);
      
      // Спробуємо завантажити з кешу спочатку
      const cacheKey = `project_${projectId}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      
      if (cachedData) {
        try {
          const project = JSON.parse(cachedData);
          setProject(project);
          setLoading(false);
          
          setTimeout(() => {
            setComments(project.comments || []);
            setSubProjects(project.subprojects || []);
            setSales(project.sales || []);
            setProducts(project.products || []);
            setTasks(project.tasks || []);
            setDataLoading(false);
          }, 50);
        } catch (e) {
          // Якщо кеш пошкоджений, видаляємо його
          sessionStorage.removeItem(cacheKey);
        }
      }
      
      // Завантажуємо свіжі дані з сервера
      const projectResponse = await fetch(`/api/projects/${projectId}`);
      const projectData = await projectResponse.json();
      
      if (projectData.success && projectData.data) {
        const project = projectData.data;
        
        // Кешуємо дані на поточну сесію
        sessionStorage.setItem(cacheKey, JSON.stringify(project));
        
        // Встановлюємо основні дані проекту негайно
        setProject(project);
        setLoading(false);
        
        // Потім встановлюємо пов'язані дані
        setTimeout(() => {
          setComments(project.comments || []);
          setSubProjects(project.subprojects || []);
          setSales(project.sales || []);
          setProducts(project.products || []);
          setTasks(project.tasks || []);
          setDataLoading(false);
        }, 100);
      } else {
        setLoading(false);
        setDataLoading(false);
      }

    } catch (error) {
      console.error('Помилка завантаження даних проекту:', error);
      setLoading(false);
      setDataLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setNewComment('');
        // Додаємо новий коментар до списку замість перезавантаження всіх даних
        setComments(prev => [...prev, data.data]);
        
        // Оновлюємо кеш
        const cacheKey = `project_${projectId}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData && project) {
          try {
            const cachedProject = JSON.parse(cachedData);
            cachedProject.comments = [...(cachedProject.comments || []), data.data];
            sessionStorage.setItem(cacheKey, JSON.stringify(cachedProject));
          } catch (e) {
            // Якщо помилка з кешем, просто видаляємо його
            sessionStorage.removeItem(cacheKey);
          }
        }
      }
    } catch (error) {
      console.error('Помилка додавання коментаря:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH'
    }).format(parseFloat(amount));
  };

  // Функції для режиму редагування
  const loadCounterpartiesAndManagers = async () => {
    try {
      console.log('Завантаження контрагентів та менеджерів...');
      
      const [counterpartiesRes, managersRes] = await Promise.all([
        fetch('/api/counterparties'),
        fetch('/api/managers')
      ]);
      
      console.log('Контрагенти відповідь:', counterpartiesRes.status);
      console.log('Менеджери відповідь:', managersRes.status);
      
      const counterpartiesData = await counterpartiesRes.json();
      const managersData = await managersRes.json();
      
      console.log('Дані контрагентів:', counterpartiesData);
      console.log('Дані менеджерів:', managersData);
      
      if (counterpartiesData.success) {
        setCounterparties(counterpartiesData.data);
        console.log('Контрагенти встановлені:', counterpartiesData.data.length);
      }
      
      if (managersData.success) {
        setManagers(managersData.data);
        console.log('Менеджери встановлені:', managersData.data.length);
      }
    } catch (error) {
      console.error('Помилка завантаження списків:', error);
    }
  };

  const handleEditStart = async () => {
    if (!project) return;
    
    console.log('Початок редагування проекту');
    
    // Завантажуємо списки контрагентів та менеджерів
    await loadCounterpartiesAndManagers();
    
    // Заповнюємо форму поточними даними
    const counterpartyId = project.counterparty?.counterparty_id?.toString() || '0';
    const managerId = project.main_responsible_manager?.manager_id?.toString() || '0';
    
    setEditForm({
      name: project.name,
      forecast_amount: project.forecast_amount,
      description: project.description || '',
      counterparty_id: counterpartyId,
      main_responsible_manager_id: managerId
    });
    
    // Встановлюємо початкові значення для пошукових полів
    setCounterpartySearch(project.counterparty ? project.counterparty.name : '');
    setManagerSearch(project.main_responsible_manager ? 
      `${project.main_responsible_manager.first_name} ${project.main_responsible_manager.last_name}` : '');
    
    console.log('Форма заповнена, перехід до режиму редагування');
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: '',
      forecast_amount: '',
      description: '',
      counterparty_id: '0',
      main_responsible_manager_id: '0'
    });
    setCounterpartySearch('');
    setManagerSearch('');
    setShowCounterpartyDropdown(false);
    setShowManagerDropdown(false);
  };

  const handleEditSave = async () => {
    if (!project) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          forecast_amount: editForm.forecast_amount,
          description: editForm.description,
          counterparty_id: editForm.counterparty_id && editForm.counterparty_id !== '0' ? parseInt(editForm.counterparty_id) : null,
          main_responsible_manager_id: editForm.main_responsible_manager_id && editForm.main_responsible_manager_id !== '0' ? parseInt(editForm.main_responsible_manager_id) : null
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Оновлюємо проект в стейті
        setProject(data.data);
        
        // Оновлюємо кеш
        const cacheKey = `project_${projectId}`;
        sessionStorage.setItem(cacheKey, JSON.stringify(data.data));
        
        setIsEditing(false);
        
        // Перезавантажуємо дані для отримання оновлених зв'язків
        loadProjectData();
      }
    } catch (error) {
      console.error('Помилка збереження проекту:', error);
    }
  };

  // Функції для пошуку
  const filteredCounterparties = counterparties.filter(counterparty => {
    const searchTerm = counterpartySearch.toLowerCase();
    return (
      counterparty.name.toLowerCase().includes(searchTerm) ||
      (counterparty.phone && counterparty.phone.toLowerCase().includes(searchTerm)) ||
      (counterparty.email && counterparty.email.toLowerCase().includes(searchTerm))
    );
  });

  const filteredManagers = managers.filter(manager => {
    const searchTerm = managerSearch.toLowerCase();
    return (
      manager.first_name.toLowerCase().includes(searchTerm) ||
      manager.last_name.toLowerCase().includes(searchTerm) ||
      (manager.email && manager.email.toLowerCase().includes(searchTerm)) ||
      manager.role.toLowerCase().includes(searchTerm)
    );
  });

  const getCounterpartyDisplayName = (counterpartyId: string) => {
    if (counterpartyId === '0') return '';
    const counterparty = counterparties.find(c => c.counterparty_id.toString() === counterpartyId);
    return counterparty ? counterparty.name : '';
  };

  const getManagerDisplayName = (managerId: string) => {
    if (managerId === '0') return '';
    const manager = managers.find(m => m.manager_id.toString() === managerId);
    return manager ? `${manager.first_name} ${manager.last_name}` : '';
  };

  const handleCounterpartySelect = (counterparty: Counterparty | null) => {
    const id = counterparty ? counterparty.counterparty_id.toString() : '0';
    setEditForm(prev => ({ ...prev, counterparty_id: id }));
    setCounterpartySearch(counterparty ? counterparty.name : '');
    setShowCounterpartyDropdown(false);
  };

  const handleManagerSelect = (manager: Manager | null) => {
    const id = manager ? manager.manager_id.toString() : '0';
    setEditForm(prev => ({ ...prev, main_responsible_manager_id: id }));
    setManagerSearch(manager ? `${manager.first_name} ${manager.last_name}` : '');
    setShowManagerDropdown(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Завантаження...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-red-600">Проект не знайдено</div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Основний вміст */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {isEditing ? (
              <div className="flex-1 mr-4">
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="text-3xl font-bold text-gray-900 border-0 bg-transparent p-0 focus:ring-2 focus:ring-blue-500"
                  placeholder="Назва проекту"
                />
              </div>
            ) : (
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            )}
            
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleEditCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Скасувати
                </Button>
                <Button size="sm" onClick={handleEditSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Зберегти
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={handleEditStart}>
                <Edit className="w-4 h-4 mr-2" />
                Редагувати
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Створено: {formatDate(project.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {isEditing ? (
                <Input
                  value={editForm.forecast_amount}
                  onChange={(e) => setEditForm(prev => ({ ...prev, forecast_amount: e.target.value }))}
                  className="w-32 h-6 text-sm"
                  placeholder="Сума"
                  type="number"
                  step="0.01"
                />
              ) : (
                formatCurrency(project.forecast_amount)
              )}
            </span>
          </div>
        </div>

        <Tabs defaultValue="comments" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Чат
            </TabsTrigger>
            <TabsTrigger value="subprojects" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Підпроекти
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Продажі
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Товари
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Завдання
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Коментарі менеджерів</CardTitle>
              </CardHeader>
              <CardContent>
                {dataLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-sm text-gray-500">Завантаження коментарів...</div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {comments.map((comment) => (
                        <div key={comment.comment_id} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">
                              {comment.manager.first_name} {comment.manager.last_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                          {comment.file_name && (
                            <div className="mt-2">
                              <a 
                                href={comment.file_url} 
                                className="text-blue-600 hover:underline text-sm"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                📎 {comment.file_name}
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Додати коментар..."
                        className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                      <div className="flex justify-end mt-2">
                        <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                          Додати коментар
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subprojects" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Підпроекти</CardTitle>
                  <Button size="sm">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Додати підпроект
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subProjects.map((subProject) => (
                    <div key={subProject.subproject_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{subProject.name}</h3>
                        <Badge variant={subProject.status === 'completed' ? 'default' : 'secondary'}>
                          {subProject.status || 'Активний'}
                        </Badge>
                      </div>
                      {subProject.description && (
                        <p className="text-gray-600 text-sm mb-2">{subProject.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Вартість: {formatCurrency(subProject.cost)}</span>
                        <span>Створено: {formatDate(subProject.created_at)}</span>
                      </div>
                    </div>
                  ))}
                  {subProjects.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Немає підпроектів
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Продажі</CardTitle>
                  <Button size="sm">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Додати продаж
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sales.map((sale) => (
                    <div key={sale.sale_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{sale.counterparty.name}</h3>
                        <Badge variant={sale.status === 'completed' ? 'default' : 'secondary'}>
                          {sale.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Дата продажу: {formatDate(sale.sale_date)}</span>
                        <span>Створено: {formatDate(sale.created_at)}</span>
                      </div>
                    </div>
                  ))}
                  {sales.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Немає продажів
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Товари</CardTitle>
                  <Button size="sm">
                    <Package className="w-4 h-4 mr-2" />
                    Додати товар
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((projectProduct) => (
                    <div key={projectProduct.project_product_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{projectProduct.product.name}</h3>
                        <span className="font-medium">{formatCurrency(projectProduct.product.price)}</span>
                      </div>
                      {projectProduct.product.description && (
                        <p className="text-gray-600 text-sm mb-2">{projectProduct.product.description}</p>
                      )}
                      <div className="text-sm text-gray-500">
                        Кількість: {projectProduct.quantity}
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Немає товарів
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Завдання</CardTitle>
                  <Button size="sm">
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Додати завдання
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.task_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{task.title}</h3>
                        <Badge variant={task.status === 'done' ? 'default' : 'secondary'}>
                          {task.status === 'new' ? 'Нове' : 
                           task.status === 'in_progress' ? 'В роботі' :
                           task.status === 'done' ? 'Виконано' :
                           task.status === 'blocked' ? 'Заблоковано' : 'Скасовано'}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        {task.responsible_manager && (
                          <span>
                            Відповідальний: {task.responsible_manager.first_name} {task.responsible_manager.last_name}
                          </span>
                        )}
                        {task.due_date && (
                          <span>Термін: {formatDate(task.due_date)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Немає завдань
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Права панель з інформацією про проект */}
      <div className="w-80 bg-white border-l p-6">
        <div className="space-y-6">
          {/* Опис проекту */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Опис проекту</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows={4}
                  placeholder="Опис проекту..."
                />
              ) : (
                project.description ? (
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {project.description}
                  </p>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">Опис відсутній</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={handleEditStart}>
                      Додати опис
                    </Button>
                  </div>
                )
              )}
            </CardContent>
          </Card>

          {/* Контрагент */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="w-5 h-5" />
                Контрагент
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-3 relative">
                  <div className="relative" ref={counterpartyRef}>
                    <Input
                      value={counterpartySearch}
                      onChange={(e) => {
                        setCounterpartySearch(e.target.value);
                        setShowCounterpartyDropdown(true);
                      }}
                      onFocus={() => setShowCounterpartyDropdown(true)}
                      placeholder="Пошук контрагента за назвою, телефоном або емейлом..."
                      className="w-full"
                    />
                    
                    {showCounterpartyDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <div 
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b"
                          onClick={() => handleCounterpartySelect(null)}
                        >
                          <span className="text-gray-500">Без контрагента</span>
                        </div>
                        {filteredCounterparties.map((counterparty) => (
                          <div
                            key={counterparty.counterparty_id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b"
                            onClick={() => handleCounterpartySelect(counterparty)}
                          >
                            <div className="font-medium">{counterparty.name}</div>
                            <div className="text-sm text-gray-500">
                              {counterparty.phone && <span>📞 {counterparty.phone}</span>}
                              {counterparty.phone && counterparty.email && <span> • </span>}
                              {counterparty.email && <span>✉️ {counterparty.email}</span>}
                            </div>
                          </div>
                        ))}
                        {filteredCounterparties.length === 0 && counterpartySearch && (
                          <div className="px-3 py-2 text-gray-500">
                            Контрагентів не знайдено
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                project.counterparty ? (
                  <div className="space-y-3">
                    {/* Назва */}
                    <div>
                      <h3 className="font-medium text-gray-900">{project.counterparty.name}</h3>
                    </div>
                    
                    {/* Емейл */}
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {project.counterparty.email || 'Не вказано'}
                      </span>
                    </div>
                    
                    {/* Номер телефону */}
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {project.counterparty.phone || 'Не вказано'}
                      </span>
                    </div>
                    
                    {/* Тип контрагента */}
                    <div>
                      <Badge variant="outline">
                        {project.counterparty.counterparty_type === 'INDIVIDUAL' ? 'Фізична особа' : 'Юридична особа'}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">Контрагент не призначений</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={handleEditStart}>
                      Призначити контрагента
                    </Button>
                  </div>
                )
              )}
            </CardContent>
          </Card>

          {/* Відповідальний менеджер */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                Відповідальний
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-3 relative">
                  <div className="relative" ref={managerRef}>
                    <Input
                      value={managerSearch}
                      onChange={(e) => {
                        setManagerSearch(e.target.value);
                        setShowManagerDropdown(true);
                      }}
                      onFocus={() => setShowManagerDropdown(true)}
                      placeholder="Пошук менеджера за ім'ям, прізвищем, емейлом або посадою..."
                      className="w-full"
                    />
                    
                    {showManagerDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <div 
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b"
                          onClick={() => handleManagerSelect(null)}
                        >
                          <span className="text-gray-500">Без відповідального</span>
                        </div>
                        {filteredManagers.map((manager) => (
                          <div
                            key={manager.manager_id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b"
                            onClick={() => handleManagerSelect(manager)}
                          >
                            <div className="font-medium">{manager.first_name} {manager.last_name}</div>
                            <div className="text-sm text-gray-500">
                              <span>{manager.role}</span>
                              {manager.email && <span> • ✉️ {manager.email}</span>}
                            </div>
                          </div>
                        ))}
                        {filteredManagers.length === 0 && managerSearch && (
                          <div className="px-3 py-2 text-gray-500">
                            Менеджерів не знайдено
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                project.main_responsible_manager ? (
                  <div>
                    <h3 className="font-medium">
                      {project.main_responsible_manager.first_name} {project.main_responsible_manager.last_name}
                    </h3>
                    <Badge variant="outline" className="mt-1">
                      {project.main_responsible_manager.role}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2">
                      ✉️ {project.main_responsible_manager.email}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">Відповідальний не призначений</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={handleEditStart}>
                      Призначити відповідального
                    </Button>
                  </div>
                )
              )}
            </CardContent>
          </Card>

          {/* Додаткові менеджери */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="w-5 h-5" />
                Додаткові менеджери
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.secondary_responsible_managers && project.secondary_responsible_managers.length > 0 ? (
                <div className="space-y-3">
                  {project.secondary_responsible_managers.map((pm, index) => (
                    <div key={index}>
                      <h4 className="font-medium text-sm">
                        {pm.manager.first_name} {pm.manager.last_name}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {pm.manager.role}
                      </Badge>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Додати менеджера
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">Немає додаткових менеджерів</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Додати менеджера
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
