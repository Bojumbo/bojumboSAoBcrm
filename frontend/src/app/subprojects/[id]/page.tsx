"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import SubProjectInfoPanel from "@/components/SubProjectInfoPanel";

// Визначення типу для об'єкта підпроекту.
interface SubProject {
	subproject_id: number;
	name: string;
	// ... інші поля
}

export default function SubProjectDetailPage() {
	const params = useParams();
	const subprojectId = typeof params.id === "string" ? parseInt(params.id, 10) : null;

	const [subproject, setSubproject] = useState<SubProject | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchSubproject() {
			if (!subprojectId) {
				setError("Недійсний ID підпроекту.");
				setLoading(false);
				return;
			}

			setLoading(true);
			setError(null);
			try {
				const response = await fetch(`/api/subprojects/${subprojectId}`);
				if (!response.ok) {
					throw new Error("Не вдалося завантажити підпроект");
				}
				const data: SubProject = await response.json();
				setSubproject(data);
			} catch (e: any) {
				setError(e.message || "Сталася помилка під час завантаження даних");
			} finally {
				setLoading(false);
			}
		}

		fetchSubproject();
	}, [subprojectId]);
	
	return (
		<DashboardLayout>
			{loading && (
				<div className="flex items-center justify-center h-64">
					<span className="text-lg">Завантаження...</span>
				</div>
			)}

			{error && (
				<div className="flex flex-col items-center justify-center h-64 space-y-4">
					<span className="text-lg text-red-600">{error}</span>
					{subprojectId && <span className="text-sm text-muted-foreground">ID: {subprojectId}</span>}
				</div>
			)}

			{!loading && !error && subproject && (
				<div className="container mx-auto p-4 md:p-6 max-w-7xl">
					<div className="flex flex-col xl:flex-row gap-6">
						{/* Основний контент */}
						<div className="flex-1 min-w-0 xl:order-1">
							<div className="mb-6">
								<h1 className="text-2xl md:text-3xl font-bold mb-2 break-words">{subproject.name}</h1>
								<div className="flex flex-wrap gap-2 mb-4">
									<Badge variant="outline">ID: {subproject.subproject_id}</Badge>
								</div>
							</div>
							
                            {/* --- БЛОК ВКЛАДОК ОНОВЛЕНО --- */}
							<Tabs defaultValue="chat" className="w-full">
								<TabsList className="grid w-full grid-cols-5">
									<TabsTrigger value="chat">Чат</TabsTrigger>
									<TabsTrigger value="subprojects">Підпроекти</TabsTrigger>
									<TabsTrigger value="products_services">Товари</TabsTrigger>
									<TabsTrigger value="sales">Продажі</TabsTrigger>
									<TabsTrigger value="tasks">Завдання</TabsTrigger>
								</TabsList>

								{/* 1. Чат (замість коментарів) */}
								<TabsContent value="chat" className="mt-6">
									<Card>
										<CardHeader>
											<CardTitle>Чат по підпроекту</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="text-center py-8 text-muted-foreground">
												<p>Чат буде додано в наступних версіях</p>
											</div>
										</CardContent>
									</Card>
								</TabsContent>

								{/* 2. Підпроекти (нова вкладка) */}
								<TabsContent value="subprojects" className="mt-6">
									<Card>
										<CardHeader>
											<CardTitle>Вкладені підпроекти</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="text-center py-8 text-muted-foreground">
												<p>Список вкладених підпроектів буде додано в наступних версіях</p>
											</div>
										</CardContent>
									</Card>
								</TabsContent>
								
								{/* 3. Товари та Послуги (об'єднана вкладка) */}
								<TabsContent value="products_services" className="mt-6">
									<Card>
										<CardHeader>
											<CardTitle>Товари та Послуги підпроекту</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="text-center py-8 text-muted-foreground">
												<p>Список товарів та послуг буде додано в наступних версіях</p>
											</div>
										</CardContent>
									</Card>
								</TabsContent>

								{/* 4. Продажі (нова вкладка) */}
								<TabsContent value="sales" className="mt-6">
									<Card>
										<CardHeader>
											<CardTitle>Продажі по підпроекту</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="text-center py-8 text-muted-foreground">
												<p>Список продажів буде додано в наступних версіях</p>
											</div>
										</CardContent>
									</Card>
								</TabsContent>

								{/* 5. Завдання */}
								<TabsContent value="tasks" className="mt-6">
									<Card>
										<CardHeader>
											<CardTitle>Завдання підпроекту</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="text-center py-8 text-muted-foreground">
												<p>Завдання будуть додані в наступних версіях</p>
											</div>
										</CardContent>
									</Card>
								</TabsContent>
							</Tabs>
						</div>
						
						{/* Права панель з інформацією про підпроект */}
						<div className="w-full xl:w-80 xl:max-w-sm xl:order-2 flex-shrink-0">
							<SubProjectInfoPanel subproject={subproject} />
						</div>
					</div>
				</div>
			)}
		</DashboardLayout>
	);
}