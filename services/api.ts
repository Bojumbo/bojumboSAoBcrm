import { Manager, Counterparty, Product, Service, Warehouse, Sale, Project, SubProject, Task, CounterpartyType, Unit, SaleStatusType, SubProjectStatusType, ProjectProduct, ProjectService, ProjectComment, ProductStock, Funnel, FunnelStage, SubProjectComment, SubProjectProduct, SubProjectService } from '../types';

let currentUser: Manager | null = null;

// In-memory database
let managers: Manager[] = [
  { manager_id: 1, first_name: 'Admin', last_name: 'User', email: 'admin@example.com', phone_number: '000-000-0000', role: 'admin', supervisor_ids: [] },
  { manager_id: 2, first_name: 'Іван', last_name: 'Петров', email: 'ivan.p@example.com', phone_number: '123-456-7890', role: 'head', supervisor_ids: [1] },
  { manager_id: 3, first_name: 'Марія', last_name: 'Іванова', email: 'maria.i@example.com', phone_number: '098-765-4321', role: 'manager', supervisor_ids: [2] },
  { manager_id: 4, first_name: 'Олег', last_name: 'Сидоренко', email: 'oleg.s@example.com', phone_number: '111-222-3333', role: 'manager', supervisor_ids: [2, 5] },
  { manager_id: 5, first_name: 'Анна', last_name: 'Коваленко', email: 'anna.k@example.com', phone_number: '444-555-6666', role: 'head', supervisor_ids: [1] },
];

let counterparties: Counterparty[] = [
    { counterparty_id: 1, name: 'ТОВ "Ромашка"', counterparty_type: CounterpartyType.LEGAL_ENTITY, responsible_manager_id: 2 },
    { counterparty_id: 2, name: 'ФОП Сидоренко', counterparty_type: CounterpartyType.INDIVIDUAL, responsible_manager_id: 3 },
    { counterparty_id: 3, name: 'ТОВ "Мрія"', counterparty_type: CounterpartyType.LEGAL_ENTITY, responsible_manager_id: 4 },
];

let units: Unit[] = [
    { unit_id: 1, name: 'шт.' },
    { unit_id: 2, name: 'кг' },
    { unit_id: 3, name: 'уп.' },
];

let products: Omit<Product, 'unit' | 'stocks' | 'total_stock'>[] = [
    { product_id: 1, name: 'Ноутбук Pro 15', description: 'Потужний ноутбук для професіоналів', price: 1500.00, unit_id: 1 },
    { product_id: 2, name: 'Миша Wireless X', description: 'Ергономічна бездротова миша', price: 50.00, unit_id: 1 },
];

let services: Service[] = [
    { service_id: 1, name: 'Консультація з ПЗ', description: 'Годинна консультація з налаштування програмного забезпечення', price: 100.00 },
    { service_id: 2, name: 'Підписка на підтримку', description: 'Річна підписка на технічну підтримку', price: 300.00 },
];

let warehouses: Warehouse[] = [
    { warehouse_id: 1, name: 'Основний склад', location: 'Київ, вул. Центральна, 1' },
    { warehouse_id: 2, name: 'Склад №2', location: 'Львів, вул. Промислова, 5' },
];

let productStocks: Omit<ProductStock, 'warehouse'>[] = [
    { product_stock_id: 1, product_id: 1, warehouse_id: 1, quantity: 10 },
    { product_stock_id: 2, product_id: 2, warehouse_id: 1, quantity: 50 },
    { product_stock_id: 3, product_id: 1, warehouse_id: 2, quantity: 5 },
];

let saleStatuses: SaleStatusType[] = [
    { sale_status_id: 1, name: 'Не оплачено' },
    { sale_status_id: 2, name: 'Відтермінована оплата' },
    { sale_status_id: 3, name: 'Оплачено' },
];

