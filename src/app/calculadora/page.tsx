import { Metadata } from "next";
import PageLayout from "@/components/Common/PageLayout";
import PaymentCalculator from "@/components/Calculadora/PaymentCalculator";

export const metadata: Metadata = {
  title: "Calculadora de Pagos | Morita",
  description: "Simula diferentes escenarios de pago para tu tarjeta de crédito y encuentra la mejor opción para ti.",
};

export default function CalculadoraPage() {
  return (
    <PageLayout
      title="Calculadora de Pagos"
      description="Simula diferentes escenarios de pago y encuentra la mejor opción para ti."
    >
      <PaymentCalculator />
    </PageLayout>
  );
} 