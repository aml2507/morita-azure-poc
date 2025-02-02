"use client";
import { useState } from 'react';
import { formatearNumero } from '@/utils/numberFormat';

const PdfUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    console.log('Archivo seleccionado:', selectedFile);
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Iniciando submit...');
    if (!file) {
      console.log('No hay archivo seleccionado');
      return;
    }

    setLoading(true);
    try {
      console.log('Enviando archivo...');
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        body: formData,
      });

      console.log('Respuesta recibida:', response);
      const data = await response.json();
      console.log('Datos recibidos:', data);
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error en el proceso:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {!analysis ? (
        <div className="w-full max-w-xl p-8 bg-white rounded-lg shadow-md dark:bg-gray-dark">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click para subir</span> o arrastra y suelta
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PDF (MAX. 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={!file || loading}
              className="w-full px-4 py-2 text-white bg-primary rounded hover:bg-primary/80 disabled:opacity-50"
              onClick={() => console.log('Botón clickeado, archivo:', file)}
            >
              {loading ? 'Analizando...' : 'Analizar PDF'}
            </button>
          </form>
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          {/* Alerta de Intereses Altos */}
          {analysis.simulacionPagoMinimo.totalPagar > "200" && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 rounded-r-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    ⚠️ Alerta de Intereses Altos
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p>
                      {`Tu tarjeta tiene un Costo Financiero Total (CFT) del ${analysis.simulacionPagoMinimo.totalPagar} anual. 
                      Esto significa que una deuda de $ 10.000 podría convertirse en $ ${formatearNumero(10000 * parseFloat(analysis.simulacionPagoMinimo.totalPagar) / 100)} en un año.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resumen Principal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-primary">Deuda Actual</h3>
              <p className="text-2xl font-bold">$ {formatearNumero(Number(analysis.deudaActual))}</p>
            </div>
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-primary">Pago Mínimo</h3>
              <p className="text-2xl font-bold">$ {formatearNumero(Number(analysis.pagoMinimo))}</p>
            </div>
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-primary">Fecha de Vencimiento</h3>
              <p className="text-2xl font-bold">{analysis.fechaVencimiento}</p>
            </div>
          </div>

          {/* Análisis Detallado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Distribución de Gastos */}
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-4">Distribución de Gastos</h3>
              <div className="space-y-4">
                {analysis.distribucionGastos.map((gasto: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{gasto.categoria}</span>
                    <span className="font-semibold">$ {formatearNumero(Number(gasto.monto))}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulación de Pagos */}
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-4">Si pagas solo el mínimo...</h3>
              <div className="space-y-2">
                <p>Terminarás pagando: <span className="font-semibold text-red-500">$ {formatearNumero(Number(analysis.simulacionPagoMinimo.totalPagar))}</span></p>
                <p>Tiempo para saldar la deuda: <span className="font-semibold">{analysis.simulacionPagoMinimo.tiempoEstimado}</span></p>
                <p>Intereses totales: <span className="font-semibold text-red-500">$ {formatearNumero(Number(analysis.simulacionPagoMinimo.interesesTotales))}</span></p>
              </div>
            </div>

            {/* Recomendaciones */}
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-md col-span-full">
              <h3 className="text-xl font-semibold mb-4">Tips para Ahorrar</h3>
              <ul className="list-disc list-inside space-y-2">
                {analysis.recomendaciones.map((tip: string, index: number) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>

            {/* Nueva sección: Explicación de Tasas */}
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-md col-span-full mt-6">
              <h3 className="text-xl font-semibold mb-4">Entendiendo las Tasas de tu Tarjeta</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-2">CFT (Costo Financiero Total)</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Es el costo real total que pagarás por tu deuda, incluyendo todos los gastos y comisiones. 
                      En tu caso es <span className="font-semibold text-red-500">{analysis.simulacionPagoMinimo.totalPagar}</span>.
                      Es el número más importante a considerar cuando financias una compra.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-2">TNA (Tasa Nominal Anual)</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Es la tasa básica que te muestra el banco, pero no incluye el efecto de la capitalización 
                      ni otros costos. Es como el "precio de lista" pero no refleja el costo real que pagarás.
                      Tu TNA es <span className="font-semibold">{analysis.simulacionPagoMinimo.interesesTotales}</span>.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-2">TEA (Tasa Efectiva Anual)</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Es la tasa que considera el efecto de la capitalización (interés sobre interés).
                      Es más alta que la TNA porque incluye el impacto de pagar intereses sobre los intereses 
                      acumulados cada mes.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-2">Tasa Punitoria</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Es un cargo extra que se aplica cuando te atrasas en los pagos. 
                      Funciona como una penalidad y se suma a la tasa normal, haciendo la deuda mucho más cara.
                      <span className="block mt-2 text-red-500 font-medium">
                        ¡Importante! Evita los pagos atrasados, ya que la tasa punitoria puede duplicar el costo de tu deuda.
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Ejemplo práctico */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                <h4 className="text-md font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Ejemplo Práctico 💡
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Si compras algo por $ 10.000 y solo pagas el mínimo:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
                  <li>La TNA te dice que pagarías ~{analysis.simulacionPagoMinimo.interesesTotales} de interés al año</li>
                  <li>Pero el CFT ({analysis.simulacionPagoMinimo.totalPagar}) muestra que realmente terminarás pagando $ {formatearNumero(10000 * parseFloat(analysis.simulacionPagoMinimo.totalPagar) / 100)}</li>
                  <li>Si te atrasas, la tasa punitoria podría aumentar aún más este monto</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botón para nuevo análisis */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setAnalysis(null)}
              className="px-6 py-2 text-white bg-primary rounded hover:bg-primary/80"
            >
              Analizar Otro Resumen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfUploader; 