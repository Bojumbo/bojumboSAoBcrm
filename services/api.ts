
import { Manager, Counterparty, Product, Service, Warehouse, Sale, Project, SubProject, Task, CounterpartyType, Unit, SaleStatusType, ProjectStatusType, SubProjectStatusType, ProjectProduct, ProjectService, ProjectComment, ProductStock } from '../types';

// In-memory database
let managers: Manager[] = [
  { manager_id: 1, first_name: 'Іван', last_name: 'Петров', email: 'ivan.p@example.com', phone_number: '123-456-7890' },
  { manager_id: 2, first_name: 'Марія', last_name: 'Іванова', email: 'maria.i@example.com', phone_number: '098-765-4321' },
];

let counterparties: Counterparty[] = [
    { counterparty_id: 1, name: 'ТОВ "Ромашка"', counterparty_type: CounterpartyType.LEGAL_ENTITY, responsible_manager_id: 1 },
    { counterparty_id: 2, name: 'ФОП Сидоренко', counterparty_type: CounterpartyType.INDIVIDUAL, responsible_manager_id: 2 },
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

let projectStatuses: ProjectStatusType[] = [
    { project_status_id: 1, name: 'Новий' },
    { project_status_id: 2, name: 'В роботі' },
    { project_status_id: 3, name: 'Завершено' },
];

let subProjectStatuses: SubProjectStatusType[] = [
    { sub_project_status_id: 1, name: 'Заплановано' },
    { sub_project_status_id: 2, name: 'В процесі' },
    { sub_project_status_id: 3, name: 'Готово' },
];

let sales: Omit<Sale, 'counterparty' | 'responsible_manager' | 'products' | 'services' | 'total_price'>[] = [
    { sale_id: 1, counterparty_id: 1, responsible_manager_id: 1, sale_date: new Date('2024-05-20').toISOString(), status: 'Оплачено', deferred_payment_date: null, project_id: 1 },
    { sale_id: 2, counterparty_id: 2, responsible_manager_id: 1, sale_date: new Date('2024-05-22').toISOString(), status: 'Відтермінована оплата', deferred_payment_date: '2024-06-30', project_id: null },
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

let projects: Omit<Project, 'responsible_manager' | 'counterparty' | 'subprojects' | 'tasks' | 'sales' | 'project_products' | 'project_services' | 'comments'>[] = [
    { project_id: 1, name: 'Розробка нового сайту', responsible_manager_id: 2, counterparty_id: 1, status: 'В роботі', forecast_amount: 5000 },
];

let subprojects: SubProject[] = [
    { subproject_id: 1, name: 'Дизайн UI/UX', project_id: 1, status: 'В процесі', cost: 1500 },
];

let tasks: Omit<Task, 'responsible_manager' | 'creator_manager' | 'project' | 'subproject'>[] = [
    { task_id: 1, title: 'Створити макет головної сторінки', description: 'Підготувати декілька варіантів дизайну', responsible_manager_id: 2, creator_manager_id: 1, project_id: 1, subproject_id: 1, due_date: '2024-08-15' },
];

let project_products: Omit<ProjectProduct, 'product'>[] = [
    { project_product_id: 1, project_id: 1, product_id: 2, quantity: 3 },
];

let project_services: Omit<ProjectService, 'service'>[] = [
    { project_service_id: 1, project_id: 1, service_id: 1 },
];

let project_comments: Omit<ProjectComment, 'manager'>[] = [
    { comment_id: 1, project_id: 1, manager_id: 1, content: 'Пропоную розпочати з обговорення дизайну. Які є ідеї?', created_at: new Date('2024-07-28T10:00:00Z').toISOString(), file: null },
    { comment_id: 2, project_id: 1, manager_id: 2, content: 'Підтримую. Я вже підготувала кілька референсів, зараз надішлю.', created_at: new Date('2024-07-28T10:05:00Z').toISOString(), file: null },
];


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
    projectStatuses,
    subProjectStatuses,
    project_products,
    project_services,
    project_comments,
};

type Entity = keyof typeof db;

const simulateNetwork = (delay = 500) => new Promise(res => setTimeout(res, delay));

// FIX: Replaced faulty pluralization logic with a robust helper function to ensure
// the correct ID key (e.g., 'sale_id' from 'sales') is always used in CRUD operations.
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
        case 'projectStatuses': return 'project_status_id';
        case 'subProjectStatuses': return 'sub_project_status_id';
        case 'sales': return 'sale_id';
        case 'projects': return 'project_id';
        case 'subprojects': return 'subproject_id';
        case 'tasks': return 'task_id';
        case 'project_products': return 'project_product_id';
        case 'project_services': return 'project_service_id';
        case 'project_comments': return 'comment_id';
        default: return 'id'; // Fallback
    }
};

const api = {
    getAll: async <T,>(entity: Entity): Promise<T[]> => {
        await simulateNetwork();
        console.log(`[API MOCK] GET /api/${entity}`);
        if (entity === 'sales') {
          return db.sales.map(sale => {
            const saleProducts = db.sales_products
              .filter(sp => sp.sale_id === sale.sale_id)
              .map(sp => {
                  const product = db.products.find(p => p.product_id === sp.product_id);
                  return product ? { product: { ...product, unit: db.units.find(u => u.unit_id === product.unit_id)}, quantity: sp.quantity } : null;
              })
              // FIX: Replaced the specific type guard with a more robust one using `Exclude`
              // to work around a complex TypeScript inference issue with nested object types.
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
        if (entity === 'products') {
            return db.products.map(p => {
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
            return db.tasks.map(task => ({
                ...task,
                responsible_manager: db.managers.find(m => m.manager_id === task.responsible_manager_id),
                creator_manager: db.managers.find(m => m.manager_id === task.creator_manager_id),
                project: db.projects.find(p => p.project_id === task.project_id),
                subproject: db.subprojects.find(sp => sp.subproject_id === task.subproject_id),
            })) as T[];
        }
        return [...db[entity]] as T[];
    },
    getById: async <T,>(entity: Entity, id: number): Promise<T | null> => {
        await simulateNetwork();
        console.log(`[API MOCK] GET /api/${entity}/${id}`);
        const idKey = getIdKeyForEntity(entity);
        // @ts-ignore
        const item = db[entity].find(item => item[idKey] === id);

        if (!item) return null;

        if (entity === 'projects') {
            // FIX: Cast item to Project to correctly access its properties.
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
                responsible_manager: db.managers.find(m => m.manager_id === project.responsible_manager_id),
                counterparty: db.counterparties.find(c => c.counterparty_id === project.counterparty_id),
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

        return { ...item } as T;
    },
    create: async <T,>(entity: Entity, data: any): Promise<T> => {
        await simulateNetwork();
        console.log(`[API MOCK] POST /api/${entity}`, data);

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
        // FIX: Change type assertion to 'unknown as T' to resolve complex type mismatch error.
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
