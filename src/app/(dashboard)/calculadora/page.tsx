import { Metadata } from "next";
import CalculadoraPagos from '@/components/Calculadora/CalculadoraPagos';

export const metadata: Metadata = {
  title: "Calculadora de Pagos | Morita",
  description: "Simula diferentes escenarios de pago para tu tarjeta de crédito y encuentra la mejor opción para ti.",
};

export default function CalculadoraPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto pt-24">
        {/* Sección de encabezado */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#FF00FF] to-[#7C4DFF] [text-shadow:0_0_30px_rgba(255,0,255,0.3)]">
            Calculadora de Pagos
          </h1>
          <p className="text-xl text-white/70">
            Simula diferentes escenarios de pago y encuentra la mejor opción para ti.
          </p>
        </div>

        {/* Características principales */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-[#FF00FF]/20 rounded-xl flex items-center justify-center mb-4">
              <div className="text-[#FF00FF] font-bold text-xl">1</div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Ingresa tu deuda</h3>
            <p className="text-white/70">
              Introduce el monto total de tu deuda y el pago mínimo requerido.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-[#FF00FF]/20 rounded-xl flex items-center justify-center mb-4">
              <div className="text-[#FF00FF] font-bold text-xl">2</div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Define tu pago</h3>
            <p className="text-white/70">
              Especifica cuánto puedes pagar mensualmente para reducir tu deuda.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-[#FF00FF]/20 rounded-xl flex items-center justify-center mb-4">
              <div className="text-[#FF00FF] font-bold text-xl">3</div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Ve los resultados</h3>
            <p className="text-white/70">
              Conoce en cuánto tiempo liquidarás tu deuda y cuánto pagarás en total.
            </p>
          </div>
        </div>

        {/* Calculadora */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <CalculadoraPagos />
        </div>
      </div>
    </div>
  );
} 