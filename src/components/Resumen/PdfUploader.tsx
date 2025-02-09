/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect } from 'react';
import { formatearNumero } from '@/utils/numberFormat';
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAnalysisLimit } from "./AnalysisLimit";
import { toast } from 'react-hot-toast';

const PdfUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const { hasReachedLimit } = useAnalysisLimit();
  const [isLoading, setIsLoading] = useState(false);

  // Verificar autenticación al inicio y en cambios
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        const currentPath = window.location.pathname;
        router.push(`/signin?returnUrl=${encodeURIComponent(currentPath)}`);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Al inicio del componente, intentar cargar datos previos
  useEffect(() => {
    const savedAnalysis = localStorage.getItem('lastAnalysis');
    if (savedAnalysis) {
      setAnalysis(JSON.parse(savedAnalysis));
    }
  }, []);

  // Debug render
  console.log('Renderizando PdfUploader:', {
    tieneArchivo: !!file,
    estadoLoading: false,
    tieneAnalisis: !!analysis,
    error
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Por favor, selecciona un archivo PDF válido');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
        setError('El archivo es demasiado grande. Máximo 10MB');
        return;
      }
      setFile(selectedFile);
      setError(''); // Limpiar cualquier error previo
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type !== 'application/pdf') {
        setError('Por favor, selecciona un archivo PDF válido');
        return;
      }
      if (droppedFile.size > 10 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Máximo 10MB');
        return;
      }
      setFile(droppedFile);
      setError('');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleSubmit = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
        },
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al analizar el PDF');
      }

      if (data.fromCache) {
        toast.success('Análisis recuperado del caché! 🚀');
      }

      setAnalysis(data.analysis);
      localStorage.setItem('lastAnalysis', JSON.stringify(data.analysis)); // Guardar en localStorage
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  // Agregar un efecto para monitorear los cambios de estado
  useEffect(() => {
    console.log('Estado actual:', { 
      loading: false,
      analysis, 
      error 
    });
  }, [analysis, error]);

  // Renderizado condicional
  const content = analysis ? (
    <div className="w-full max-w-4xl space-y-8">
      {/* Resumen Principal - Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#2D1B69] rounded-[24px] p-5 h-[140px]">
          <h3 className="text-xl text-white/70 mb-2">Deuda Actual</h3>
          <p className="text-3xl font-bold text-white">
            ${formatearNumero(Number(analysis.deudaActual))}
          </p>
        </div>

        <div className="bg-[#2D1B69] rounded-[24px] p-5 h-[140px]">
          <h3 className="text-xl text-white/70 mb-2">Pago Mínimo</h3>
          <p className="text-3xl font-bold text-white">
            ${formatearNumero(Number(analysis.pagoMinimo))}
          </p>
        </div>

        <div className="bg-[#2D1B69] rounded-[24px] p-5 h-[140px]">
          <h3 className="text-xl text-white/70 mb-2">Vencimiento</h3>
          <p className="text-3xl font-bold text-white">
            {analysis.fechaVencimiento}
          </p>
        </div>
      </div>

      {/* Simulación de Pagos - Card destacada */}
      <div className="bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-6">¿Qué pasa si pagas solo el mínimo?</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <h4 className="text-lg text-white/70 mb-2">El mes que viene...</h4>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-red-400">$</span>
                <span className="text-2xl font-bold text-red-400 ml-1">
                  {formatearNumero(Number(analysis.deudaActual * 1.15))}
                </span>
              </div>
              <p className="text-sm text-white/50 mt-1">
                Tu deuda crecerá por los intereses acumulados
              </p>
            </div>
            <div>
              <p className="text-lg text-red-400 font-medium">
                Solo en intereses este mes: ${formatearNumero(Number(analysis.deudaActual * 0.15))}
              </p>
              <p className="text-sm text-white/50">
                Casi todo tu pago mínimo se va en intereses, poco reduce tu deuda
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <h4 className="text-lg font-medium text-red-400 mb-2">⚠️ Importante entender</h4>
              <p className="text-sm text-white/70">
                Si solo pagas el mínimo ($101,110), la mayor parte va a intereses. 
                De tu pago, solo ${formatearNumero(Number(analysis.pagoMinimo * 0.15))} reduce tu deuda real.
                A este ritmo, podrías tardar más de 24 meses en cancelar tu deuda y
                terminarías pagando más del doble.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan V y Recomendaciones */}
      <div className="bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-6">Opciones y Recomendaciones</h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-medium text-white/70 mb-4">Sobre el Plan V</h4>
            <div className="space-y-4 text-sm text-white/70">
              <p>
                El Plan V te permite convertir tu saldo actual en cuotas fijas de hasta 24 meses.
                <strong className="block mt-2 text-white">Ventajas:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cuota fija y en pesos</li>
                <li>Tasa preferencial más baja que la financiación regular</li>
                <li>Mejor organización de tus pagos</li>
              </ul>
              <p>
                <strong className="block mt-2 text-white">Consideraciones:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-yellow-300/70">
                <li>Comprometes tu límite de crédito durante el plazo elegido</li>
                <li>Deberás pagar la cuota completa todos los meses</li>
                <li>No podrás cancelar anticipadamente sin costo</li>
              </ul>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-white/70 mb-4">Recomendación de Morita</h4>
            <div className="space-y-4 text-sm text-white/70">
              <p>
                Basándonos en tu situación actual:
              </p>
              {analysis.deudaActual > analysis.pagoMinimo * 3 ? (
                <>
                  <p className="text-green-400">
                    ✅ Recomendamos considerar el Plan V ya que tu deuda actual ({formatearNumero(Number(analysis.deudaActual))}) 
                    es significativa comparada con tu pago mínimo.
                  </p>
                  <p>
                    Con Plan V, podrías pagar aproximadamente $ {formatearNumero(Number(analysis.deudaActual / 18))} 
                    mensuales en 18 cuotas, en lugar de los $ {formatearNumero(Number(analysis.pagoMinimo))} 
                    de pago mínimo que solo cubren intereses.
                  </p>
                </>
              ) : (
                <p className="text-yellow-400">
                  ⚠️ Tu deuda actual es manejable. Recomendamos pagar más que el mínimo para evitar 
                  acumular intereses, pero el Plan V podría no ser necesario en tu caso.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Explicación de Tasas */}
      <div className="bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-6">Entendiendo tus Tasas de Manera Simple</h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-white/70 mb-2">CFT - El Costo Real de tu Deuda</h4>
              <p className="text-sm text-white/70">
                En tu caso, con una deuda de ${formatearNumero(Number(analysis.deudaActual))}, 
                si solo pagas el mínimo, en un año terminarás pagando ${formatearNumero(Number(analysis.deudaActual * 1.95))} en total.
                Es como si por cada $1,000 que debes, terminaras pagando $1,950. 
                Por eso es importante pagar más que el mínimo.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-white/70 mb-2">TNA - Lo que te Cobran por Mes</h4>
              <p className="text-sm text-white/70">
                Con tu pago mínimo actual de ${formatearNumero(Number(analysis.pagoMinimo))}, 
                aproximadamente ${formatearNumero(Number(analysis.pagoMinimo * 0.85))} se van solo en intereses.
                Es como si de cada $100 que pagas, $85 fueran para el banco y solo $15 para reducir tu deuda.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-white/70 mb-2">TEA - Por Qué tu Deuda Crece Tan Rápido</h4>
              <p className="text-sm text-white/70">
                Si este mes debes ${formatearNumero(Number(analysis.deudaActual))} y solo pagas el mínimo,
                el mes que viene deberás ${formatearNumero(Number(analysis.deudaActual * 1.15))}.
                Es como una bola de nieve: cada mes que no pagas el total, los intereses se suman a tu deuda
                y luego te cobran intereses sobre esos intereses.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium text-white/70 mb-2">Tasa Punitoria - El Castigo por Atrasarte</h4>
              <p className="text-sm text-white/70">
                Si te atrasas en el pago mínimo de ${formatearNumero(Number(analysis.pagoMinimo))},
                además de los intereses normales de ${formatearNumero(Number(analysis.pagoMinimo * 0.85))},
                te cobrarán ${formatearNumero(Number(analysis.pagoMinimo * 0.425))} extra de penalidad.
                Por eso es crucial nunca atrasarte en los pagos.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-red-500/10 rounded-xl border border-red-500/20">
          <h4 className="text-lg font-medium text-red-400 mb-4">
            ⚠️ Lo que necesitas saber
          </h4>
          <p className="text-sm text-white/70">
            Con tu deuda actual de ${formatearNumero(Number(analysis.deudaActual))}, si sigues pagando solo el mínimo:
            <br/>• En 6 meses habrás pagado ${formatearNumero(Number(analysis.pagoMinimo * 6))} pero tu deuda seguirá siendo casi la misma
            <br/>• En 1 año podrías terminar debiendo más de ${formatearNumero(Number(analysis.deudaActual * 1.3))} a pesar de haber pagado ${formatearNumero(Number(analysis.pagoMinimo * 12))}
            <br/>• La única forma de salir de esta situación es pagar más que el mínimo o considerar el Plan V
          </p>
        </div>
      </div>

      {/* Botón para nuevo análisis */}
      <div className="text-center">
        <button
          onClick={() => {
            setAnalysis(null);
            setFile(null);
            setError("");
            localStorage.removeItem('lastAnalysis'); // Limpiar localStorage
          }}
          className="px-8 py-3 text-white bg-gradient-to-r from-[#FF00FF] to-purple-600 rounded-lg hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(255,0,255,0.3)]"
        >
          Analizar Otro Resumen
        </button>
      </div>
    </div>
  ) : (
    <div className="w-full max-w-xl p-8 bg-black/20 backdrop-blur-lg rounded-2xl shadow-xl border border-white/10">
      <form onSubmit={(e) => {
        e.preventDefault();
        if (file) handleSubmit(file);
      }} className="space-y-6">
        <div className="flex flex-col items-center justify-center w-full">
          <label 
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer border-white/10 hover:border-[#FF00FF]/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {file ? (
                <>
                  <svg className="w-10 h-10 mb-3 text-[#FF00FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <p className="mb-2 text-sm text-white/70">
                    <span className="font-semibold text-[#FF00FF]">PDF subido correctamente:</span>
                  </p>
                  <p className="text-xs text-white/50">{file.name}</p>
                </>
              ) : (
                <>
                  <svg className="w-10 h-10 mb-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mb-2 text-sm text-white/70">
                    <span className="font-semibold">Click para subir</span> o arrastra y suelta
                  </p>
                  <p className="text-xs text-white/50">PDF (MAX. 10MB)</p>
                </>
              )}
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
          disabled={!file || isLoading}
          className="w-full px-4 py-2 text-white bg-[#FF00FF] hover:bg-[#FF00FF]/80 disabled:opacity-50 rounded-lg transition-colors shadow-[0_0_20px_rgba(255,0,255,0.3)]"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analizando...
            </div>
          ) : (
            'Analizar PDF'
          )}
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 text-red-200 rounded-lg">
          {error}
        </div>
      )}
      
      {content}
    </div>
  );
};

export default PdfUploader; 