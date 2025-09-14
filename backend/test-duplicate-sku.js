import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDuplicateSKU() {
  try {
    console.log('Testing duplicate SKU handling...');
    
    // Спочатку створимо товар з унікальним SKU
    const testProduct1 = {
      name: "Тестовий товар 1",
      sku: "TEST-DUPLICATE-001",
      description: "Перший тест товар",
      price: 100.50,
      unit_id: null
    };
    
    console.log('Creating first product:', testProduct1);
    const product1 = await prisma.product.create({
      data: testProduct1
    });
    console.log('First product created:', product1.product_id);
    
    // Тепер спробуємо створити товар з тим же SKU
    const testProduct2 = {
      name: "Тестовий товар 2", 
      sku: "TEST-DUPLICATE-001", // Той же SKU!
      description: "Другий тест товар",
      price: 200.00,
      unit_id: null
    };
    
    console.log('Attempting to create duplicate SKU product...');
    
    try {
      await prisma.product.create({
        data: testProduct2
      });
      console.log('ERROR: Duplicate was allowed!');
    } catch (error) {
      console.log('Good! Duplicate blocked with error:', error.code, error.message);
      if (error.code === 'P2002') {
        console.log('Prisma unique constraint violation detected');
        console.log('Target fields:', error.meta?.target);
      }
    }
    
    // Очищаємо тестові дані
    await prisma.product.delete({
      where: { product_id: product1.product_id }
    });
    console.log('Test data cleaned up');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDuplicateSKU();