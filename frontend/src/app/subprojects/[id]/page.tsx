"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import SubProjectInfoPanel from "@/components/SubProjectInfoPanel";

// Визначення типу для об'єкта підпроекту.
// Додайте сюди всі поля, які отримуєте з API.
interface SubProject {
	subproject_id: number;
	name: string;
	// наприклад, description: string; status: string; і т.д.
}

export default function SubProjectDetailPage() {
	const params = useParams();
	const subprojectId = typeof params.id === "string" ? parseInt(params.id, 10) : null;

	// Вказуємо тип для стану
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
					// Цей рядок був джерелом помилки збірки
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

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<span className="text-lg">Завантаження...</span>
			</div>
		);
	}

	if (error || !subproject) {
		return (
			<div className="flex flex-col items-center justify-center h-64 space-y-4">
				<span className="text-lg text-red-600">{error || "Підпроект не знайдено"}</span>
				{subprojectId && <span className="text-sm text-muted-foreground">ID: {subprojectId}</span>}
			</div>
		);
	}

	return (
		<div className="w-full min-h-screen">
			<div className="container mx-auto p-4 md:p-6 max-w-7xl">
				<div className="flex flex-col xl:flex-row gap-6">
					{/* Основний контент */}
					<div className="flex-1 min-w-0 xl:order-1">
						<div className="mb-6">
							<h1 className="text-2xl md:text-3xl font-bold mb-2 break-words">{subproject.name}</h1>
							<div className="flex flex-wrap gap-2 mb-4">
								<Badge variant="outline">ID: {subproject.subproject_id}</Badge>
								{/* TODO: додати воронку та етап, якщо потрібно */}
							</div>
						</div>
						<Tabs defaultValue="products" className="w-full">
							<TabsList className="grid w-full grid-cols-4">
								<TabsTrigger value="products">Товари</TabsTrigger>
								<TabsTrigger value="services">Послуги</TabsTrigger>
								<TabsTrigger value="comments">Коментарі</TabsTrigger>
								<TabsTrigger value="tasks">Завдання</TabsTrigger>
							</TabsList>
							<TabsContent value="products" className="mt-6">
								<Card>
									<CardHeader>
										<CardTitle>Товари підпроекту</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="text-center py-8 text-muted-foreground">
											<p>Список товарів буде додано в наступних версіях</p>
										</div>
									</CardContent>
								</Card>
							</TabsContent>
							<TabsContent value="services" className="mt-6">
								<Card>
									<CardHeader>
										<CardTitle>Послуги підпроекту</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="text-center py-8 text-muted-foreground">
											<p>Список послуг буде додано в наступних версіях</p>
										</div>
									</CardContent>
								</Card>
							</TabsContent>
							<TabsContent value="comments" className="mt-6">
								<Card>
									<CardHeader>
										<CardTitle>Коментарі до підпроекту</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="text-center py-8 text-muted-foreground">
											<p>Коментарі будуть додані в наступних версіях</p>
										</div>
									</CardContent>
								</Card>
							</TabsContent>
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
				{/* TODO: Діалог редагування підпроекту */}
			</div>
		</div>
	);
}