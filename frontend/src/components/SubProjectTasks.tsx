"use client";

import React, { useState, useEffect } from "react";
import { getAuthToken } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, CheckSquare, Search, Calendar, User, Clock, AlertCircle } from "lucide-react";
import { Task } from "@/types/projects";
// TODO: створити окремий тип для підпроекту, якщо потрібно

interface SubProjectTasksProps {
  subprojectId: number;
}

export default function SubProjectTasks({ subprojectId }: SubProjectTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTasks();
  }, [subprojectId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      // TODO: замінити на правильний API для підпроекту
      const response = await fetch(`/api/subprojects/${subprojectId}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        setTasks(Array.isArray(result) ? result : []);
      } else {
        setTasks([]);
      }
    } catch (error) {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // ...далі рендер таблиці завдань (аналогічно ProjectTasks)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare size={20} /> Завдання підпроекту
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Завантаження...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Немає завдань</div>
          ) : (
            <div>
              {/* TODO: таблиця завдань */}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
