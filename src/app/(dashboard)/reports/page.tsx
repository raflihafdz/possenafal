import type { Metadata } from "next";
import { ReportsContent } from "./reports-content";

export const metadata: Metadata = {
  title: "Laporan - PossENafal POS",
  description: "Laporan penjualan dan analitik",
};

export default function ReportsPage() {
  return <ReportsContent />;
}
