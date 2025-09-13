'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import CounterpartiesList from '@/components/CounterpartiesList';
import CounterpartyDetails from '@/components/CounterpartyDetails';
import { EditCounterpartyForm } from '@/components/EditCounterpartyForm';
import { AddCounterpartyForm } from '@/components/AddCounterpartyForm';
import { counterpartiesAPI } from '@/lib/api';
import type { CounterpartyWithRelations, Manager, Counterparty, CreateCounterpartyData } from '@/types/counterparties';

export default function CounterpartiesPage() {
  const [selectedCounterparty, setSelectedCounterparty] = useState<CounterpartyWithRelations | null>(null);
  const [editingCounterparty, setEditingCounterparty] = useState<CounterpartyWithRelations | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCounterpartySelect = (counterparty: CounterpartyWithRelations) => {
    setSelectedCounterparty(counterparty);
  };

  const handleCounterpartyClose = () => {
    setSelectedCounterparty(null);
  };

  const handleCounterpartyEdit = (counterparty: CounterpartyWithRelations) => {
    setEditingCounterparty(counterparty);
    setIsEditFormOpen(true);
    // Закриваємо деталі при відкритті форми редагування
    setSelectedCounterparty(null);
  };

  const handleEditFormClose = () => {
    setIsEditFormOpen(false);
    setEditingCounterparty(null);
  };

  const handleCounterpartySave = async (id: number, data: Partial<Counterparty>) => {
    try {
      await counterpartiesAPI.updateCounterparty(id, data);
      
      // Оновлюємо список контрагентів
      setRefreshTrigger(prev => prev + 1);
      
      // Закриваємо форму
      handleEditFormClose();
      
      console.log('Контрагент успішно оновлено');
    } catch (error) {
      console.error('Помилка при оновленні контрагента:', error);
      throw error; // Перебрасуємо помилку для обробки в формі
    }
  };

  const handleAddCounterparty = () => {
    setIsAddFormOpen(true);
  };

  const handleAddFormClose = () => {
    setIsAddFormOpen(false);
  };

  const handleCounterpartyCreate = async (data: CreateCounterpartyData) => {
    try {
      await counterpartiesAPI.createCounterparty(data);
      
      // Оновлюємо список контрагентів
      setRefreshTrigger(prev => prev + 1);
      
      // Закриваємо форму
      handleAddFormClose();
      
      console.log('Контрагент успішно створено');
    } catch (error) {
      console.error('Помилка при створенні контрагента:', error);
      throw error; // Перебрасуємо помилку для обробки в формі
    }
  };

  return (
    <DashboardLayout title="Контрагенти">
      <CounterpartiesList 
        onCounterpartySelect={handleCounterpartySelect}
        refreshTrigger={refreshTrigger}
        onManagersLoad={setManagers}
        onAddCounterparty={handleAddCounterparty}
      />
      
      {selectedCounterparty && (
        <CounterpartyDetails
          counterparty={selectedCounterparty}
          isOpen={true}
          onClose={handleCounterpartyClose}
          onEdit={handleCounterpartyEdit}
        />
      )}

      {editingCounterparty && (
        <EditCounterpartyForm
          counterparty={editingCounterparty}
          isOpen={isEditFormOpen}
          onClose={handleEditFormClose}
          onSave={handleCounterpartySave}
          managers={managers}
        />
      )}

      <AddCounterpartyForm
        isOpen={isAddFormOpen}
        onClose={handleAddFormClose}
        onSave={handleCounterpartyCreate}
        managers={managers}
      />
    </DashboardLayout>
  );
}
