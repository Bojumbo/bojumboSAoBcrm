'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import SalesList from '@/components/SalesList';
import SaleForm from '@/components/SaleForm';
import EditSaleForm from '@/components/EditSaleForm';
import SaleDetails from '@/components/SaleDetails';
import { salesService, Sale, CreateSaleData, UpdateSaleData } from '@/services/salesService';

export default function SalesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleCreateSale = async (data: CreateSaleData) => {
    try {
      setLoading(true);
      await salesService.create(data);
      setRefreshTrigger(prev => prev + 1);
      alert('Продаж успішно створено');
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Помилка створення продажу');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSale = async (id: number, data: UpdateSaleData) => {
    try {
      setLoading(true);
      await salesService.update(id, data);
      setRefreshTrigger(prev => prev + 1);
      alert('Продаж успішно оновлено');
    } catch (error) {
      console.error('Error updating sale:', error);
      alert('Помилка оновлення продажу');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale);
    setShowDetails(true);
  };

  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale);
    setShowEditForm(true);
  };

  const handleEditFromDetails = () => {
    setShowDetails(false);
    setShowEditForm(true);
  };

  const handleAddSale = () => {
    setShowCreateForm(true);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Продажі</h1>
            <p className="text-muted-foreground">
              Управління продажами, угодами та воронкою продажів
            </p>
          </div>
        </div>

        <SalesList
          onAdd={handleAddSale}
          onEdit={handleEditSale}
          onView={handleViewSale}
          refreshTrigger={refreshTrigger}
        />

        {/* Форма створення продажу */}
        <SaleForm
          open={showCreateForm}
          onOpenChange={setShowCreateForm}
          onSubmit={handleCreateSale}
          loading={loading}
        />

        {/* Форма редагування продажу */}
        <EditSaleForm
          open={showEditForm}
          onOpenChange={setShowEditForm}
          onSubmit={handleUpdateSale}
          sale={selectedSale}
          loading={loading}
        />

        {/* Деталі продажу */}
        <SaleDetails
          open={showDetails}
          onOpenChange={setShowDetails}
          sale={selectedSale}
          onEdit={handleEditFromDetails}
        />
      </div>
    </DashboardLayout>
  );
}
