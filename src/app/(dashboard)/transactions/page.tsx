import type { Metadata } from "next";
import { TransactionsContent } from "./transactions-content";

export const metadata: Metadata = {
  title: "Transactions - PossENafal POS",
  description: "View transaction history",
};

export default function TransactionsPage() {
  return <TransactionsContent />;
}
