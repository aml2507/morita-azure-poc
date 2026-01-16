/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect } from 'react';
import { formatearNumero, formatearTasa } from '@/utils/numberFormat';
import { useAnalysisLimit } from "./AnalysisLimit";
import { toast } from 'react-hot-toast';
import { formatearFecha } from "@/utils/dateFormat";
import { generateStatementHash } from '@/lib/cache/hashGenerator';

// Actualizar la interfaz para incluir más detalles
interface AnalysisResult {
  deudaActual: number;
  pagoMinimo: number;
  fechaVencimiento: string;
  entidadBancaria: string;
  pagoFlex?: {
    entregaMinima: number;
    cantidadCuotas: number;
    valorCuota: number;
  };
  cargosAdicionales?: {
    iva: number;
    sellos: number;
    comisiones: number;
    baseImponible?: number;
  };
  tasas: {
    tem: number;
    tea: number;
    cft: number;
    tna: number;
  };
  planesDisponibles?: {
    nombre: string;
    descripcion: string;
    tasaPreferencial?: number;
    plazosDisponibles?: number[];
  }[];
  informacionLegal?: {
    tasasVigentes: {
      financiacion: number;
      punitorios: number;
      compensatorios?: number;
    };
    seguros?: {
      vida: number;
      otros?: string[];
    };
    limitesOperativos?: {
      adelantos?: number;
      compras?: number;
      creditoDisponible?: number;
    };
    fechas: {
      cierre: string;
      vencimiento: string;
      proximoCierre?: string;
    };
    advertencias?: string[];
    notasImportantes?: string[];
  };
  tendenciasGasto?: {
    categoria: string;
    variacion: number;
    observacion: string;
  }[];
  comparativaMensual?: {
    gastoActual: number;
    interesesActual: number;
    variacionGasto: number;
    variacionIntereses: number;
    analisisTendencia: string;
  };
  conceptosFinancieros?: {
    termino: string;
    explicacion: string;
    ejemplo?: string;
  }[];
  tipsFinancieros?: {
    titulo: string;
    descripcion: string;
    beneficio?: string;
  }[];
  analisisComparativo?: {
    diferenciasEncontradas: {
      campo: string;
      valorAnterior: number | string;
      valorActual: number | string;
      variacionPorcentual: number;
      impacto: "POSITIVO" | "NEGATIVO" | "NEUTRAL";
      observacion: string;
    }[];
    tendencias: {
      gastos: string;
      intereses: string;
      utilizacionCredito: string;
    };
    recomendaciones: string[];
  };
  timestamp: number;
  previousAnalysisId?: string;
  planesEspeciales?: {
    nombre: string | null;
    descripcion: string | null;
    requisitos: string[] | null;
    beneficios: string[] | null;
    tasaPreferencial?: number;
    plazosDisponibles?: number[];
    cuotaEstimada?: number;
  };
  fechas: {
    cierre: string;
    vencimiento: string;
    proximoCierre: string | null;
  };
  alertas?: {
    advertencias: string[];
    cargosInusuales: string[];
    tasasAltas: string[];
  };
  recomendaciones?: {
    urgentes: string[] | null;
    generales: string[] | null;
  };
}

// Agregar una interfaz para consejos educativos
interface ConsejoEducativo {
  titulo: string;
  explicacion: string;
  impacto: string;
  recomendacion: string;
  ejemplo?: string;
}

interface PdfUploaderProps {
  initialAnalysisId?: string | null;
  onReset?: () => void;
}