let funnels: Funnel[] = [
  { funnel_id: 1, name: 'Стандартний продаж' },
  { funnel_id: 2, name: 'Розробка ПЗ' },
];

let funnelStages: FunnelStage[] = [
  // Stages for Funnel 1
  { funnel_stage_id: 1, name: 'Новий', funnel_id: 1, order: 1 },
  { funnel_stage_id: 2, name: 'Кваліфікація', funnel_id: 1, order: 2 },
  { funnel_stage_id: 3, name: 'Пропозиція', funnel_id: 1, order: 3 },
  { funnel_stage_id: 4, name: 'Переговори', funnel_id: 1, order: 4 },
  { funnel_stage_id: 5, name: 'Успішно завершено', funnel_id: 1, order: 5 },
  { funnel_stage_id: 6, name: 'Програно', funnel_id: 1, order: 6 },
  
  // Stages for Funnel 2
  { funnel_stage_id: 7, name: 'Аналіз вимог', funnel_id: 2, order: 1 },
  { funnel_stage_id: 8, name: 'Проектування', funnel_id: 2, order: 2 },
  { funnel_stage_id: 9, name: 'Розробка', funnel_id: 2, order: 3 },
  { funnel_stage_id: 10, name: 'Тестування', funnel_id: 2, order: 4 },
  { funnel_stage_id: 11, name: 'Реліз', funnel_id: 2, order: 5 },
];


let subProjectStatuses: SubProjectStatusType[] = [
    { sub_project_status_id: 1, name: 'Заплановано' },
    { sub_project_status_id: 2, name: 'В процесі' },
    { sub_project_status_id: 3, name: 'Готово' },
];

let sales: Omit<Sale, 'counterparty' | 'responsible_manager' | 'products' | 'services' | 'total_price'>[] = [
    { sale_id: 1, counterparty_id: 1, responsible_manager_id: 2, sale_date: new Date('2024-05-20').toISOString(), status: 'Оплачено', deferred_payment_date: null, project_id: 1 },
    { sale_id: 2, counterparty_id: 2, responsible_manager_id: 3, sale_date: new Date('2024-05-22').toISOString(), status: 'Відтермінована оплата', deferred_payment_date: '2024-06-30', project_id: null },
    { sale_id: 3, counterparty_id: 1, responsible_manager_id: 2, sale_date: new Date().toISOString(), status: 'Не оплачено', deferred_payment_date: null, project_id: null },
];

let sales_products: { sale_id: number; product_id: number; quantity: number }[] = [
    { sale_id: 1, product_id: 1, quantity: 1 },
    { sale_id: 1, product_id: 2, quantity: 2 },
    { sale_id: 2, product_id: 2, quantity: 5 },
    { sale_id: 3, product_id: 1, quantity: 2 },
];

let sales_services: { sale_id: number; service_id: number }[] = [
    { sale_id: 1, service_id: 1 },
    { sale_id: 2, service_id: 2 },
];

let projects: Omit<Project, 'main_responsible_manager' | 'secondary_responsible_managers' | 'counterparty' | 'subprojects' | 'tasks' | 'sales' | 'project_products' | 'project_services' | 'comments' | 'funnel' | 'funnel_stage'>[] = [
    { project_id: 1, name: 'Розробка нового сайту', description: 'Створити сучасний та адаптивний веб-сайт для клієнта з інтеграцією платіжної системи.', main_responsible_manager_id: 3, secondary_responsible_manager_ids: [2], counterparty_id: 1, forecast_amount: 5000, funnel_id: 2, funnel_stage_id: 9 },
    { project_id: 2, name: 'Продаж партії серверів', description: 'Поставка та налаштування 10 серверів Dell PowerEdge для дата-центру клієнта.', main_responsible_manager_id: 2, secondary_responsible_manager_ids: [], counterparty_id: 2, forecast_amount: 15000, funnel_id: 1, funnel_stage_id: 3 },
    { project_id: 3, name: 'Впровадження CRM', description: '', main_responsible_manager_id: 3, secondary_responsible_manager_ids: [2, 4], counterparty_id: 1, forecast_amount: 8000, funnel_id: 2, funnel_stage_id: 7 },
];

