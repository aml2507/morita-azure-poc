"use client";
import { useState } from 'react';

// Función para formatear números al estilo argentino
const formatearNumero = (numero: number): string => {
  return numero.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const PaymentCalculator = () => {
  const [montoAPagar, setMontoAPagar] = useState<string>('');
  const [deudaActual] = useState(132862.05);
  const [pagoMinimo] = useState(101110.00);
  const [calculo, setCalculo] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Solo permitir números
    if (/^\d*$/.test(inputValue) || inputValue === '') {
      setMontoAPagar(inputValue);
      if (inputValue) {
        const monto = Number(inputValue);
        setCalculo(calcularEscenario(monto));
      } else {
        setCalculo(null);
      }
    }
  };

  const calcularEscenario = (monto: number) => {
    const deudaRestante = deudaActual - monto;
    const tasaMensual = 0.0931;
    const interesesProximoMes = deudaRestante * tasaMensual;
    const interesesConMinimo = (deudaActual - pagoMinimo) * tasaMensual;
    const ahorroEnIntereses = interesesConMinimo - interesesProximoMes;

    return {
      deudaRestante: formatearNumero(deudaRestante),
      interesesProximoMes: formatearNumero(interesesProximoMes),
      interesesConMinimo: formatearNumero(interesesConMinimo),
      ahorroEnIntereses: formatearNumero(ahorroEnIntereses),
      deudaProximoMes: formatearNumero(deudaRestante + interesesProximoMes)
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-dark rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="text-2xl">🧮</span> Calculadora de Pagos
        </h2>

        <div className="mb-6">
          <label className="block text-lg font-semibold mb-4">¿Cuánto quieres pagar este mes?</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="text"
              value={montoAPagar}
              onChange={handleInputChange}
              className="w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700"
              placeholder=""
            />
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Deuda actual: ${formatearNumero(deudaActual)} | Pago mínimo: ${formatearNumero(pagoMinimo)}
          </div>
        </div>

        {calculo && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">
              Con tu pago de ${formatearNumero(Number(montoAPagar))}
            </h3>

            {/* Deuda restante */}
            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-blue-900 dark:text-blue-100">Deuda restante</h4>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                $ {calculo.deudaRestante}
              </p>
            </div>

            {/* Intereses próximo mes */}
            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-green-900 dark:text-green-100">
                Intereses próximo mes
              </h4>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                $ {calculo.interesesProximoMes}
              </p>
            </div>

            {/* Comparación con pago mínimo */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-medium mb-2">Comparación con pago mínimo</h4>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span>Intereses pagando el mínimo</span>
                  <span className="font-semibold">$ {calculo.interesesConMinimo}</span>
                </p>
                <p className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Ahorras en intereses</span>
                  <span className="font-semibold">$ {calculo.ahorroEnIntereses}</span>
                </p>
              </div>
            </div>

            {/* Resumen del impacto */}
            <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg">
              <h4 className="text-lg font-medium mb-2 flex items-center gap-2">
                📊 Resumen del impacto
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {`Pagando $ ${formatearNumero(Number(montoAPagar))}, tu deuda el próximo mes será de $ ${calculo.deudaProximoMes} (incluyendo intereses). Esto representa un ahorro de $ ${calculo.ahorroEnIntereses} en intereses comparado con pagar solo el mínimo.`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCalculator; 