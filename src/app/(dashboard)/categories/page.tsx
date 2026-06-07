import type { Metadata } from "next";
import { CategoriesContent } from "./categories-content";

export const metadata: Metadata = {
  title: "Kategori - PossENafal POS",
  description: "Kelola kategori produk",
};

export default function CategoriesPage() {
  return <CategoriesContent />;
}
