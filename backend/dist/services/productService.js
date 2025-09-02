import { prisma } from '../config/database.js';
// Helper to convert Prisma's Decimal type to a number for the Product entity
const toProduct = (product) => {
    return {
        ...product,
        price: product.price.toNumber(),
        // The 'stocks' relation is already in the correct shape
    };
};
const toProductBase = (product) => {
    return {
        ...product,
        price: product.price.toNumber(),
    };
};
export class ProductService {
    static async getAll() {
        const products = await prisma.product.findMany({
            include: {
                unit: true,
                stocks: {
                    include: {
                        warehouse: true
                    }
                }
            }
        });
        return products.map(toProduct);
    }
    static async getById(id) {
        const product = await prisma.product.findUnique({
            where: { product_id: id },
            include: {
                unit: true,
                stocks: {
                    include: {
                        warehouse: true
                    }
                }
            }
        });
        return product ? toProduct(product) : null;
    }
    static async create(data) {
        const product = await prisma.product.create({
            data
        });
        return toProductBase(product);
    }
    static async update(id, data) {
        const product = await prisma.product.update({
            where: { product_id: id },
            data
        });
        return product ? toProductBase(product) : null;
    }
    static async delete(id) {
        try {
            await prisma.product.delete({
                where: { product_id: id }
            });
            return true;
        }
        catch {
            return false;
        }
    }
    static async setProductStocks(productId, stocks) {
        try {
            const stockUpserts = stocks.map(stock => prisma.productStock.upsert({
                where: {
                    product_id_warehouse_id: {
                        product_id: productId,
                        warehouse_id: stock.warehouse_id
                    }
                },
                update: {
                    quantity: stock.quantity
                },
                create: {
                    product_id: productId,
                    warehouse_id: stock.warehouse_id,
                    quantity: stock.quantity
                }
            }));
            await prisma.$transaction(stockUpserts);
            return true;
        }
        catch (error) {
            console.error('Error setting product stocks:', error);
            return false;
        }
    }
    static async getProductStocks(productId) {
        const stocks = await prisma.productStock.findMany({
            where: { product_id: productId },
            include: {
                warehouse: true
            }
        });
        return stocks;
    }
}
//# sourceMappingURL=productService.js.map