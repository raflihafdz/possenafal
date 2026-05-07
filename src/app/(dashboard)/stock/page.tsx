import type { Metadata } from "next";
import { StockContent } from "./stock-content";

export const metadata: Metadata = {
  title: "Stock Management - PossENafal POS",
  description: "Manage stock movements and inventory",
};

export default function StockPage() {
  return <StockContent />;
}
