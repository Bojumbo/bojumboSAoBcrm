import api from '../api/httpClient';

type ApiResponse<T> = { success: boolean; data: T };

export type DashboardMetrics = {
  projectsCount: number;
  projectsForecastTotal: number;
  tasksCount: number;
  tasksDueToday: number;
  salesCount: number;
  salesTotal: number;
  salesLast30Total: number;
};

function isToday(d?: string | Date | null): boolean {
  if (!d) return false;
  const dt = typeof d === 'string' ? new Date(d) : d;
  const now = new Date();
  return (
    dt.getFullYear() === now.getFullYear() &&
    dt.getMonth() === now.getMonth() &&
    dt.getDate() === now.getDate()
  );
}

function inLastDays(d?: string | Date | null, days = 30): boolean {
  if (!d) return false;
  const dt = typeof d === 'string' ? new Date(d) : d;
  const now = new Date();
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return dt >= from && dt <= now;
}

export const DashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const [projectsResp, tasksResp, salesResp] = await Promise.all([
      api.get<ApiResponse<any[]>>('/projects'),
      api.get<ApiResponse<any[]>>('/tasks'),
      api.get<ApiResponse<any[]>>('/sales'),
    ]);

    const projects = projectsResp.data.data || [];
    const tasks = tasksResp.data.data || [];
    const sales = salesResp.data.data || [];

    const projectsCount = projects.length;
    const projectsForecastTotal = projects.reduce(
      (sum: number, p: any) => sum + (typeof p.forecast_amount === 'number' ? p.forecast_amount : Number(p.forecast_amount || 0)),
      0
    );

    const tasksCount = tasks.length;
    const tasksDueToday = tasks.filter((t: any) => isToday(t.due_date)).length;

    const salesCount = sales.length;
    const salesTotal = sales.reduce(
      (sum: number, s: any) => sum + (typeof s.total_price === 'number' ? s.total_price : Number(s.total_price || 0)),
      0
    );
    const salesLast30Total = sales.reduce(
      (sum: number, s: any) => sum + (inLastDays(s.sale_date, 30) ? (typeof s.total_price === 'number' ? s.total_price : Number(s.total_price || 0)) : 0),
      0
    );

    return {
      projectsCount,
      projectsForecastTotal,
      tasksCount,
      tasksDueToday,
      salesCount,
      salesTotal,
      salesLast30Total,
    };
  }
};
