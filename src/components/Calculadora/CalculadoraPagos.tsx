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

  const calcularTiempoTotal = (deuda: number, pagoMensual: number, tasaMensual: number) => {
    let meses = 0;
    let deudaRestante = deuda;
    
    while (deudaRestante > 0 && meses < 120) {
      meses++;
      const interesMes = deudaRestante * tasaMensual;
      deudaRestante = deudaRestante + interesMes - pagoMensual;
    }
    
    if (meses >= 120) {
      return 'más de 10 años';
    } else {
      const años = Math.floor(meses / 12);
      const mesesRestantes = meses % 12;
      
      let resultado = '';
      
      if (años > 0) {
        resultado += `${años} ${años === 1 ? 'año' : 'años'}`;
        if (mesesRestantes > 0) {
          resultado += ` y ${mesesRestantes} ${mesesRestantes === 1 ? 'mes' : 'meses'}`;
        }
      } else {
        resultado = `${mesesRestantes} ${mesesRestantes === 1 ? 'mes' : 'meses'}`;
      }
      
      return resultado;
    }
  };

  const calcularPagos = () => {
    const tasaMensual = 0.15; // 15% mensual
    const deudaDespuesDelPago = deudaActual - pagoMensual;
    const interesesGenerados = deudaDespuesDelPago * tasaMensual;
    const deudaSiguienteMes = deudaDespuesDelPago + interesesGenerados;
    
    let recomendacion = '';
    let tipoAlerta = '';
    let tiempoEstimado = '';

    if (pagoMensual >= deudaActual) {
      recomendacion = `🎉 ¡Excelente decisión! Estás pagando la totalidad de tu deuda. Esto te ahorrará $${formatearNumero(interesesGenerados)} en intereses y mantendrá tu historial crediticio en perfecto estado.`;
      tipoAlerta = 'success';
    } else if (pagoMensual < pagoMinimo) {
      tiempoEstimado = calcularTiempoTotal(deudaSiguienteMes, pagoMensual, tasaMensual);
      recomendacion = `⚠️ ¡Cuidado! Pagar menos que el mínimo ($${formatearNumero(pagoMinimo)}) afectará tu historial crediticio. Con este nivel de pago ($${formatearNumero(pagoMensual)}), la deuda crecerá significativamente y tomaría ${tiempoEstimado} liquidarla.`;
      tipoAlerta = 'error';
    } else if (pagoMensual === pagoMinimo) {
      tiempoEstimado = calcularTiempoTotal(deudaSiguienteMes, pagoMensual, tasaMensual);
      recomendacion = `⚠️ Pagando solo el mínimo, tu deuda seguirá creciendo significativamente por los intereses. Con este nivel de pago, tardarías ${tiempoEstimado} en liquidar la deuda. Intenta pagar más si es posible.`;
      tipoAlerta = 'warning';
    } else {
      tiempoEstimado = calcularTiempoTotal(deudaSiguienteMes, pagoMensual, tasaMensual);
      recomendacion = `✅ Buen pago! Estás pagando más que el mínimo, lo que ayudará a reducir tu deuda más rápido. Manteniendo este nivel de pago ($${formatearNumero(pagoMensual)}), podrías terminar de pagar en aproximadamente ${tiempoEstimado}.`;
      tipoAlerta = 'success';
    }

    setResultados({
      deudaActual,
      pagoRealizado: pagoMensual,
      deudaDespuesDelPago,
      interesesGenerados,
      deudaSiguienteMes,
      recomendacion,
      tipoAlerta,
      tiempoEstimado
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
            <label className="block text-sm text-white/70 mb-2">¿Cuánto vas a pagar este mes?</label>
            <input
              type="text"
              value={pagoMensual === 0 ? '' : pagoMensual.toString()}
              onChange={(e) => {
                const soloNumeros = e.target.value.replace(/[^\d]/g, '');
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
            <div className="p-6 bg-black/20 rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Resultados del Escenario</h3>
              
              <div className="space-y-3">
                <p className="text-white">
                  Deuda actual: <span className="font-bold text-white">${formatearNumero(resultados.deudaActual)}</span>
                </p>
                <p className="text-white">
                  Pago a realizar: <span className="font-bold text-[#FF00FF]">${formatearNumero(resultados.pagoRealizado)}</span>
                </p>
                <p className="text-white">
                  Deuda después del pago: <span className="font-bold text-white">${formatearNumero(resultados.deudaDespuesDelPago)}</span>
                </p>
                <p className="text-white">
                  Intereses generados: <span className="font-bold text-red-400">${formatearNumero(resultados.interesesGenerados)}</span>
                </p>
                <p className="text-white">
                  Deuda siguiente mes: <span className="font-bold text-red-400">${formatearNumero(resultados.deudaSiguienteMes)}</span>
                </p>
                {resultados.tiempoEstimado && pagoMensual !== deudaActual && (
                  <p className="text-white mt-4 pt-4 border-t border-white/10">
                    Tiempo estimado para pagar la totalidad: <span className="font-bold text-[#FF00FF]">{resultados.tiempoEstimado}</span>
                  </p>
                )}
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              resultados.tipoAlerta === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
              resultados.tipoAlerta === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
              'bg-green-500/10 border-green-500/20 text-green-400'
            }`}>
              <p className="text-sm">{resultados.recomendacion}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalculadoraPagos; 