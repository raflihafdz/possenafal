import type { Metadata } from "next";
import { StockContent } from "./stock-content";

export const metadata: Metadata = {
  title: "Manajemen Stok - PossENafal POS",
  description: "Kelola pergerakan stok dan inventaris",
};

export default function StockPage() {
  return <StockContent />;
}
