import { Metadata } from "next";
import { PaymentMethodsContent } from "./payment-methods-content";

export const metadata: Metadata = {
  title: "Payment Methods | POS Admin",
  description: "Configure payment methods (debit banks and QRIS)",
};

export default function PaymentMethodsPage() {
  return <PaymentMethodsContent />;
}
