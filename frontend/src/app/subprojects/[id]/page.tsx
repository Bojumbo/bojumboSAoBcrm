"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { subProjectFunnelService } from '@/services/subProjectFunnelService';
import SubProjectInfoPanel from "@/components/SubProjectInfoPanel";
import { MessageSquare, FileText, ShoppingCart, TrendingUp, CheckSquare } from 'lucide-react';

interface SubProject {
	subproject_id: number;
	name: string;
    sub_project_funnel_id?: number | null;
    sub_project_funnel_stage_id?: number | null;
    funnel?: { name: string };
    funnel_stage?: { name: string };
	// ... інші поля
}

export default function SubProjectDetailPage() {
	const params = useParams();
	const subprojectId = typeof params.id === "string" ? parseInt(params.id, 10) : null;

	const [subproject, setSubproject] = useState<SubProject | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
    
    const [funnels, setFunnels] = useState<any[]>([]);
    const [loadingFunnels, setLoadingFunnels] = useState(false);
    const [updatingFunnel, setUpdatingFunnel] = useState(false);
    const [updatingStage, setUpdatingStage] = useState(false);

	const fetchSubproject = async (showLoading = true) => {
		if (!subprojectId) return;
		if (showLoading) setLoading(true);
		setError(null);
		try {
			const response = await fetch(`/api/subprojects/${subprojectId}`);
			if (!response.ok) throw new Error("Не вдалося завантажити підпроект");
			const data: SubProject = await response.json();
			setSubproject(data);
		} catch (e: any) {
			setError(e.message || "Сталася помилка під час завантаження даних");
		} finally {
			if (showLoading) setLoading(false);
		}
	};
	
    useEffect(() => {
		fetchSubproject();
        
        setLoadingFunnels(true);
        subProjectFunnelService.getAll().then((data) => {
            setFunnels(data);
            setLoadingFunnels(false);
        });
	}, [subprojectId]);
    
    const currentStages = subproject?.sub_project_funnel_id 
        ? funnels.find(f => f.sub_project_funnel_id === subproject.sub_project_funnel_id)?.stages || []
        : [];

    const handleFunnelChange = async (val: string) => {
        const funnelId = val !== 'none' ? parseInt(val) : null;
        if (!subprojectId || updatingFunnel) return;
        setUpdatingFunnel(true);
        try {
            await fetch(`/api/subprojects/${subprojectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sub_project_funnel_id: funnelId, sub_project_funnel_stage_id: null }),
            });
            await fetchSubproject(false);
        } catch (err) {
            console.error(err);
        } finally {
            setUpdatingFunnel(false);
        }
    };

    const handleStageChange = async (val: string) => {
        const stageId = val !== 'none' ? parseInt(val) : null;
        if (!subprojectId || updatingStage) return;
        setUpdatingStage(true);
        try {
            await fetch(`/api/subprojects/${subprojectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sub_project_funnel_stage_id: stageId }),
            });
            await fetchSubproject(false);
        } catch (err) {
            console.error(err);
        } finally {
            setUpdatingStage(false);
        }
    };
	
	return (
		<DashboardLayout>
			{loading && (
				<div className="flex items-center justify-center h-64"><span className="text-lg">Завантаження...</span></div>
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
						<div className="flex-1 min-w-0 xl:order-1">
							<div className="mb-6">
								<h1 className="text-2xl md:text-3xl font-bold mb-2 break-words">{subproject.name}</h1>
								
								<div className="flex flex-wrap items-center gap-4 mb-4">
									<Badge variant="outline">ID: {subproject.subproject_id}</Badge>
                                    
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Воронка:</span>
                                        <Select 
                                            value={subproject.sub_project_funnel_id?.toString() || 'none'} 
                                            onValueChange={handleFunnelChange} 
                                            disabled={updatingFunnel || loadingFunnels}
                                        >
                                            <SelectTrigger className="w-auto min-w-[120px] h-8">
                                                <SelectValue placeholder="Не вибрано">
                                                    {subproject.funnel?.name || 'Не вибрано'}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Не вибрано</SelectItem>
                                                {funnels.map(funnel => (
                                                    <SelectItem key={funnel.sub_project_funnel_id} value={funnel.sub_project_funnel_id.toString()}>{funnel.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    {subproject.sub_project_funnel_id && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">Етап:</span>
                                            <Select 
                                                value={subproject.sub_project_funnel_stage_id?.toString() || 'none'} 
                                                onValueChange={handleStageChange} 
                                                disabled={updatingStage || !currentStages.length}
                                            >
                                                <SelectTrigger className="w-auto min-w-[120px] h-8">
                                                    <SelectValue placeholder="Не вибрано">
                                                        {subproject.funnel_stage?.name || 'Не вибрано'}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Не вибрано</SelectItem>
                                                    {currentStages.map((stage: any) => (
                                                        <SelectItem key={stage.sub_project_funnel_stage_id} value={stage.sub_project_funnel_stage_id.toString()}>{stage.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
								</div>
							</div>
							
                            {/* --- ПОВЕРНУТИЙ НА МІСЦЕ БЛОК ВКЛАДОК --- */}
							<Tabs defaultValue="chat" className="w-full">
								<TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1">
									<TabsTrigger value="chat" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                                        <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
                                        <span className="truncate">Чат</span>
                                    </TabsTrigger>
									<TabsTrigger value="subprojects" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                                        <FileText className="h-3 w-3 md:h-4 md:w-4" />
                                        <span className="truncate hidden sm:inline">Підпроекти</span>
                                        <span className="truncate sm:hidden">Підпр.</span>
                                    </TabsTrigger>
									<TabsTrigger value="products_services" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                                        <ShoppingCart className="h-3 w-3 md:h-4 md:w-4" />
                                        <span className="truncate">Товари</span>
                                    </TabsTrigger>
									<TabsTrigger value="sales" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                                        <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                                        <span className="truncate">Продажі</span>
                                    </TabsTrigger>
									<TabsTrigger value="tasks" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                                        <CheckSquare className="h-3 w-3 md:h-4 md:w-4" />
                                        <span className="truncate">Завдання</span>
                                    </TabsTrigger>
								</TabsList>

								<div className="mt-6">
									<TabsContent value="chat"><Card><CardHeader><CardTitle>Чат по підпроекту</CardTitle></CardHeader><CardContent><div className="text-center py-8 text-muted-foreground"><p>Чат буде додано в наступних версіях</p></div></CardContent></Card></TabsContent>
									<TabsContent value="subprojects"><Card><CardHeader><CardTitle>Вкладені підпроекти</CardTitle></CardHeader><CardContent><div className="text-center py-8 text-muted-foreground"><p>Список вкладених підпроектів буде додано в наступних версіях</p></div></CardContent></Card></TabsContent>
									<TabsContent value="products_services"><Card><CardHeader><CardTitle>Товари та Послуги підпроекту</CardTitle></CardHeader><CardContent><div className="text-center py-8 text-muted-foreground"><p>Список товарів та послуг буде додано в наступних версіях</p></div></CardContent></Card></TabsContent>
									<TabsContent value="sales"><Card><CardHeader><CardTitle>Продажі по підпроекту</CardTitle></CardHeader><CardContent><div className="text-center py-8 text-muted-foreground"><p>Список продажів буде додано в наступних версіях</p></div></CardContent></Card></TabsContent>
									<TabsContent value="tasks"><Card><CardHeader><CardTitle>Завдання підпроекту</CardTitle></CardHeader><CardContent><div className="text-center py-8 text-muted-foreground"><p>Завдання будуть додані в наступних версіях</p></div></CardContent></Card></TabsContent>
								</div>
							</Tabs>
						</div>
						
						<div className="w-full xl:w-80 xl:max-w-sm xl:order-2 flex-shrink-0">
							<SubProjectInfoPanel subproject={subproject} />
						</div>
					</div>
				</div>
			)}
		</DashboardLayout>
	);
}