let subprojects: Omit<SubProject, 'project' | 'tasks' | 'comments' | 'subproject_products' | 'subproject_services'>[] = [
    { subproject_id: 1, name: 'Дизайн UI/UX', project_id: 1, status: 'В процесі', cost: 1500, description: 'Розробка макетів та прототипів для всіх сторінок сайту.' },
];

let tasks: Omit<Task, 'responsible_manager' | 'creator_manager' | 'project' | 'subproject'>[] = [
    { task_id: 1, title: 'Створити макет головної сторінки', description: 'Підготувати декілька варіантів дизайну', responsible_manager_id: 3, creator_manager_id: 2, project_id: 1, subproject_id: 1, due_date: '2024-08-15' },
    { task_id: 2, title: 'Підготувати комерційну пропозицію', description: '', responsible_manager_id: 2, creator_manager_id: 1, project_id: 2, subproject_id: null, due_date: '2024-08-10' },
];

let project_products: Omit<ProjectProduct, 'product'>[] = [
    { project_product_id: 1, project_id: 1, product_id: 2, quantity: 3 },
];

let project_services: Omit<ProjectService, 'service'>[] = [
    { project_service_id: 1, project_id: 1, service_id: 1 },
];

let project_comments: Omit<ProjectComment, 'manager'>[] = [
    { comment_id: 1, project_id: 1, manager_id: 2, content: 'Пропоную розпочати з обговорення дизайну. Які є ідеї?', created_at: new Date('2024-07-28T10:00:00Z').toISOString(), file: null },
    { comment_id: 2, project_id: 1, manager_id: 3, content: 'Підтримую. Я вже підготувала кілька референсів, зараз надішлю.', created_at: new Date('2024-07-28T10:05:00Z').toISOString(), file: null },
];

let subproject_comments: Omit<SubProjectComment, 'manager'>[] = [
    { comment_id: 3, subproject_id: 1, manager_id: 3, content: 'Дизайн затверджено, можна починати верстку.', created_at: new Date('2024-07-29T14:00:00Z').toISOString(), file: null },
];

let subproject_products: Omit<SubProjectProduct, 'product'>[] = [];
let subproject_services: Omit<SubProjectService, 'service'>[] = [];


const db = {
    managers,
    counterparties,
    products,
    services,
    warehouses,
    productStocks,
    sales,
    sales_products,
    sales_services,
    projects,
    subprojects,
    tasks,
    units,
    saleStatuses,
    funnels,
    funnelStages,
    subProjectStatuses,
    project_products,
    project_services,
    project_comments,
    subproject_comments,
    subproject_products,
    subproject_services,
};

type Entity = keyof typeof db;

const simulateNetwork = (delay = 500) => new Promise(res => setTimeout(res, delay));

const getIdKeyForEntity = (entity: Entity): string => {
    switch (entity) {
        case 'managers': return 'manager_id';
        case 'counterparties': return 'counterparty_id';
        case 'units': return 'unit_id';
        case 'products': return 'product_id';
        case 'services': return 'service_id';
        case 'warehouses': return 'warehouse_id';
        case 'productStocks': return 'product_stock_id';
        case 'saleStatuses': return 'sale_status_id';
        case 'funnels': return 'funnel_id';
        case 'funnelStages': return 'funnel_stage_id';
        case 'subProjectStatuses': return 'sub_project_status_id';
        case 'sales': return 'sale_id';
        case 'projects': return 'project_id';
        case 'subprojects': return 'subproject_id';
        case 'tasks': return 'task_id';
        case 'project_products': return 'project_product_id';
        case 'project_services': return 'project_service_id';
        case 'project_comments': return 'comment_id';
        case 'subproject_comments': return 'comment_id';
        case 'subproject_products': return 'subproject_product_id';
        case 'subproject_services': return 'subproject_service_id';
        default: return 'id'; // Fallback
    }
};

