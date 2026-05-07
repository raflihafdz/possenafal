import type { Metadata } from "next";
import { ProductsContent } from "./products-content";

export const metadata: Metadata = {
  title: "Products - PossENafal POS",
  description: "Manage products and inventory",
};

export default function ProductsPage() {
  return <ProductsContent />;
}
