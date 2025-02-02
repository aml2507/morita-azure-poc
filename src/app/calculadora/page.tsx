import { Metadata } from "next";
import PaymentCalculator from "@/components/Calculadora/PaymentCalculator";

export const metadata: Metadata = {
  title: "Calculadora de Pagos | Morita",
  description: "Simula diferentes escenarios de pago para tu tarjeta de crédito y encuentra la mejor opción para ti.",
};

export default function CalculadoraPage() {
  return (
    <section className="pb-[120px] pt-[120px]">
      <div className="container">
        <PaymentCalculator />
      </div>
    </section>
  );
} 