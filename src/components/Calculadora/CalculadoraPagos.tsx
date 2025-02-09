"use client";
import { useState, useEffect } from 'react';
import { formatearNumero } from '@/utils/numberFormat';
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const CalculadoraPagos = () => {
  const router = useRouter();
  const [deudaActual, setDeudaActual] = useState<number>(0);
  const [pagoMinimo, setPagoMinimo] = useState<number>(0);
  const [pagoMensual, setPagoMensual] = useState<number>(0);
  const [resultados, setResultados] = useState<any>(null);

  // Verificar autenticación al inicio y en cambios
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        localStorage.removeItem('lastAnalysis'); // Limpiar datos al no tener usuario
        const currentPath = window.location.pathname;
        router.push(`/signin?returnUrl=${encodeURIComponent(currentPath)}`);
      } else {
        // Solo cargar datos si hay usuario autenticado
        const savedAnalysis = localStorage.getItem('lastAnalysis');
        if (savedAnalysis) {
          const analysis = JSON.parse(savedAnalysis);
          setDeudaActual(Number(analysis.deudaActual));
          setPagoMinimo(Number(analysis.pagoMinimo));
          setPagoMensual(Number(analysis.pagoMinimo));
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  const calcularPagos = () => {
    let meses = 0;
    let totalPagado = 0;
    let deudaRestante = deudaActual;
    const tasaMensual = 0.15; // 15% mensual

    while (deudaRestante > 0 && meses < 120) { // máximo 10 años
      meses++;
      const interesMes = deudaRestante * tasaMensual;
      deudaRestante = deudaRestante + interesMes - pagoMensual;
      totalPagado += pagoMensual;
    }

    setResultados({
      meses,
      totalPagado,
      interesesTotales: totalPagado - deudaActual,
      pagoCompleto: deudaRestante <= 0
    });
  };

  return (
    <div className="w-full">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">Deuda Actual</label>
            <input
              type="text"
              value={deudaActual === 0 ? '' : deudaActual.toString()}
              onChange={(e) => {
                const soloNumeros = e.target.value.replace(/[^\d]/g, '');
                const valor = soloNumeros ? Number(soloNumeros) : 0;
                setDeudaActual(valor);
              }}
              placeholder="Ingresa el monto sin puntos ni comas"
              className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:border-[#FF00FF] focus:ring-1 focus:ring-[#FF00FF] outline-none"
            />
            {deudaActual > 0 && (
              <p className="text-sm text-white/50 mt-1">
                Monto ingresado: ${formatearNumero(deudaActual)}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm text-white/70 mb-2">Pago Mínimo</label>
            <input
              type="text"
              value={formatearNumero(pagoMinimo)}
              onChange={(e) => {
                const valor = e.target.value.replace(/\./g, '').replace(',', '.');
                setPagoMinimo(Number(valor));
              }}
              className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:border-[#FF00FF] focus:ring-1 focus:ring-[#FF00FF] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">¿Cuánto puedes pagar por mes?</label>
            <input
              type="text"
              value={pagoMensual === 0 ? '' : pagoMensual.toString()}
              onChange={(e) => {
                // Remover cualquier caracter que no sea número
                const soloNumeros = e.target.value.replace(/[^\d]/g, '');
                
                // Convertir a número
                const valor = soloNumeros ? Number(soloNumeros) : 0;
                
                setPagoMensual(valor);
              }}
              placeholder="Ingresa el monto sin puntos ni comas"
              className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:border-[#FF00FF] focus:ring-1 focus:ring-[#FF00FF] outline-none"
            />
            {pagoMensual > 0 && (
              <p className="text-sm text-white/50 mt-1">
                Monto ingresado: ${formatearNumero(pagoMensual)}
              </p>
            )}
          </div>

          <button
            onClick={calcularPagos}
            className="w-full px-4 py-2 text-white bg-[#FF00FF] hover:bg-[#FF00FF]/80 rounded-lg transition-colors shadow-[0_0_20px_rgba(255,0,255,0.3)]"
          >
            Calcular
          </button>
        </div>

        {resultados && (
          <div className="space-y-6">
            <div className="p-4 bg-black/20 rounded-lg border border-white/10">
              <h3 className="text-lg text-white/70 mb-4">Resultados</h3>
              <div className="space-y-2">
                <p className="text-white">
                  Tiempo para pagar: <span className="font-bold text-[#FF00FF]">
                    {resultados.pagoCompleto ? `${resultados.meses} meses` : 'Más de 10 años'}
                  </span>
                </p>
                <p className="text-white">
                  Total a pagar: <span className="font-bold text-[#FF00FF]">
                    ${formatearNumero(resultados.totalPagado)}
                  </span>
                </p>
                <p className="text-white">
                  Solo en intereses: <span className="font-bold text-red-400">
                    ${formatearNumero(resultados.interesesTotales)}
                  </span>
                </p>
              </div>
            </div>

            {pagoMensual <= pagoMinimo && (
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <p className="text-sm text-red-400">
                  ⚠️ Pagando solo el mínimo, tu deuda seguirá creciendo por los intereses.
                  Intenta pagar más que el mínimo para salir de la deuda más rápido.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalculadoraPagos; 