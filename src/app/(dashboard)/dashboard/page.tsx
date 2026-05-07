import { Suspense } from "react";
import { DashboardContent } from "./dashboard-content";
import { DashboardSkeleton } from "@/components/shared/loading-skeletons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - PossENafal POS",
  description: "Overview of your business performance",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
