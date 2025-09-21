"use client";

import React, { useState, useEffect } from "react";
import { getAuthToken } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, ShoppingCart, Search, Package, DollarSign, Hash, Trash2, Edit, Settings } from "lucide-react";
import { ProjectProduct, ProjectService } from "@/types/projects";
// TODO: створити окремі типи для підпроекту, якщо потрібно

interface SubProjectProductsProps {
  subprojectId: number;
}

export default function SubProjectProducts({ subprojectId }: SubProjectProductsProps) {
  const [products, setProducts] = useState<ProjectProduct[]>([]);
  const [services, setServices] = useState<ProjectService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [subprojectId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      // TODO: замінити на правильний API для підпроекту
      const response = await fetch(`/api/subprojects/${subprojectId}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        setProducts(Array.isArray(result.products) ? result.products : []);
        setServices(Array.isArray(result.services) ? result.services : []);
      } else {
        setProducts([]);
        setServices([]);
      }
    } catch (error) {
      setProducts([]);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // ...далі рендер таблиці товарів та послуг (аналогічно ProjectProducts)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart size={20} /> Товари та послуги підпроекту
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Завантаження...</div>
          ) : products.length === 0 && services.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Немає товарів чи послуг</div>
          ) : (
            <div>
              {/* TODO: таблиці товарів та послуг */}
              <div className="mb-4 font-semibold">Товари</div>
              {/* ... */}
              <div className="mb-4 font-semibold">Послуги</div>
              {/* ... */}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
