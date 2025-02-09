import { Metadata } from "next";
import CalculadoraPagos from '@/components/Calculadora/CalculadoraPagos';

export const metadata: Metadata = {
  title: "Calculadora de Pagos | Morita",
  description: "Simula diferentes escenarios de pago para tu tarjeta de crédito y encuentra la mejor opción para ti.",
};

export default function CalculadoraPage() {
  return (
    <div className="h-full w-full">
      <CalculadoraPagos />
    </div>
  );
} 