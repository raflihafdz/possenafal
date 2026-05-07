import type { Metadata } from "next";
import { CategoriesContent } from "./categories-content";

export const metadata: Metadata = {
  title: "Categories - PossENafal POS",
  description: "Manage product categories",
};

export default function CategoriesPage() {
  return <CategoriesContent />;
}
