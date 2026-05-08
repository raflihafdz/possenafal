import { getDashboardStats, getSalesChart } from "@/actions/dashboard";
import { DashboardContentClient } from "./dashboard-content-client";

export async function DashboardContent() {
  const [stats, chartData] = await Promise.all([
    getDashboardStats(),
    getSalesChart("7days"),
  ]);

  return <DashboardContentClient stats={stats} chartData={chartData} />;
}