const api = {
    login: async (email: string): Promise<Manager | null> => {
        await simulateNetwork(200);
        console.log(`[API MOCK] Login attempt for: ${email}`);
        const user = db.managers.find(m => m.email.toLowerCase() === email.toLowerCase());
        if (user) {
            currentUser = { ...user };
            console.log('[API MOCK] Login successful:', currentUser);
            return { ...user };
        }
        currentUser = null;
        console.log('[API MOCK] Login failed');
        return null;
    },
    logout: async (): Promise<void> => {
        currentUser = null;
        console.log('[API MOCK] User logged out.');
        return Promise.resolve();
    },
    getCurrentUser: async (): Promise<Manager | null> => {
        // In a real app, this would check a token or session
        return Promise.resolve(currentUser ? { ...currentUser } : null);
    },
    getAll: async <T,>(entity: Entity): Promise<T[]> => {
        await simulateNetwork();
        if (!currentUser) {
            console.log('[API MOCK] Denied access: No user logged in.');
            return [];
        }

        let allowedManagerIds: number[] = [];
        if (currentUser.role === 'admin') {
            // Admin can see everything, no ID filtering needed.
        } else if (currentUser.role === 'head') {
            const subordinateIds = db.managers.filter(m => m.supervisor_ids?.includes(currentUser!.manager_id)).map(m => m.manager_id);
            allowedManagerIds = [currentUser.manager_id, ...subordinateIds];
        } else { // 'manager'
            allowedManagerIds = [currentUser.manager_id];
        }

        let rawData: any[] = [...db[entity]];

        if (currentUser.role !== 'admin') {
            switch(entity) {
                case 'managers':
                    rawData = rawData.filter(item => allowedManagerIds.includes((item as Manager).manager_id));
                    break;
                case 'counterparties':
                    rawData = rawData.filter(item => (item as Counterparty).responsible_manager_id && allowedManagerIds.includes((item as Counterparty).responsible_manager_id!));
                    break;
                case 'sales':
                    rawData = rawData.filter(item => allowedManagerIds.includes((item as Sale).responsible_manager_id));
                    break;
                case 'projects':
                    rawData = rawData.filter(item => 
                        ((item as Project).main_responsible_manager_id && allowedManagerIds.includes((item as Project).main_responsible_manager_id!)) ||
                        ((item as Project).secondary_responsible_manager_ids && (item as Project).secondary_responsible_manager_ids!.some(id => allowedManagerIds.includes(id)))
                    );
                    break;
                case 'tasks':
                     rawData = rawData.filter(item => 
                        ((item as Task).responsible_manager_id && allowedManagerIds.includes((item as Task).responsible_manager_id!)) ||
                        ((item as Task).creator_manager_id && allowedManagerIds.includes((item as Task).creator_manager_id!))
                    );
                    break;
                case 'subprojects':
                    const allowedProjectIds = db.projects.filter(p => 
                        (p.main_responsible_manager_id && allowedManagerIds.includes(p.main_responsible_manager_id)) ||
                        (p.secondary_responsible_manager_ids && p.secondary_responsible_manager_ids.some(id => allowedManagerIds.includes(id)))
                    ).map(p => p.project_id);
                    rawData = rawData.filter(item => allowedProjectIds.includes((item as SubProject).project_id));
                    break;
                // Entities like products, services, units etc. are not restricted by manager.
            }
        }

        console.log(`[API MOCK] GET /api/${entity} for ${currentUser.email}, returned ${rawData.length} of ${db[entity].length} items after filtering.`);

        // --- Data Enrichment ---
        if (entity === 'sales') {
          return rawData.map(sale => {
            const saleProducts = db.sales_products
              .filter(sp => sp.sale_id === sale.sale_id)
              .map(sp => {
                  const product = db.products.find(p => p.product_id === sp.product_id);
                  return product ? { product: { ...product, unit: db.units.find(u => u.unit_id === product.unit_id)}, quantity: sp.quantity } : null;
              })
              .filter((item): item is Exclude<typeof item, null> => item !== null);

            const saleServices = db.sales_services
              .filter(ss => ss.sale_id === sale.sale_id)
              .map(ss => db.services.find(s => s.service_id === ss.service_id))
              .filter((item): item is Service => !!item);

            const productsTotal = saleProducts.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
            const servicesTotal = saleServices.reduce((sum, item) => sum + item.price, 0);

            return {
              ...sale,
              counterparty: db.counterparties.find(c => c.counterparty_id === sale.counterparty_id),
              responsible_manager: db.managers.find(m => m.manager_id === sale.responsible_manager_id),
              products: saleProducts,
              services: saleServices,
              total_price: productsTotal + servicesTotal,
            };
          }) as T[];
        }
        if (entity === 'projects') {
             return rawData.map(p => ({
                ...p,
                main_responsible_manager: db.managers.find(m => m.manager_id === p.main_responsible_manager_id),
                secondary_responsible_managers: (p.secondary_responsible_manager_ids || []).map(id => db.managers.find(m => m.manager_id === id)).filter((m): m is Manager => !!m),
                counterparty: db.counterparties.find(c => c.counterparty_id === p.counterparty_id),
                funnel: db.funnels.find(f => f.funnel_id === p.funnel_id),
                funnel_stage: db.funnelStages.find(fs => fs.funnel_stage_id === p.funnel_stage_id),
            })) as T[];
        }
        if (entity === 'products') {
            return rawData.map(p => {
                const stocks = db.productStocks
                    .filter(ps => ps.product_id === p.product_id)
                    .map(ps => ({
                        ...ps,
                        warehouse: db.warehouses.find(w => w.warehouse_id === ps.warehouse_id)
                    }));
                const total_stock = stocks.reduce((sum, s) => sum + s.quantity, 0);
                return {
                    ...p,
                    unit: db.units.find(u => u.unit_id === p.unit_id),
                    stocks,
                    total_stock,
                }
            }) as T[];
        }
        if (entity === 'tasks') {
            return rawData.map(task => ({
                ...task,
                responsible_manager: db.managers.find(m => m.manager_id === task.responsible_manager_id),
                creator_manager: db.managers.find(m => m.manager_id === task.creator_manager_id),
                project: db.projects.find(p => p.project_id === task.project_id),
                subproject: db.subprojects.find(sp => sp.subproject_id === task.subproject_id),
            })) as T[];
        }
        if (entity === 'subprojects') {
            const enrichedProjects = db.projects.map(p => ({
                ...p,
                main_responsible_manager: db.managers.find(m => m.manager_id === p.main_responsible_manager_id),
                counterparty: db.counterparties.find(c => c.counterparty_id === p.counterparty_id),
            }));
            return rawData.map(sp => ({
                ...sp,
                project: enrichedProjects.find(p => p.project_id === sp.project_id)
            })) as T[];
        }
        return rawData as T[];
    },
    getById: async <T,>(entity: Entity, id: number): Promise<T | null> => {
        await simulateNetwork();
        if (!currentUser) {
            console.log(`[API MOCK] Denied access to ${entity}/${id}: No user logged in.`);
            return null;
        }

        const idKey = getIdKeyForEntity(entity);
        // @ts-ignore
        const item = db[entity].find(item => item[idKey] === id);
        if (!item) return null;

        // Authorization Check
        if (currentUser.role !== 'admin') {
            let allowed = false;
            let allowedManagerIds: number[];
             if (currentUser.role === 'head') {
                const subordinateIds = db.managers.filter(m => m.supervisor_ids?.includes(currentUser!.manager_id)).map(m => m.manager_id);
                allowedManagerIds = [currentUser.manager_id, ...subordinateIds];
            } else { // 'manager'
                allowedManagerIds = [currentUser.manager_id];
            }

            switch(entity) {
                case 'projects':
                    const p = item as Project;
                    allowed = (p.main_responsible_manager_id && allowedManagerIds.includes(p.main_responsible_manager_id)) ||
                              (p.secondary_responsible_manager_ids && p.secondary_responsible_manager_ids.some(id => allowedManagerIds.includes(id))) || false;
                    break;
                case 'subprojects':
                     const sp = item as SubProject;
                     const parentProject = db.projects.find(p => p.project_id === sp.project_id);
                     if(parentProject) {
                         allowed = (parentProject.main_responsible_manager_id && allowedManagerIds.includes(parentProject.main_responsible_manager_id)) ||
                                   (parentProject.secondary_responsible_manager_ids && parentProject.secondary_responsible_manager_ids.some(id => allowedManagerIds.includes(id))) || false;
                     }
                    break;
                // Add more checks for other entities as needed
                default:
                    allowed = true; // Assume access for other entities if not specified
                    break;
            }
             if (!allowed) {
                console.log(`[API MOCK] Denied access to ${entity}/${id} for user ${currentUser.email}.`);
                return null;
            }
        }
        
        console.log(`[API MOCK] GET /api/${entity}/${id}`);

        if (!item) return null;

        if (entity === 'projects') {
            const project = item as Project;

            const projectSales = db.sales.filter(s => s.project_id === id).map(sale => {
                const saleProducts = db.sales_products.filter(sp => sp.sale_id === sale.sale_id).map(sp => ({ product: db.products.find(p => p.product_id === sp.product_id), quantity: sp.quantity })).filter((p): p is { product: Product, quantity: number } => !!p.product);
                const saleServices = db.sales_services.filter(ss => ss.sale_id === sale.sale_id).map(ss => db.services.find(s => s.service_id === ss.service_id)).filter((s): s is Service => !!s);
                const productsTotal = saleProducts.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
                const servicesTotal = saleServices.reduce((sum, item) => sum + (item?.price || 0), 0);

                return {
                  ...sale,
                  responsible_manager: db.managers.find(m => m.manager_id === sale.responsible_manager_id),
                  products: saleProducts,
                  services: saleServices,
                  total_price: productsTotal + servicesTotal,
                };
            });
            const projectProducts = db.project_products
                .filter(pp => pp.project_id === id)
                .map(pp => ({
                    ...pp,
                    product: db.products.find(p => p.product_id === pp.product_id)
                }));
            const projectServices = db.project_services
                .filter(ps => ps.project_id === id)
                .map(ps => ({
                    ...ps,
                    service: db.services.find(s => s.service_id === ps.service_id)
                }));

            const projectComments = db.project_comments
                .filter(c => c.project_id === id)
                .map(c => ({
                    ...c,
                    manager: db.managers.find(m => m.manager_id === c.manager_id)
                }))
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

             return {
                ...project,
                main_responsible_manager: db.managers.find(m => m.manager_id === project.main_responsible_manager_id),
                secondary_responsible_managers: (project.secondary_responsible_manager_ids || []).map(id => db.managers.find(m => m.manager_id === id)).filter((m): m is Manager => !!m),
                counterparty: db.counterparties.find(c => c.counterparty_id === project.counterparty_id),
                funnel: db.funnels.find(f => f.funnel_id === project.funnel_id),
                funnel_stage: db.funnelStages.find(fs => fs.funnel_stage_id === project.funnel_stage_id),
                subprojects: db.subprojects.filter(sp => sp.project_id === id),
                tasks: db.tasks.filter(t => t.project_id === id).map(t => ({
                    ...t,
                    responsible_manager: db.managers.find(m => m.manager_id === t.responsible_manager_id),
                    creator_manager: db.managers.find(m => m.manager_id === t.creator_manager_id),
                })),
                sales: projectSales,
                project_products: projectProducts,
                project_services: projectServices,
                comments: projectComments,
             } as T;
        }
        
        if (entity === 'subprojects') {
            const subproject = item as SubProject;
            const parentProject = db.projects.find(p => p.project_id === subproject.project_id);
            const subprojectTasks = db.tasks
                .filter(t => t.subproject_id === id)
                .map(t => ({
                    ...t,
                    responsible_manager: db.managers.find(m => m.manager_id === t.responsible_manager_id),
                    creator_manager: db.managers.find(m => m.manager_id === t.creator_manager_id),
                }));
            const subprojectComments = db.subproject_comments
                .filter(c => c.subproject_id === id)
                .map(c => ({
                    ...c,
                    manager: db.managers.find(m => m.manager_id === c.manager_id)
                }))
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            const subprojectProducts = db.subproject_products
                .filter(pp => pp.subproject_id === id)
                .map(pp => ({
                    ...pp,
                    product: db.products.find(p => p.product_id === pp.product_id)
                }));
            const subprojectServices = db.subproject_services
                .filter(ps => ps.subproject_id === id)
                .map(ps => ({
                    ...ps,
                    service: db.services.find(s => s.service_id === ps.service_id)
                }));
            
            return {
                ...subproject,
                project: {
                    ...parentProject,
                    main_responsible_manager: db.managers.find(m => m.manager_id === parentProject?.main_responsible_manager_id),
                },
                tasks: subprojectTasks,
                comments: subprojectComments,
                subproject_products: subprojectProducts,
                subproject_services: subprojectServices,
            } as T;
        }

        return { ...item } as T;
    },
    create: async <T,>(entity: Entity, data: any): Promise<T> => {
        await simulateNetwork();
        console.log(`[API MOCK] POST /api/${entity}`, data);
        
        if (entity === 'project_comments' || entity === 'subproject_comments') {
             const idKey = 'comment_id';
             const maxProjectCommentId = Math.max(0, ...db.project_comments.map(item => item.comment_id));
             const maxSubProjectCommentId = Math.max(0, ...db.subproject_comments.map(item => item.comment_id));
             const newId = Math.max(maxProjectCommentId, maxSubProjectCommentId) + 1;
             const newItem = { ...data, [idKey]: newId };
             // @ts-ignore
             db[entity].push(newItem);
             return newItem as T;
        }

        if (entity === 'sales') {
            const { products: saleProducts, services: saleServices, ...saleData } = data;
            const idKey = `sale_id`;
            const newId = Math.max(0, ...db.sales.map(item => item[idKey])) + 1;
            const newSale = { ...saleData, [idKey]: newId };

            // @ts-ignore
            db.sales.push(newSale);

            if (saleProducts) {
                saleProducts.forEach((p: { product_id: number, quantity: number }) => {
                    db.sales_products.push({ sale_id: newId, product_id: p.product_id, quantity: p.quantity });
                    // Deduct from stock (defaulting to warehouse 1)
                    const stockItem = db.productStocks.find(ps => ps.product_id === p.product_id && ps.warehouse_id === 1);
                    if (stockItem) {
                        stockItem.quantity -= p.quantity;
                    }
                });
            }
            if (saleServices) {
                saleServices.forEach((s: { service_id: number }) => {
                    db.sales_services.push({ sale_id: newId, service_id: s.service_id });
                });
            }
            return newSale as T;
        }

        const idKey = getIdKeyForEntity(entity);
        // @ts-ignore
        const newId = Math.max(0, ...db[entity].map(item => item[idKey])) + 1;
        const newItem = { ...data, [idKey]: newId };
        // @ts-ignore
        db[entity].push(newItem);
        return newItem as T;
    },
    update: async <T extends { [key: string]: any },>(entity: Entity, id: number, data: Partial<T>): Promise<T | null> => {
        await simulateNetwork();
        console.log(`[API MOCK] PUT /api/${entity}/${id}`, data);
        const idKey = getIdKeyForEntity(entity);
        // @ts-ignore
        const index = db[entity].findIndex(item => item[idKey] === id);
        if (index === -1) return null;
        const updatedItem = { ...db[entity][index], ...data };
        db[entity][index] = updatedItem;
        return updatedItem as unknown as T;
    },
    delete: async (entity: Entity, id: number): Promise<boolean> => {
        await simulateNetwork();
        console.log(`[API MOCK] DELETE /api/${entity}/${id}`);
        const idKey = getIdKeyForEntity(entity);
        // @ts-ignore
        const initialLength = db[entity].length;

        if (entity === 'projects') {
            // Cascade delete subprojects, tasks and comments
            db.subprojects = db.subprojects.filter(sp => sp.project_id !== id);
            db.tasks = db.tasks.filter(t => t.project_id !== id);
            db.project_comments = db.project_comments.filter(c => c.project_id !== id);
             // Unlink sales
            db.sales.forEach(sale => {
                if (sale.project_id === id) {
                    sale.project_id = null;
                }
            });
            // Cascade delete project products/services
            db.project_products = db.project_products.filter(pp => pp.project_id !== id);
            db.project_services = db.project_services.filter(ps => ps.project_id !== id);
        }

        if (entity === 'subprojects') {
            db.tasks = db.tasks.filter(t => t.subproject_id !== id);
            db.subproject_comments = db.subproject_comments.filter(c => c.subproject_id !== id);
            db.subproject_products = db.subproject_products.filter(spp => spp.subproject_id !== id);
            db.subproject_services = db.subproject_services.filter(sps => sps.subproject_id !== id);
        }
        
        if (entity === 'funnels') {
            // Cascade delete funnel stages and unlink projects
             db.funnelStages = db.funnelStages.filter(fs => fs.funnel_id !== id);
             db.projects.forEach(p => {
                 if (p.funnel_id === id) {
                     p.funnel_id = null;
                     p.funnel_stage_id = null;
                 }
             })
        }
        
        if (entity === 'funnelStages') {
            // Unlink projects from stage
            db.projects.forEach(p => {
                if(p.funnel_stage_id === id) {
                    p.funnel_stage_id = null;
                }
            })
        }

        // @ts-ignore
        db[entity] = db[entity].filter(item => item[idKey] !== id);

        if (entity === 'sales') {
            // @ts-ignore
            db.sales_products = db.sales_products.filter(item => item.sale_id !== id);
            // @ts-ignore
            db.sales_services = db.sales_services.filter(item => item.sale_id !== id);
        }
        
        if (entity === 'products') {
            db.productStocks = db.productStocks.filter(ps => ps.product_id !== id);
        }

        return db[entity].length < initialLength;
    },
    setProductStocks: async (productId: number, stocks: { warehouse_id: number, quantity: number }[]): Promise<boolean> => {
        await simulateNetwork(200);
        console.log(`[API MOCK] POST /api/products/${productId}/stock`, stocks);
        stocks.forEach(stockUpdate => {
            let stock = db.productStocks.find(ps => ps.product_id === productId && ps.warehouse_id === stockUpdate.warehouse_id);
            if (stock) {
                stock.quantity = stockUpdate.quantity;
            } else {
                 const newId = Math.max(0, ...db.productStocks.map(item => item.product_stock_id)) + 1;
                 const newStock: Omit<ProductStock, 'warehouse'> = { product_stock_id: newId, product_id: productId, warehouse_id: stockUpdate.warehouse_id, quantity: stockUpdate.quantity };
                 db.productStocks.push(newStock);
            }
        });
        return true;
    },
};

export default api;