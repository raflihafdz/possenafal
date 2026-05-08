import type { Metadata } from "next";
import { ReportsContent } from "./reports-content";

export const metadata: Metadata = {
  title: "Reports - PossENafal POS",
  description: "Sales reports and analytics",
};

export default function ReportsPage() {
  return <ReportsContent />;
}
