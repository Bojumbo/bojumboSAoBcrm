'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ServicesTable from '@/components/ServicesTable';
import ServiceForm from '@/components/ServiceForm';
import ServiceDetails from '@/components/ServiceDetails';
import { ServiceWithRelations } from '@/types/services';

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<ServiceWithRelations | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleServiceSelect = (service: ServiceWithRelations) => {
    setSelectedService(service);
    setIsDetailsOpen(true);
  };

  const handleCreateService = () => {
    setSelectedService(null);
    setIsFormOpen(true);
  };

  const handleEditService = (service: ServiceWithRelations) => {
    setSelectedService(service);
    setIsDetailsOpen(false);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedService(null);
  };

  const handleDetailsClose = () => {
    setIsDetailsOpen(false);
    setSelectedService(null);
  };

  const handleFormSave = () => {
    // Оновлюємо список послуг
    setRefreshKey(prev => prev + 1);
  };

  const handleDeleteService = async (serviceId: number) => {
    // Оновлюємо список послуг після видалення
    setRefreshKey(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="h-full overflow-auto p-6">
        <ServicesTable
          onServiceSelect={handleServiceSelect}
          onCreateService={handleCreateService}
          onEditService={handleEditService}
          refreshKey={refreshKey}
        />
      </div>

      <ServiceForm
        service={selectedService}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
      />

      <ServiceDetails
        service={selectedService}
        isOpen={isDetailsOpen}
        onClose={handleDetailsClose}
        onEdit={handleEditService}
        onDelete={handleDeleteService}
      />
    </DashboardLayout>
  );
}
