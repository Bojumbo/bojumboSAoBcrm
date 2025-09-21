"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, TrendingUp, Search, Calendar, DollarSign, User, Building } from "lucide-react";
import { Sale } from "@/types/projects";
// TODO: створити окремий тип для підпроекту, якщо потрібно

interface SubProjectSalesProps {
  subprojectId: number;
}

export default function SubProjectSales({ subprojectId }: SubProjectSalesProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSales();
  }, [subprojectId]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      // TODO: замінити на правильний API для підпроекту
      const response = await fetch(`/api/subprojects/${subprojectId}/sales`);
      if (response.ok) {
        const result = await response.json();
        setSales(Array.isArray(result) ? result : []);
      } else {
        setSales([]);
      }
    } catch (error) {
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  // ...далі рендер таблиці продажів (аналогічно ProjectSales)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp size={20} /> Продажі підпроекту
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Завантаження...</div>
          ) : sales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Немає продажів</div>
          ) : (
            <div>
              {/* TODO: таблиця продажів */}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
