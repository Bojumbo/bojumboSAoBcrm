
import { Manager, Counterparty, Product, Service, Warehouse, Sale, Project, SubProject, Task, CounterpartyType, SaleStatus } from '../types';

// In-memory database
let managers: Manager[] = [
  { manager_id: 1, first_name: 'Іван', last_name: 'Петров', email: 'ivan.p@example.com', phone_number: '123-456-7890' },
  { manager_id: 2, first_name: 'Марія', last_name: 'Іванова', email: 'maria.i@example.com', phone_number: '098-765-4321' },
];

let counterparties: Counterparty[] = [
    { counterparty_id: 1, name: 'ТОВ "Ромашка"', counterparty_type: CounterpartyType.LEGAL_ENTITY, responsible_manager_id: 1 },
    { counterparty_id: 2, name: 'ФОП Сидоренко', counterparty_type: CounterpartyType.INDIVIDUAL, responsible_manager_id: 2 },
];

let products: Product[] = [
    { product_id: 1, name: 'Ноутбук Pro 15', description: 'Потужний ноутбук для професіоналів', price: 1500.00 },
    { product_id: 2, name: 'Миша Wireless X', description: 'Ергономічна бездротова миша', price: 50.00 },
];

let services: Service[] = [
    { service_id: 1, name: 'Консультація з ПЗ', description: 'Годинна консультація з налаштування програмного забезпечення', price: 100.00 },
    { service_id: 2, name: 'Підписка на підтримку', description: 'Річна підписка на технічну підтримку', price: 300.00 },
];

let warehouses: Warehouse[] = [
    { warehouse_id: 1, name: 'Основний склад', location: 'Київ, вул. Центральна, 1' },
];

let sales: Omit<Sale, 'counterparty' | 'responsible_manager' | 'products' | 'services' | 'total_price'>[] = [
    { sale_id: 1, counterparty_id: 1, responsible_manager_id: 1, sale_date: new Date('2024-05-20').toISOString(), status: SaleStatus.PAID, deferred_payment_date: null },
    { sale_id: 2, counterparty_id: 2, responsible_manager_id: 1, sale_date: new Date('2024-05-22').toISOString(), status: SaleStatus.DEFERRED, deferred_payment_date: '2024-06-30' },
    { sale_id: 3, counterparty_id: 1, responsible_manager_id: 2, sale_date: new Date().toISOString(), status: SaleStatus.NOT_PAID, deferred_payment_date: null },
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

let projects: Project[] = [
    { project_id: 1, name: 'Розробка нового сайту', responsible_manager_id: 2, counterparty_id: 1 },
];

let subprojects: SubProject[] = [
    { subproject_id: 1, name: 'Дизайн UI/UX', project_id: 1 },
];

let tasks: Task[] = [
    { task_id: 1, title: 'Створити макет головної сторінки', description: 'Підготувати декілька варіантів дизайну', responsible_manager_id: 2, creator_manager_id: 1, project_id: 1, subproject_id: 1, due_date: '2024-08-15' },
];


const db = {
    managers,
    counterparties,
    products,
    services,
    warehouses,
    sales,
    sales_products,
    sales_services,
    projects,
    subprojects,
    tasks,
};

type Entity = keyof typeof db;

const simulateNetwork = (delay = 500) => new Promise(res => setTimeout(res, delay));

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
                  return product ? { product, quantity: sp.quantity } : null;
              })
              .filter((item): item is { product: Product; quantity: number } => item !== null);
    
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
        return [...db[entity]] as T[];
    },
    getById: async <T,>(entity: Entity, id: number): Promise<T | null> => {
        await simulateNetwork();
        console.log(`[API MOCK] GET /api/${entity}/${id}`);
        // @ts-ignore
        const item = db[entity].find(item => item[`${entity.slice(0, -1)}_id`] === id);
        
        if (!item) return null;
        
        if (entity === 'projects') {
            // FIX: Cast item to Project to correctly access its properties.
            const project = item as Project;
             return {
                ...project,
                responsible_manager: db.managers.find(m => m.manager_id === project.responsible_manager_id),
                counterparty: db.counterparties.find(c => c.counterparty_id === project.counterparty_id),
                subprojects: db.subprojects.filter(sp => sp.project_id === id),
                tasks: db.tasks.filter(t => t.project_id === id).map(t => ({
                    ...t,
                    responsible_manager: db.managers.find(m => m.manager_id === t.responsible_manager_id),
                    creator_manager: db.managers.find(m => m.manager_id === t.creator_manager_id),
                }))
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
                });
            }
            if (saleServices) {
                saleServices.forEach((s: { service_id: number }) => {
                    db.sales_services.push({ sale_id: newId, service_id: s.service_id });
                });
            }
            return newSale as T;
        }

        const idKey = `${entity.slice(0, -1)}_id`;
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
        const idKey = `${entity.slice(0, -1)}_id`;
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
        const idKey = `${entity.slice(0, -1)}_id`;
        // @ts-ignore
        const initialLength = db[entity].length;
        // @ts-ignore
        db[entity] = db[entity].filter(item => item[idKey] !== id);
        
        if (entity === 'sales') {
            // @ts-ignore
            db.sales_products = db.sales_products.filter(item => item.sale_id !== id);
            // @ts-ignore
            db.sales_services = db.sales_services.filter(item => item.sale_id !== id);
        }

        return db[entity].length < initialLength;
    },
};

export default api;
