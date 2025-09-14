'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProductsTable from '@/components/ProductsTable';
import ProductForm from '@/components/ProductForm';
import ProductDetails from '@/components/ProductDetails';
import { ProductWithRelations } from '@/types/products';

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRelations | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleProductSelect = (product: ProductWithRelations) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: ProductWithRelations) => {
    setSelectedProduct(product);
    setIsDetailsOpen(false);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
  };

  const handleDetailsClose = () => {
    setIsDetailsOpen(false);
    setSelectedProduct(null);
  };

  const handleFormSave = () => {
    // Оновлюємо список товарів
    setRefreshKey(prev => prev + 1);
  };

  const handleDeleteProduct = async (productId: number) => {
    // Оновлюємо список товарів після видалення
    setRefreshKey(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div key={refreshKey} className="h-full overflow-auto p-6">
        <ProductsTable
          onProductSelect={handleProductSelect}
          onCreateProduct={handleCreateProduct}
          onEditProduct={handleEditProduct}
        />
      </div>

      <ProductForm
        product={selectedProduct}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
      />

      <ProductDetails
        product={selectedProduct}
        isOpen={isDetailsOpen}
        onClose={handleDetailsClose}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />
    </DashboardLayout>
  );
}
