import type { Metadata } from "next";
import { POSContent } from "./pos-content";

export const metadata: Metadata = {
  title: "Kasir POS - PossENafal POS",
  description: "Antarmuka kasir point of sale",
};

export default function POSPage() {
  return <POSContent />;
}
