import type { Metadata } from "next";
import { ProductsContent } from "./products-content";

export const metadata: Metadata = {
  title: "Produk - PossENafal POS",
  description: "Kelola produk dan inventaris",
};

export default function ProductsPage() {
  return <ProductsContent />;
}
