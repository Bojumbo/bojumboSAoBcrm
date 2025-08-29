import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    // Clear existing data
    await prisma.$transaction([
        prisma.subProjectService.deleteMany(),
        prisma.subProjectProduct.deleteMany(),
        prisma.subProjectComment.deleteMany(),
        prisma.projectService.deleteMany(),
        prisma.projectProduct.deleteMany(),
        prisma.projectComment.deleteMany(),
        prisma.task.deleteMany(),
        prisma.subProject.deleteMany(),
        prisma.saleService.deleteMany(),
        prisma.saleProduct.deleteMany(),
        prisma.sale.deleteMany(),
        prisma.project.deleteMany(),
        prisma.projectManager.deleteMany(),
        prisma.funnelStage.deleteMany(),
        prisma.funnel.deleteMany(),
        prisma.productStock.deleteMany(),
        prisma.product.deleteMany(),
        prisma.service.deleteMany(),
        prisma.unit.deleteMany(),
        prisma.warehouse.deleteMany(),
        prisma.counterparty.deleteMany(),
        prisma.manager.deleteMany(),
    ]);
    console.log('🗑️  Cleared existing data');
    // Create managers
    const adminPassword = await bcrypt.hash('admin123', 10);
    const managerPassword = await bcrypt.hash('manager123', 10);
    const managers = await Promise.all([
        prisma.manager.create({
            data: {
                first_name: 'Admin',
                last_name: 'User',
                email: 'admin@example.com',
                phone_number: '000-000-0000',
                role: 'admin',
                password_hash: adminPassword,
            },
        }),
        prisma.manager.create({
            data: {
                first_name: 'Іван',
                last_name: 'Петров',
                email: 'ivan.p@example.com',
                phone_number: '123-456-7890',
                role: 'head',
                password_hash: managerPassword,
            },
        }),
        prisma.manager.create({
            data: {
                first_name: 'Марія',
                last_name: 'Іванова',
                email: 'maria.i@example.com',
                phone_number: '098-765-4321',
                role: 'manager',
                password_hash: managerPassword,
            },
        }),
        prisma.manager.create({
            data: {
                first_name: 'Олег',
                last_name: 'Сидоренко',
                email: 'oleg.s@example.com',
                phone_number: '111-222-3333',
                role: 'manager',
                password_hash: managerPassword,
            },
        }),
        prisma.manager.create({
            data: {
                first_name: 'Анна',
                last_name: 'Коваленко',
                email: 'anna.k@example.com',
                phone_number: '444-555-6666',
                role: 'head',
                password_hash: managerPassword,
            },
        }),
    ]);
    console.log('👥 Created managers');
    // Set up supervisor relationships
    await prisma.manager.update({
        where: { manager_id: managers[1].manager_id }, // Іван Петров
        data: {
            supervisors: {
                connect: { manager_id: managers[0].manager_id } // Admin
            }
        }
    });
    await prisma.manager.update({
        where: { manager_id: managers[2].manager_id }, // Марія Іванова
        data: {
            supervisors: {
                connect: { manager_id: managers[1].manager_id } // Іван Петров
            }
        }
    });
    await prisma.manager.update({
        where: { manager_id: managers[3].manager_id }, // Олег Сидоренко
        data: {
            supervisors: {
                connect: [
                    { manager_id: managers[1].manager_id }, // Іван Петров
                    { manager_id: managers[4].manager_id } // Анна Коваленко
                ]
            }
        }
    });
    await prisma.manager.update({
        where: { manager_id: managers[4].manager_id }, // Анна Коваленко
        data: {
            supervisors: {
                connect: { manager_id: managers[0].manager_id } // Admin
            }
        }
    });
    console.log('🔗 Set up supervisor relationships');
    // Create units
    const units = await Promise.all([
        prisma.unit.create({ data: { name: 'шт.' } }),
        prisma.unit.create({ data: { name: 'кг' } }),
        prisma.unit.create({ data: { name: 'уп.' } }),
    ]);
    console.log('📦 Created units');
    // Create warehouses
    const warehouses = await Promise.all([
        prisma.warehouse.create({
            data: {
                name: 'Основний склад',
                location: 'Київ, вул. Центральна, 1'
            }
        }),
        prisma.warehouse.create({
            data: {
                name: 'Склад №2',
                location: 'Львів, вул. Промислова, 5'
            }
        }),
    ]);
    console.log('🏭 Created warehouses');
    // Create products
    const products = await Promise.all([
        prisma.product.create({
            data: {
                name: 'Ноутбук Pro 15',
                description: 'Потужний ноутбук для професіоналів',
                price: 1500.00,
                unit_id: units[0].unit_id,
            }
        }),
        prisma.product.create({
            data: {
                name: 'Миша Wireless X',
                description: 'Ергономічна бездротова миша',
                price: 50.00,
                unit_id: units[0].unit_id,
            }
        }),
    ]);
    console.log('💻 Created products');
    // Create product stocks
    await Promise.all([
        prisma.productStock.create({
            data: {
                product_id: products[0].product_id,
                warehouse_id: warehouses[0].warehouse_id,
                quantity: 10
            }
        }),
        prisma.productStock.create({
            data: {
                product_id: products[1].product_id,
                warehouse_id: warehouses[0].warehouse_id,
                quantity: 50
            }
        }),
        prisma.productStock.create({
            data: {
                product_id: products[0].product_id,
                warehouse_id: warehouses[1].warehouse_id,
                quantity: 5
            }
        }),
    ]);
    console.log('📊 Created product stocks');
    // Create services
    const services = await Promise.all([
        prisma.service.create({
            data: {
                name: 'Консультація з ПЗ',
                description: 'Годинна консультація з налаштування програмного забезпечення',
                price: 100.00
            }
        }),
        prisma.service.create({
            data: {
                name: 'Підписка на підтримку',
                description: 'Річна підписка на технічну підтримку',
                price: 300.00
            }
        }),
    ]);
    console.log('🔧 Created services');
    // Create counterparties
    const counterparties = await Promise.all([
        prisma.counterparty.create({
            data: {
                name: 'ТОВ "Ромашка"',
                counterparty_type: 'LEGAL_ENTITY',
                responsible_manager_id: managers[1].manager_id, // Іван Петров
            }
        }),
        prisma.counterparty.create({
            data: {
                name: 'ФОП Сидоренко',
                counterparty_type: 'INDIVIDUAL',
                responsible_manager_id: managers[2].manager_id, // Марія Іванова
            }
        }),
        prisma.counterparty.create({
            data: {
                name: 'ТОВ "Мрія"',
                counterparty_type: 'LEGAL_ENTITY',
                responsible_manager_id: managers[3].manager_id, // Олег Сидоренко
            }
        }),
    ]);
    console.log('🏢 Created counterparties');
    // Create funnels
    const funnels = await Promise.all([
        prisma.funnel.create({ data: { name: 'Стандартний продаж' } }),
        prisma.funnel.create({ data: { name: 'Розробка ПЗ' } }),
    ]);
    console.log('🔄 Created funnels');
    // Create funnel stages
    const funnelStages = await Promise.all([
        // Stages for Funnel 1 (Стандартний продаж)
        prisma.funnelStage.create({ data: { name: 'Новий', funnel_id: funnels[0].funnel_id, order: 1 } }),
        prisma.funnelStage.create({ data: { name: 'Кваліфікація', funnel_id: funnels[0].funnel_id, order: 2 } }),
        prisma.funnelStage.create({ data: { name: 'Пропозиція', funnel_id: funnels[0].funnel_id, order: 3 } }),
        prisma.funnelStage.create({ data: { name: 'Переговори', funnel_id: funnels[0].funnel_id, order: 4 } }),
        prisma.funnelStage.create({ data: { name: 'Успішно завершено', funnel_id: funnels[0].funnel_id, order: 5 } }),
        prisma.funnelStage.create({ data: { name: 'Програно', funnel_id: funnels[0].funnel_id, order: 6 } }),
        // Stages for Funnel 2 (Розробка ПЗ)
        prisma.funnelStage.create({ data: { name: 'Аналіз вимог', funnel_id: funnels[1].funnel_id, order: 1 } }),
        prisma.funnelStage.create({ data: { name: 'Проектування', funnel_id: funnels[1].funnel_id, order: 2 } }),
        prisma.funnelStage.create({ data: { name: 'Розробка', funnel_id: funnels[1].funnel_id, order: 3 } }),
        prisma.funnelStage.create({ data: { name: 'Тестування', funnel_id: funnels[1].funnel_id, order: 4 } }),
        prisma.funnelStage.create({ data: { name: 'Реліз', funnel_id: funnels[1].funnel_id, order: 5 } }),
    ]);
    console.log('📋 Created funnel stages');
    // Create projects
    const projects = await Promise.all([
        prisma.project.create({
            data: {
                name: 'Розробка нового сайту',
                description: 'Створити сучасний та адаптивний веб-сайт для клієнта з інтеграцією платіжної системи.',
                main_responsible_manager_id: managers[2].manager_id, // Марія Іванова
                counterparty_id: counterparties[0].counterparty_id, // ТОВ "Ромашка"
                forecast_amount: 5000,
                funnel_id: funnels[1].funnel_id, // Розробка ПЗ
                funnel_stage_id: funnelStages[8].funnel_stage_id, // Розробка
            }
        }),
        prisma.project.create({
            data: {
                name: 'Продаж партії серверів',
                description: 'Поставка та налаштування 10 серверів Dell PowerEdge для дата-центру клієнта.',
                main_responsible_manager_id: managers[1].manager_id, // Іван Петров
                counterparty_id: counterparties[1].counterparty_id, // ФОП Сидоренко
                forecast_amount: 15000,
                funnel_id: funnels[0].funnel_id, // Стандартний продаж
                funnel_stage_id: funnelStages[2].funnel_stage_id, // Пропозиція
            }
        }),
        prisma.project.create({
            data: {
                name: 'Впровадження CRM',
                description: '',
                main_responsible_manager_id: managers[2].manager_id, // Марія Іванова
                counterparty_id: counterparties[0].counterparty_id, // ТОВ "Ромашка"
                forecast_amount: 8000,
                funnel_id: funnels[1].funnel_id, // Розробка ПЗ
                funnel_stage_id: funnelStages[6].funnel_stage_id, // Аналіз вимог
            }
        }),
    ]);
    console.log('📁 Created projects');
    // Set up secondary responsible managers for projects
    await prisma.projectManager.createMany({
        data: [
            { project_id: projects[0].project_id, manager_id: managers[1].manager_id }, // Project 1 - Іван Петров
            { project_id: projects[2].project_id, manager_id: managers[1].manager_id }, // Project 3 - Іван Петров
            { project_id: projects[2].project_id, manager_id: managers[3].manager_id }, // Project 3 - Олег Сидоренко
        ]
    });
    console.log('👥 Set up secondary project managers');
    // Create subprojects
    const subprojects = await Promise.all([
        prisma.subProject.create({
            data: {
                name: 'Дизайн UI/UX',
                project_id: projects[0].project_id,
                status: 'В процесі',
                cost: 1500,
                description: 'Розробка макетів та прототипів для всіх сторінок сайту.',
            }
        }),
    ]);
    console.log('📋 Created subprojects');
    // Create tasks
    const tasks = await Promise.all([
        prisma.task.create({
            data: {
                title: 'Створити макет головної сторінки',
                description: 'Підготувати декілька варіантів дизайну',
                responsible_manager_id: managers[2].manager_id, // Марія Іванова
                creator_manager_id: managers[1].manager_id, // Іван Петров
                project_id: projects[0].project_id,
                subproject_id: subprojects[0].subproject_id,
                due_date: new Date('2024-08-15'),
            }
        }),
        prisma.task.create({
            data: {
                title: 'Підготувати комерційну пропозицію',
                description: '',
                responsible_manager_id: managers[1].manager_id, // Іван Петров
                creator_manager_id: managers[0].manager_id, // Admin
                project_id: projects[1].project_id,
                subproject_id: null,
                due_date: new Date('2024-08-10'),
            }
        }),
    ]);
    console.log('✅ Created tasks');
    // Create project products
    await prisma.projectProduct.create({
        data: {
            project_id: projects[0].project_id,
            product_id: products[1].product_id, // Миша Wireless X
            quantity: 3
        }
    });
    console.log('📦 Created project products');
    // Create project services
    await prisma.projectService.create({
        data: {
            project_id: projects[0].project_id,
            service_id: services[0].service_id, // Консультація з ПЗ
        }
    });
    console.log('🔧 Created project services');
    // Create project comments
    await Promise.all([
        prisma.projectComment.create({
            data: {
                project_id: projects[0].project_id,
                manager_id: managers[1].manager_id, // Іван Петров
                content: 'Пропоную розпочати з обговорення дизайну. Які є ідеї?',
                created_at: new Date('2024-07-28T10:00:00Z'),
            }
        }),
        prisma.projectComment.create({
            data: {
                project_id: projects[0].project_id,
                manager_id: managers[2].manager_id, // Марія Іванова
                content: 'Підтримую. Я вже підготувала кілька референсів, зараз надішлю.',
                created_at: new Date('2024-07-28T10:05:00Z'),
            }
        }),
    ]);
    console.log('💬 Created project comments');
    // Create subproject comments
    await prisma.subProjectComment.create({
        data: {
            subproject_id: subprojects[0].subproject_id,
            manager_id: managers[2].manager_id, // Марія Іванова
            content: 'Дизайн затверджено, можна починати верстку.',
            created_at: new Date('2024-07-29T14:00:00Z'),
        }
    });
    console.log('💬 Created subproject comments');
    // Create sales
    const sales = await Promise.all([
        prisma.sale.create({
            data: {
                counterparty_id: counterparties[0].counterparty_id, // ТОВ "Ромашка"
                responsible_manager_id: managers[1].manager_id, // Іван Петров
                sale_date: new Date('2024-05-20'),
                status: 'Оплачено',
                deferred_payment_date: null,
                project_id: projects[0].project_id,
            }
        }),
        prisma.sale.create({
            data: {
                counterparty_id: counterparties[1].counterparty_id, // ФОП Сидоренко
                responsible_manager_id: managers[2].manager_id, // Марія Іванова
                sale_date: new Date('2024-05-22'),
                status: 'Відтермінована оплата',
                deferred_payment_date: new Date('2024-06-30'),
                project_id: null,
            }
        }),
        prisma.sale.create({
            data: {
                counterparty_id: counterparties[0].counterparty_id, // ТОВ "Ромашка"
                responsible_manager_id: managers[1].manager_id, // Іван Петров
                sale_date: new Date(),
                status: 'Не оплачено',
                deferred_payment_date: null,
                project_id: null,
            }
        }),
    ]);
    console.log('💰 Created sales');
    // Create sale products
    await Promise.all([
        prisma.saleProduct.create({
            data: {
                sale_id: sales[0].sale_id,
                product_id: products[0].product_id, // Ноутбук Pro 15
                quantity: 1
            }
        }),
        prisma.saleProduct.create({
            data: {
                sale_id: sales[0].sale_id,
                product_id: products[1].product_id, // Миша Wireless X
                quantity: 2
            }
        }),
        prisma.saleProduct.create({
            data: {
                sale_id: sales[1].sale_id,
                product_id: products[1].product_id, // Миша Wireless X
                quantity: 5
            }
        }),
        prisma.saleProduct.create({
            data: {
                sale_id: sales[2].sale_id,
                product_id: products[0].product_id, // Ноутбук Pro 15
                quantity: 2
            }
        }),
    ]);
    console.log('📦 Created sale products');
    // Create sale services
    await Promise.all([
        prisma.saleService.create({
            data: {
                sale_id: sales[0].sale_id,
                service_id: services[0].service_id, // Консультація з ПЗ
            }
        }),
        prisma.saleService.create({
            data: {
                sale_id: sales[1].sale_id,
                service_id: services[1].service_id, // Підписка на підтримку
            }
        }),
    ]);
    console.log('🔧 Created sale services');
    console.log('✅ Database seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map