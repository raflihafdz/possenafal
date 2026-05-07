import type { Metadata } from "next";
import { POSContent } from "./pos-content";

export const metadata: Metadata = {
  title: "POS Cashier - PossENafal POS",
  description: "Point of Sale cashier interface",
};

export default function POSPage() {
  return <POSContent />;
}
