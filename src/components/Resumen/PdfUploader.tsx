/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect } from 'react';
import { formatearNumero } from '@/utils/numberFormat';
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAnalysisLimit } from "./AnalysisLimit";

const PdfUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { hasReachedLimit } = useAnalysisLimit();

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

  // Debug render
  console.log('Renderizando PdfUploader:', {
    tieneArchivo: !!file,
    estadoLoading: loading,
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

  const handleUpload = async (file: File) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setError("Debes iniciar sesión para continuar");
        router.push("/signin");
        return;
      }

      if (hasReachedLimit) {
        setError("Has alcanzado el límite de análisis gratuitos");
        return;
      }

      setLoading(true);
      setError("");

      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append('pdf', file);

      console.log('Enviando archivo:', {
        nombre: file.name,
        tamaño: file.size,
        tipo: file.type
      });

      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const responseText = await response.text();
      console.log('Respuesta completa:', responseText);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${responseText}`);
      }

      const data = JSON.parse(responseText);
      console.log('Respuesta parseada:', data);

      if (!data.success) {
        throw new Error(data.error || 'Error al analizar el PDF');
      }

      try {
        const docRef = await addDoc(collection(db, "analyses"), {
          userId: user.uid,
          timestamp: serverTimestamp(),
          analysis: data.analysis,
          createdAt: new Date().toISOString()
        });
        console.log("Análisis guardado con ID:", docRef.id);
      } catch (firestoreError: any) {
        console.error("Error al guardar en Firestore:", {
          code: firestoreError.code,
          message: firestoreError.message,
          details: firestoreError
        });
        setError("Error al guardar el análisis: " + firestoreError.message);
      }

      setAnalysis(data.analysis);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
    } finally {
      setLoading(false);
    }
  };

  // Agregar un efecto para monitorear los cambios de estado
  useEffect(() => {
    console.log('Estado actual:', { loading, analysis, error });
  }, [loading, analysis, error]);

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
              <h4 className="text-lg font-medium text-white/70 mb-2">CFT - El Verdadero Costo</h4>
              <p className="text-sm text-white/70">
                Imagina que le pides $100 prestados a un amigo. Con el CFT, no solo le devolverás
                los $100, sino ${formatearNumero(Number(150))} en total por todos los costos.
                En tu caso, por cada $100 de deuda, terminarás pagando ${formatearNumero(Number(analysis.simulacionPagoMinimo?.totalPagar || 150))} al año.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-white/70 mb-2">TNA - El Interés Básico</h4>
              <p className="text-sm text-white/70">
                Es como cuando ahorras plata en una alcancía, pero al revés. 
                En vez de ganar interés, pagas un {analysis.simulacionPagoMinimo?.interesesTotales || "95"}% 
                al año por el dinero prestado. Por ejemplo, por tu deuda actual de ${formatearNumero(Number(analysis.deudaActual))},
                pagarías ${formatearNumero(Number(analysis.deudaActual * 0.95))} solo en intereses en un año.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-white/70 mb-2">TEA - El Interés Real</h4>
              <p className="text-sm text-white/70">
                Es como una bola de nieve que crece cada mes. Los intereses se suman a tu deuda y luego
                te cobran intereses sobre esos intereses. Por eso, aunque la TNA sea {analysis.simulacionPagoMinimo?.interesesTotales || "95"}%,
                terminas pagando más: un {analysis.simulacionPagoMinimo?.totalPagar || "120"}% real al año.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium text-white/70 mb-2">Tasa Punitoria - La Multa</h4>
              <p className="text-sm text-white/70">
                Es como cuando llegas tarde a una clase y te ponen falta doble. Si te atrasas en los pagos,
                además de los intereses normales, te cobran un 50% extra. Por ejemplo, si debías pagar $100 de interés,
                terminarías pagando $150 por atrasarte.
              </p>
            </div>
          </div>
        </div>

        {/* Ejemplo Práctico Mejorado con Contexto Temporal */}
        <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10">
          <h4 className="text-lg font-medium text-white/70 mb-4">
            💡 Entendiendo tu Situación Actual
          </h4>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-white/70">
            <div>
              <p className="mb-2">Si sigues pagando solo el mínimo de ${formatearNumero(Number(analysis.pagoMinimo))}:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Tu deuda actual: ${formatearNumero(Number(analysis.deudaActual))}</li>
                <li>En 12 meses habrás pagado: ${formatearNumero(Number(analysis.pagoMinimo * 12))} en total</li>
                <li>Pero tu deuda solo se reducirá a: ${formatearNumero(Number(analysis.deudaActual * 0.85))}</li>
                <li>En intereses habrás pagado: ${formatearNumero(Number(analysis.pagoMinimo * 12 * 0.85))} en un año</li>
              </ul>
            </div>
            <div>
              <p className="mb-2">Con Plan V en 18 cuotas fijas:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cuota mensual fija de ${formatearNumero(Number(analysis.deudaActual / 18))}</li>
                <li>En 18 meses tu deuda estará completamente cancelada</li>
                <li>Pagarás menos intereses en total</li>
                <li>Tendrás un plan claro de salida de la deuda</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Botón para nuevo análisis */}
      <div className="text-center">
        <button
          onClick={() => setAnalysis(null)}
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
        if (file) handleUpload(file);
      }} className="space-y-6">
        <div className="flex flex-col items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer border-white/10 hover:border-[#FF00FF]/50 transition-colors">
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
          disabled={!file || loading}
          className="w-full px-4 py-2 text-white bg-[#FF00FF] hover:bg-[#FF00FF]/80 disabled:opacity-50 rounded-lg transition-colors shadow-[0_0_20px_rgba(255,0,255,0.3)]"
        >
          {loading ? (
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