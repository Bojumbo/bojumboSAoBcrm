"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { SubProject, Manager, Counterparty } from "@/types/projects";
// TODO: створити окремий сервіс для підпроекту

interface SubProjectEditDialogProps {
  subproject: SubProject;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSubproject: SubProject) => void;
}

export default function SubProjectEditDialog({
  subproject,
  isOpen,
  onClose,
  onSave,
}: SubProjectEditDialogProps) {
  const [formData, setFormData] = useState({
    name: subproject.name,
    description: subproject.description || "",
    cost: subproject.cost || "",
    main_responsible_manager_id: subproject.main_responsible_manager_id?.toString() || "",
    sub_project_funnel_id: subproject.sub_project_funnel_id?.toString() || "",
    sub_project_funnel_stage_id: subproject.sub_project_funnel_stage_id?.toString() || "",
    // secondary_responsible_managers: subproject.secondary_responsible_managers?.map(m => m.manager_id) || [],
    // status: subproject.status || "",
    // parent_subproject_id: subproject.parent_subproject_id?.toString() || "",
  });

  const [managers, setManagers] = useState<Manager[]>([]);
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [secondaryManagers, setSecondaryManagers] = useState<Manager[]>(
    subproject.secondary_responsible_managers?.map(pm => pm.manager) || []
  );
  const [availableManagers, setAvailableManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    // TODO: фільтрувати доступних менеджерів (аналогічно ProjectEditDialog)
  }, [managers, formData.main_responsible_manager_id, secondaryManagers]);

  const fetchData = async () => {
    setLoading(true);
    // TODO: отримати менеджерів та контрагентів для підпроекту
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // TODO: зберегти підпроект через API
    setSaving(false);
    // onSave(updatedSubproject)
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Редагування підпроекту</DialogTitle>
          <DialogDescription>Внесіть зміни до підпроекту та збережіть</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <div>
            <Label htmlFor="name">Назва</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Опис</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="cost">Сума/Вартість</Label>
            <Input
              id="cost"
              value={formData.cost}
              onChange={e => setFormData({ ...formData, cost: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="main_responsible_manager_id">Головний менеджер</Label>
            <Input
              id="main_responsible_manager_id"
              value={formData.main_responsible_manager_id}
              onChange={e => setFormData({ ...formData, main_responsible_manager_id: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="sub_project_funnel_id">Воронка</Label>
            <Input
              id="sub_project_funnel_id"
              value={formData.sub_project_funnel_id}
              onChange={e => setFormData({ ...formData, sub_project_funnel_id: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="sub_project_funnel_stage_id">Етап воронки</Label>
            <Input
              id="sub_project_funnel_stage_id"
              value={formData.sub_project_funnel_stage_id}
              onChange={e => setFormData({ ...formData, sub_project_funnel_stage_id: e.target.value })}
            />
          </div>
          {/* TODO: secondary_responsible_managers, status, parent_subproject_id, dropdowns, вибір менеджерів */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Скасувати</Button>
            <Button type="submit" disabled={saving}>Зберегти</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