const PdfUploader = ({ initialAnalysisId, onReset }: PdfUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [analyses, setAnalyses] = useState<{[key: string]: AnalysisResult}>({});
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // POC: Autenticación deshabilitada
  const { hasReachedLimit, analysisCount, monthlyLimit, isLoading: limitLoading, refreshLimit } = useAnalysisLimit();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<{ fromCache?: boolean } | null>(null);

  // Al inicio del componente, intentar cargar datos previos
  useEffect(() => {
    const savedAnalyses = localStorage.getItem('savedAnalyses');
    if (savedAnalyses) {
      setAnalyses(JSON.parse(savedAnalyses));
    }
  }, []);

  useEffect(() => {
    if (initialAnalysisId) {
      setCurrentAnalysisId(initialAnalysisId);
    }
  }, [initialAnalysisId]);

  // Debug render
  console.log('Renderizando PdfUploader:', {
    tieneArchivo: !!file,
    estadoLoading: false,
    tieneAnalisis: !!analyses,
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
      // Generar hash del PDF
      const pdfText = await file.text();
      const pdfHash = generateStatementHash(pdfText);
      
      // Verificar caché local
      const savedAnalysesCache = localStorage.getItem('savedAnalyses');
      if (savedAnalysesCache) {
        const analysesCache = JSON.parse(savedAnalysesCache);
        if (analysesCache[pdfHash]) {
          console.log('Análisis encontrado en caché local');
          setAnalyses(prevAnalyses => ({
            ...prevAnalyses,
            [pdfHash]: analysesCache[pdfHash]
          }));
          setCurrentAnalysisId(pdfHash);
          setIsLoading(false);
          toast.success('Resumen recuperado de caché');
          return;
        }
      }

      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('hash', pdfHash);

      // POC: Autenticación deshabilitada - no enviar token
      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Actualizar caché local
        const updatedAnalyses = {
          ...analyses,
          [pdfHash]: result.analysis
        };
        localStorage.setItem('savedAnalyses', JSON.stringify(updatedAnalyses));

        // Actualizar estado
        setAnalyses(updatedAnalyses);
        setCurrentAnalysisId(pdfHash);
        
        // Forzar actualización del límite
        await refreshLimit?.();

        toast.success('Resumen analizado correctamente');
      } else {
        setError(result.error || 'Error al analizar el PDF');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al procesar el archivo');
    } finally {
      setIsLoading(false);
    }
  };

  // Agregar un efecto para monitorear los cambios de estado
  useEffect(() => {
    console.log('Estado actual:', { 
      loading: false,
      analyses, 
      error 
    });
  }, [analyses, error]);

  const handleReset = () => {
    // Limpiar estados locales
    setCurrentAnalysisId(null);
    setFile(null);
    setError(null);
    setAnalyses({});
    localStorage.removeItem('savedAnalyses');
    
    // Usar window.location.replace para una redirección limpia
    window.location.replace('/resumen');
  };

  // Renderizado condicional
  const content = currentAnalysisId ? (
    <div className="w-full space-y-6">
      {/* Cards principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#2D1B69] rounded-[24px] p-5 h-[140px]">
          <h3 className="text-xl text-white/70 mb-2">Deuda Actual</h3>
          <p className="text-3xl font-bold text-white">
            ${formatearNumero(analyses[currentAnalysisId]?.deudaActual || 0)}
          </p>
        </div>

        <div className="bg-[#2D1B69] rounded-[24px] p-5 h-[140px]">
          <h3 className="text-xl text-white/70 mb-2">Pago Mínimo</h3>
          <p className="text-3xl font-bold text-white">
            ${formatearNumero(analyses[currentAnalysisId]?.pagoMinimo || 0)}
          </p>
        </div>

        <div className="bg-[#2D1B69] rounded-[24px] p-5 h-[140px]">
          <h3 className="text-xl text-white/70 mb-2">Vencimiento</h3>
          <p className="text-3xl font-bold text-white">
            {formatearFecha(analyses[currentAnalysisId]?.fechaVencimiento)}
          </p>
        </div>
      </div>

      {/* Análisis de Pago Mínimo - Inmediatamente después de las cards principales */}
      <AnalisisPagoMinimo analysis={analyses[currentAnalysisId]} />

      {/* Simulación de Pagos - Card destacada */}
      <div className="bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-6">¿Qué pasa si pagas solo el mínimo?</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {analyses[currentAnalysisId] && (
              <>
                <div>
                  <h4 className="text-lg text-white/70 mb-2">El mes que viene...</h4>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-red-400">$</span>
                    <span className="text-2xl font-bold text-red-400 ml-1">
                      {formatearNumero(analyses[currentAnalysisId].deudaActual * 1.15)}
                    </span>
                  </div>
                  <p className="text-sm text-white/50 mt-1">
                    Tu deuda crecerá por los intereses acumulados
                  </p>
                </div>
                <div>
                  <p className="text-lg text-red-400 font-medium">
                    Solo en intereses este mes: ${formatearNumero(analyses[currentAnalysisId].deudaActual * 0.15)}
                  </p>
                  <p className="text-sm text-white/50">
                    Casi todo tu pago mínimo se va en intereses, poco reduce tu deuda
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="space-y-4">
            {analyses[currentAnalysisId] && (
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <h4 className="text-lg font-medium text-red-400 mb-2">⚠️ Importante entender</h4>
                <p className="text-sm text-white/70">
                  Si solo pagas el mínimo (${formatearNumero(analyses[currentAnalysisId].pagoMinimo)}), la mayor parte va a intereses. 
                  De tu pago, solo ${formatearNumero(analyses[currentAnalysisId].pagoMinimo * 0.15)} reduce tu deuda real.
                  A este ritmo, podrías tardar más de 24 meses en cancelar tu deuda y
                  terminarías pagando más del doble.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Explicación de Tasas */}
      {analyses[currentAnalysisId] && (
        <TasasExplicacionSection analysis={analyses[currentAnalysisId]} />
      )}

      {/* Plan V y Recomendaciones */}
      {analyses[currentAnalysisId] && (
        <RecomendacionesSection analysis={analyses[currentAnalysisId]} />
      )}

      {/* Educación Financiera */}
      {analyses[currentAnalysisId] && (
        <EducacionFinancieraSection analysis={analyses[currentAnalysisId]} />
      )}

      {/* Análisis Comparativo - solo si existe análisis y análisis previo */}
      {analyses[currentAnalysisId]?.analisisComparativo && (
        <AnalisisComparativoSection 
          analysis={analyses[currentAnalysisId]} 
          previousAnalysis={
            analyses[currentAnalysisId]?.previousAnalysisId 
              ? analyses[analyses[currentAnalysisId]?.previousAnalysisId] 
              : null
          }
        />
      )}

      {/* Plan V si está disponible */}
      {analyses[currentAnalysisId] && (
        <PlanVSection analysis={analyses[currentAnalysisId]} />
      )}

      {/* Botón para analizar otro resumen - Ahora al final de todo */}
      <div className="text-center mt-8">
        <button
          onClick={handleReset}
          className="px-8 py-3 text-white bg-gradient-to-r from-[#FF00FF] to-purple-600 rounded-lg hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(255,0,255,0.3)]"
        >
          Analizar Otro Resumen
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="w-full max-w-xl p-8 bg-black/20 backdrop-blur-lg rounded-2xl shadow-xl border border-white/10">
        {hasReachedLimit && (
          <div className="mb-4 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <p className="text-yellow-400 text-sm">
              ⚠️ Has alcanzado el límite de 2 análisis este mes. 
              Podrás analizar más resúmenes el próximo mes.
            </p>
          </div>
        )}

        <form onSubmit={(e) => {
          e.preventDefault();
          if (file) handleSubmit(file);
        }} className="space-y-6">
          <div className="flex flex-col items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-white/10 border-dashed rounded-lg cursor-pointer bg-black/20 hover:bg-black/30"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {file ? (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-[#FF00FF]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <p className="mb-2 text-sm text-white">
                    PDF subido correctamente:
                  </p>
                  <p className="text-xs text-white/70">
                    {file.name}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 mb-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-4-4V4a2 2 0 012-2h4a2 2 0 012 2v8a2 2 0 01-2 2H7zm0 0v2a4 4 0 004 4h2"></path>
                  </svg>
                  <p className="mb-2 text-sm text-white/70">
                    <span className="font-semibold">Click para subir</span> o arrastra y suelta
                  </p>
                  <p className="text-xs text-white/50">PDF (MAX. 10MB)</p>
                </div>
              )}
            </label>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handleFileChange}
            />
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
                {isLoading && (response?.fromCache ? 'Recuperando del caché...' : 'Analizando...')}
              </div>
            ) : (
              'Analizar PDF'
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/20 text-red-200 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {!currentAnalysisId ? (
        content
      ) : (
        <div className="w-full space-y-6">
          {/* Cards principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#2D1B69] rounded-[24px] p-5 h-[140px]">
              <h3 className="text-xl text-white/70 mb-2">Deuda Actual</h3>
              <p className="text-3xl font-bold text-white">
                ${formatearNumero(analyses[currentAnalysisId]?.deudaActual || 0)}
              </p>
            </div>

            <div className="bg-[#2D1B69] rounded-[24px] p-5 h-[140px]">
              <h3 className="text-xl text-white/70 mb-2">Pago Mínimo</h3>
              <p className="text-3xl font-bold text-white">
                ${formatearNumero(analyses[currentAnalysisId]?.pagoMinimo || 0)}
              </p>
            </div>

            <div className="bg-[#2D1B69] rounded-[24px] p-5 h-[140px]">
              <h3 className="text-xl text-white/70 mb-2">Vencimiento</h3>
              <p className="text-3xl font-bold text-white">
                {formatearFecha(analyses[currentAnalysisId]?.fechaVencimiento)}
              </p>
            </div>
          </div>

          {/* Análisis de Pago Mínimo */}
          <AnalisisPagoMinimo analysis={analyses[currentAnalysisId]} />

          {/* Explicación de Tasas */}
          <TasasExplicacionSection analysis={analyses[currentAnalysisId]} />

          {/* Educación Financiera */}
          <EducacionFinancieraSection analysis={analyses[currentAnalysisId]} />

          {/* Plan V al final */}
          <PlanVSection analysis={analyses[currentAnalysisId]} />

          {/* Botón para analizar otro resumen - Ahora al final de todo */}
          <div className="text-center mt-8">
            <button
              onClick={handleReset}
              className="px-8 py-3 text-white bg-gradient-to-r from-[#FF00FF] to-purple-600 rounded-lg hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(255,0,255,0.3)]"
            >
              Analizar Otro Resumen
            </button>
          </div>

          {/* Mostrar contador de análisis restantes */}
          {!hasReachedLimit && (
            <div className="text-center mt-4">
              <p className="text-sm text-white/50">
                Te quedan {monthlyLimit - analysisCount} análisis disponibles este mes
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Modificar la sección de planes especiales para explicar mejor el Plan V
const PlanesEspecialesSection = ({ analysis }: { analysis: AnalysisResult }) => {
  if (!analysis.planesEspeciales?.nombre) return null;

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10">
      <h3 className="text-xl font-semibold text-white mb-6">
        Plan V - Financiación Especial
      </h3>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Explicación Simple */}
        <div>
          <h4 className="text-lg font-medium text-white/70 mb-4">¿Qué es el Plan V?</h4>
          <div className="p-4 bg-white/5 rounded-lg">
            <p className="text-sm text-white/70">
              El Plan V es una opción que te permite:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Convertir el total de tu deuda en cuotas fijas</li>
                <li>Tener una tasa de interés más baja que la normal</li>
                <li>Saber exactamente cuánto vas a pagar cada mes</li>
                <li>Tener un plazo fijo para terminar de pagar</li>
              </ul>
            </p>
          </div>
        </div>

        {/* Ventajas y Desventajas */}
        <div className="space-y-4">
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <h4 className="text-lg font-medium text-green-400 mb-2">
              Ventajas 👍
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-white/70">
              <li>Cuota fija y predecible cada mes</li>
              <li>Tasa de interés más baja que la normal</li>
              <li>Fecha definida para terminar de pagar</li>
              <li>Evitas que la deuda siga creciendo</li>
            </ul>
          </div>

          <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <h4 className="text-lg font-medium text-yellow-400 mb-2">
              Consideraciones ⚠️
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-white/70">
              <li>No podrás usar la tarjeta hasta pagar cierto porcentaje</li>
              <li>Te comprometes a pagar una cuota fija cada mes</li>
              <li>Puede haber cargos por adhesión al plan</li>
            </ul>
          </div>
        </div>

        {/* Recomendación */}
        <div className="col-span-2 mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <h4 className="text-lg font-medium text-blue-400 mb-2">
            ¿Te conviene el Plan V? 💡
          </h4>
          <p className="text-sm text-white/70">
            El Plan V puede ser una buena opción si:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Tu deuda es alta y te cuesta manejarla</li>
              <li>Quieres una cuota fija y predecible</li>
              <li>Prefieres un plan organizado de pagos</li>
              <li>Puedes comprometerte a pagar la cuota mensual</li>
            </ul>
          </p>
        </div>
      </div>
    </div>
  );
};

// Mejorar la sección de información legal
const InformacionLegalSection = ({ analysis }: { analysis: AnalysisResult }) => {
  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10">
      <h3 className="text-xl font-semibold text-white mb-6">
        Información Legal Importante
      </h3>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Tasas y Cargos */}
        <div>
          <h4 className="text-lg font-medium text-white/70 mb-4">
            Tasas y Cargos Vigentes
          </h4>
          <div className="p-4 bg-white/5 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-white/70">Tasa Financiación:</span>
              <span className="text-white font-medium">
                {analysis.tasas.tem ? `${(analysis.tasas.tem * 100).toFixed(2)}%` : 'No disponible'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">CFT (Costo Financiero Total):</span>
              <span className="text-white font-medium">
                {analysis.tasas.cft ? `${(analysis.tasas.cft * 100).toFixed(2)}%` : 'No disponible'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Seguro de Vida:</span>
              <span className="text-white font-medium">
                {analysis.informacionLegal?.seguros?.vida ? 
                  `${(analysis.informacionLegal.seguros.vida * 100).toFixed(2)}%` : 
                  'No disponible'}
              </span>
            </div>
          </div>
        </div>

        {/* Fechas Importantes */}
        <div>
          <h4 className="text-lg font-medium text-white/70 mb-4">
            Fechas Importantes
          </h4>
          <div className="p-4 bg-white/5 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-white/70">Cierre:</span>
              <span className="text-white font-medium">
                {new Date(analysis.fechas.cierre).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Vencimiento:</span>
              <span className="text-white font-medium">
                {new Date(analysis.fechas.vencimiento).toLocaleDateString()}
              </span>
            </div>
            {analysis.fechas.proximoCierre && (
              <div className="flex justify-between">
                <span className="text-white/70">Próximo Cierre:</span>
                <span className="text-white font-medium">
                  {new Date(analysis.fechas.proximoCierre).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Advertencias */}
        {(analysis.alertas?.advertencias?.length > 0) && (
          <div className="col-span-2">
            <h4 className="text-lg font-medium text-yellow-400 mb-4">
              ⚠️ Información Importante
            </h4>
            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <ul className="space-y-2">
                {analysis.alertas.advertencias.map((advertencia, index) => (
                  <li key={index} className="text-sm text-white/70">
                    • {advertencia}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Modificar la sección de tasas
const TasasExplicacionSection = ({ analysis }: { analysis: AnalysisResult }) => {
  if (!analysis || !analysis.tasas) return null;

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10">
      <h3 className="text-xl font-semibold text-white mb-6">
        Explicación de Tasas e Intereses
      </h3>

      <div className="space-y-6">
        {/* CFT */}
        <div className="p-4 bg-white/5 rounded-lg">
          <h4 className="text-lg font-medium text-white/70 mb-2">
            CFT: {formatearTasa(analysis.tasas.cft)}
          </h4>
          <div className="text-sm text-white/70">
            <span>Es como el precio final de usar la tarjeta, incluyendo TODO:</span>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Los intereses que te cobran</li>
              <li>El seguro de vida</li>
              <li>Gastos administrativos</li>
              <li>Cualquier otro cargo extra</li>
            </ul>
            {analysis.tasas.cft === 0 ? (
              <div className="mt-4 p-3 bg-yellow-500/10 rounded border border-yellow-500/20">
                ⚠️ Atención: La tasa aparece en 0%. Normalmente está entre 90% y 150% anual.
              </div>
            ) : (
              <div className="mt-4 p-3 bg-blue-500/10 rounded border border-blue-500/20">
                💡 Ejemplo simple: Si comprás algo de $10.000, en un año terminarías pagando ${formatearNumero(10000 + (10000 * analysis.tasas.cft))} si solo pagás el mínimo.
              </div>
            )}
          </div>
        </div>

        {/* TNA */}
        <div className="p-4 bg-white/5 rounded-lg">
          <h4 className="text-lg font-medium text-white/70 mb-2">
            TNA: {formatearTasa(analysis.tasas.tna)}
          </h4>
          <div className="text-sm text-white/70">
            <span>Es el interés básico que te cobran por año. ¡Pero ojo! No incluye el efecto "bola de nieve" de los intereses sobre intereses.</span>
            <div className="mt-4 p-3 bg-blue-500/10 rounded border border-blue-500/20">
              💡 Ejemplo: Si la TNA es 70%, cada $1.000 que no pagues, te genera $700 de interés en un año.
            </div>
          </div>
        </div>

        {/* TEA */}
        <div className="p-4 bg-white/5 rounded-lg">
          <h4 className="text-lg font-medium text-white/70 mb-2">
            TEA: {formatearTasa(analysis.tasas.tea)}
          </h4>
          <div className="text-sm text-white/70">
            <span>Esta es la tasa REAL que pagás, incluyendo el efecto "bola de nieve" porque:</span>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Los intereses generan nuevos intereses</li>
              <li>Siempre es más alta que la TNA</li>
              <li>Es la que realmente afecta tu bolsillo</li>
            </ul>
            <div className="mt-4 p-3 bg-blue-500/10 rounded border border-blue-500/20">
              💡 Ejemplo: Con una TEA del 95%, una deuda de $10.000 se convierte en ${formatearNumero(10000 * (1 + analysis.tasas.tea))} en un año si no pagás nada.
            </div>
          </div>
        </div>

        {/* Tasa Punitoria - Nueva sección */}
        {analysis.informacionLegal?.tasasVigentes?.punitorios && (
          <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <h4 className="text-lg font-medium text-red-400 mb-2">
              Tasa Punitoria: {formatearTasa(analysis.informacionLegal.tasasVigentes.punitorios)}
            </h4>
            <div className="text-sm text-white/70">
              <p className="mb-2">La tasa punitoria es un cargo extra que se aplica cuando:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>No pagás el mínimo antes del vencimiento</li>
                <li>Te atrasás con el pago de tu resumen</li>
                <li>Entrás en mora</li>
              </ul>
              <div className="mt-4 p-3 bg-red-500/10 rounded">
                ⚠️ <strong>Importante:</strong> Esta tasa se suma a la tasa normal, lo que significa que:
                <ul className="list-disc list-inside mt-2">
                  <li>Si tu deuda es ${formatearNumero(analysis.deudaActual)}</li>
                  <li>Y no pagás el mínimo</li>
                  <li>Se te cobrará un {formatearTasa(analysis.tasas.tna)} de interés normal</li>
                  <li>MÁS un {formatearTasa(analysis.informacionLegal.tasasVigentes.punitorios)} adicional de interés punitorio</li>
                  <li>Haciendo que tu deuda crezca mucho más rápido</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Consejo General */}
        <div className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
          <h4 className="text-lg font-medium text-green-400 mb-2">
            💡 Consejo Importante
          </h4>
          <div className="text-sm text-white/70">
            <ul className="list-disc list-inside space-y-2">
              <li>Siempre intentá pagar el total para no pagar intereses</li>
              <li>Si pagás solo el mínimo, tu deuda puede duplicarse en un año</li>
              <li>Usá la tarjeta solo para gastos que podés pagar</li>
              <li>Si tenés problemas para pagar, consultá planes de refinanciación</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Agregar nueva sección para el análisis histórico
const AnalisisHistoricoSection = ({ analysis }: { analysis: AnalysisResult }) => {
  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10">
      <h3 className="text-xl font-semibold text-white mb-6">Análisis Histórico</h3>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Tendencias de Gasto */}
        <div>
          <h4 className="text-lg font-medium text-white/70 mb-4">Tendencias de Gasto</h4>
          <div className="space-y-4">
            {analysis.tendenciasGasto?.map((tendencia, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-lg">
                <h5 className="font-medium text-white">{tendencia.categoria}</h5>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#FF00FF] to-[#7C4DFF]" 
                      style={{ width: `${tendencia.variacion}%` }}
                    />
                  </div>
                  <span className={`text-sm ${
                    tendencia.variacion > 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {tendencia.variacion > 0 ? '+' : ''}{tendencia.variacion}%
                  </span>
                </div>
                <p className="text-sm text-white/70 mt-2">{tendencia.observacion}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comparativa con Períodos Anteriores */}
        <div>
          <h4 className="text-lg font-medium text-white/70 mb-4">Comparativa Mensual</h4>
          <div className="space-y-4">
            {analysis.comparativaMensual && (
              <>
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/70">Gasto Total</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white">${formatearNumero(analysis.comparativaMensual.gastoActual)}</span>
                      <span className={`text-sm ${
                        analysis.comparativaMensual.variacionGasto > 0 
                          ? 'text-red-400' 
                          : 'text-green-400'
                      }`}>
                        {analysis.comparativaMensual.variacionGasto > 0 ? '+' : ''}
                        {analysis.comparativaMensual.variacionGasto}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/70">Intereses Pagados</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white">${formatearNumero(analysis.comparativaMensual.interesesActual)}</span>
                      <span className={`text-sm ${
                        analysis.comparativaMensual.variacionIntereses > 0 
                          ? 'text-red-400' 
                          : 'text-green-400'
                      }`}>
                        {analysis.comparativaMensual.variacionIntereses > 0 ? '+' : ''}
                        {analysis.comparativaMensual.variacionIntereses}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Análisis de Tendencias */}
                <div className="p-4 bg-white/5 rounded-lg">
                  <h5 className="font-medium text-white mb-2">Análisis de Tendencias</h5>
                  <p className="text-sm text-white/70">
                    {analysis.comparativaMensual.analisisTendencia}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Agregar nueva sección para educación financiera
const EducacionFinancieraSection = ({ analysis }: { analysis: AnalysisResult }) => {
  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10">
      <h3 className="text-xl font-semibold text-white mb-6">Tips Financieros</h3>
      
      <div className="space-y-6">
        {/* Tips Generales */}
        <div className="p-4 bg-white/5 rounded-lg">
          <h4 className="text-lg font-medium text-white/70 mb-4">
            🎯 Consejos para usar mejor tu tarjeta
          </h4>
          <div className="space-y-4">
            <div className="p-3 bg-blue-500/10 rounded border border-blue-500/20">
              <h5 className="font-medium text-blue-400">La regla del 30%</h5>
              <p className="text-sm text-white/70 mt-1">
                No uses más del 30% de tu límite de tarjeta. Por ejemplo, si tu límite es $100.000, 
                intenta no deber más de $30.000.
              </p>
            </div>
            
            <div className="p-3 bg-green-500/10 rounded border border-green-500/20">
              <h5 className="font-medium text-green-400">Pago total vs. mínimo</h5>
              <p className="text-sm text-white/70 mt-1">
                Siempre intenta pagar el total. Si debés $50.000 y solo pagás el mínimo (ponele $10.000), 
                los $40.000 restantes generarán intereses que pueden duplicar tu deuda en un año.
              </p>
            </div>

            {analysis.fechas && (
              <div className="p-3 bg-purple-500/10 rounded border border-purple-500/20">
                <h5 className="font-medium text-purple-400">Fechas importantes</h5>
                <p className="text-sm text-white/70 mt-1">
                  {analysis.fechas.cierre && `• Fecha de cierre: ${formatearFecha(analysis.fechas.cierre)}`}<br />
                  {analysis.fechas.vencimiento && `• Fecha de vencimiento: ${formatearFecha(analysis.fechas.vencimiento)}`}<br />
                  Pagá antes del vencimiento para evitar intereses punitorios.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Alertas Específicas */}
        <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
          <h4 className="text-lg font-medium text-red-400 mb-4">
            ⚠️ Señales de alerta
          </h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>• Usar más del 80% del límite de la tarjeta</li>
            <li>• Pagar solo el mínimo por más de 3 meses seguidos</li>
            <li>• Usar la tarjeta para gastos diarios como comida</li>
            <li>• Sacar adelantos de efectivo frecuentemente</li>
          </ul>
        </div>

        {/* Recomendaciones Personalizadas */}
        <div className="p-4 bg-white/5 rounded-lg">
          <h4 className="text-lg font-medium text-white/70 mb-4">
            💡 Tips para tu situación actual
          </h4>
          <div className="space-y-3">
            {analysis.tasas.cft === 0 ? (
              <p className="text-sm text-white/70">
                • Consultá con tu banco las tasas actuales ya que aparecen en cero<br />
                • Pedí un detalle de los cargos y comisiones vigentes<br />
                • Revisá si hay algún beneficio o promoción disponible
              </p>
            ) : (
              <p className="text-sm text-white/70">
                • Con las tasas actuales, cada $1.000 de deuda genera ${formatearNumero(analysis.tasas.tem * 1000)} de interés por mes<br />
                • Priorizá pagar las deudas con mayor tasa de interés<br />
                • Evaluá unificar deudas si tenés varias tarjetas
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Nuevo componente para mostrar el análisis comparativo
const AnalisisComparativoSection = ({ 
  analysis, 
  previousAnalysis 
}: { 
  analysis: AnalysisResult;
  previousAnalysis: AnalysisResult | null;
}) => {
  if (!analysis?.analisisComparativo || !analysis) return null;

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10">
      <h3 className="text-xl font-semibold text-white mb-6">
        Análisis Comparativo
      </h3>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Diferencias Encontradas */}
        <div>
          <h4 className="text-lg font-medium text-white/70 mb-4">
            Cambios Importantes
          </h4>
          <div className="space-y-4">
            {analysis.analisisComparativo.diferenciasEncontradas.map((diff, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg ${
                  diff.impacto === 'POSITIVO' 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : diff.impacto === 'NEGATIVO'
                    ? 'bg-red-500/10 border-red-500/20'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <h5 className="font-medium text-white">{diff.campo}</h5>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-white/70">
                    {diff.valorAnterior} → {diff.valorActual}
                  </span>
                  <span className={`text-sm ${
                    diff.impacto === 'POSITIVO' 
                      ? 'text-green-400' 
                      : diff.impacto === 'NEGATIVO'
                      ? 'text-red-400'
                      : 'text-white/70'
                  }`}>
                    {diff.variacionPorcentual > 0 ? '+' : ''}
                    {diff.variacionPorcentual}%
                  </span>
                </div>
                <p className="text-sm text-white/70 mt-2">
                  {diff.observacion}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tendencias y Recomendaciones */}
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-medium text-white/70 mb-4">
              Tendencias
            </h4>
            <div className="space-y-4">
              {Object.entries(analysis.analisisComparativo.tendencias).map(([key, value]) => (
                <div key={key} className="p-4 bg-white/5 rounded-lg">
                  <h5 className="font-medium text-white capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h5>
                  <p className="text-sm text-white/70 mt-2">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-white/70 mb-4">
              Recomendaciones
            </h4>
            <div className="space-y-2">
              {analysis.analisisComparativo.recomendaciones.map((rec, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-white/70">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add this component before the export default PdfUploader
const RecomendacionesSection = ({ analysis }: { analysis: AnalysisResult }) => {
  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10">
      <h3 className="text-xl font-semibold text-white mb-6">
        Recomendaciones
      </h3>
      
      <div className="grid md:grid-cols-2 gap-8">
        {analysis.recomendaciones?.urgentes && (
          <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <h4 className="text-lg font-medium text-red-400 mb-2">Urgente</h4>
            <ul className="space-y-2">
              {analysis.recomendaciones.urgentes.map((rec, index) => (
                <li key={index} className="text-sm text-white/70">• {rec}</li>
              ))}
            </ul>
          </div>
        )}
        
        {analysis.recomendaciones?.generales && (
          <div className="p-4 bg-white/5 rounded-lg">
            <h4 className="text-lg font-medium text-white/70 mb-2">Recomendaciones Generales</h4>
            <ul className="space-y-2">
              {analysis.recomendaciones.generales.map((rec, index) => (
                <li key={index} className="text-sm text-white/70">• {rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const PlanVSection = ({ analysis }: { analysis: AnalysisResult }) => {
  // Mejorar la detección del Plan V
  const hasPlanV = analysis.planesEspeciales?.nombre?.toLowerCase().includes('plan v') ||
                   analysis.informacionLegal?.notasImportantes?.some(nota => 
                     nota.toLowerCase().includes('plan v'));

  if (!hasPlanV) return null;

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10">
      <h3 className="text-xl font-semibold text-white mb-6">
        Plan V - Información
      </h3>
      
      <div className="space-y-6">
        <div className="p-4 bg-white/5 rounded-lg">
          <h4 className="text-lg font-medium text-white/70 mb-4">
            ¿Qué es el Plan V?
          </h4>
          <div className="text-sm text-white/70">
            <p className="mb-2">El Plan V es un préstamo pre-aprobado que te ofrece el banco Visa para:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Convertir el saldo de tu tarjeta en cuotas fijas</li>
              <li>Obtener una tasa preferencial más baja que la de la tarjeta</li>
              <li>Tener un plan de pagos organizado con cuotas predecibles</li>
              <li>Consolidar tu deuda en un solo préstamo</li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <h4 className="text-lg font-medium text-blue-400 mb-4">
            Importante
          </h4>
          <div className="text-sm text-white/70">
            <p>Para conocer las condiciones específicas del Plan V para tu caso:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Comunicate con el banco</li>
              <li>Consultá las tasas preferenciales disponibles</li>
              <li>Preguntá por los plazos y cuotas</li>
              <li>Evaluá si te conviene según tu situación</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalisisPagoMinimo = ({ analysis }: { analysis: AnalysisResult }) => {
  // Calcular el interés que se generará si solo paga el mínimo
  const deudaRestante = analysis.deudaActual - analysis.pagoMinimo;
  // Usar TNA para calcular el interés mensual (TNA/12)
  const tasaMensual = analysis.tasas.tna / 12;
  const interesGenerado = deudaRestante * tasaMensual;
  const deudaProximoMes = deudaRestante + interesGenerado;
  const pagoMinimoEstimado = deudaProximoMes * 0.1; // Asumiendo pago mínimo del 10%

  return (
    <div className="p-6 bg-red-500/10 rounded-lg border border-red-500/20 mt-4">
      <h4 className="text-lg font-medium text-red-400 mb-4">
        ¿Qué pasa si solo pago el mínimo?
      </h4>
      <div className="space-y-3 text-sm text-white/70">
        <p>• Tu deuda actual es de ${formatearNumero(analysis.deudaActual)}</p>
        <p>• Si pagas solo el mínimo (${formatearNumero(analysis.pagoMinimo)})</p>
        <p>• Te quedará una deuda de ${formatearNumero(deudaRestante)}</p>
        <p>• Esta deuda generará ${formatearNumero(interesGenerado)} de interés mensual</p>
        <div className="mt-4 p-4 bg-red-950/20 rounded-lg">
          <p className="font-medium text-red-400">El mes que viene:</p>
          <p className="mt-2">• Tu deuda será de ${formatearNumero(deudaProximoMes)}</p>
          <p>• Tu pago mínimo estimado será de ${formatearNumero(pagoMinimoEstimado)}</p>
        </div>
        <div className="mt-4 p-3 bg-yellow-500/10 rounded border border-yellow-500/20">
          ⚠️ <strong>Importante:</strong> Pagar solo el mínimo hace que tu deuda crezca mes a mes por los intereses.
          Te recomendamos pagar más que el mínimo siempre que puedas.
        </div>
      </div>
    </div>
  );
};

export default PdfUploader; 