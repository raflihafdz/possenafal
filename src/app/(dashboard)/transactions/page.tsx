import type { Metadata } from "next";
import { TransactionsContent } from "./transactions-content";

export const metadata: Metadata = {
  title: "Transaksi - PossENafal POS",
  description: "Lihat riwayat transaksi",
};

export default function TransactionsPage() {
  return <TransactionsContent />;
}
