'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import PdfUploader from "@/components/Resumen/PdfUploader";

export default function ResumenPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const handleReset = () => {
    // Limpiar localStorage y redirigir
    localStorage.removeItem('savedAnalyses');
    window.location.href = '/resumen';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto pt-24">
        {/* Sección de encabezado */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#FF00FF] to-[#7C4DFF] [text-shadow:0_0_30px_rgba(255,0,255,0.3)]">
            Analiza tu Resumen de Tarjeta
          </h1>
          <p className="text-xl text-white/70">
            Obtén resultados valiosos sobre tus gastos y recibe recomendaciones personalizadas para mejorar tu salud financiera.
          </p>
        </div>

        {/* Características principales */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-[#FF00FF]/20 rounded-xl flex items-center justify-center mb-4">
              <div className="text-[#FF00FF] font-bold text-xl">1</div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Sube tu PDF</h3>
            <p className="text-white/70">
              Selecciona o arrastra el resumen de tu tarjeta de crédito en formato PDF.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-[#FF00FF]/20 rounded-xl flex items-center justify-center mb-4">
              <div className="text-[#FF00FF] font-bold text-xl">2</div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Espera el análisis</h3>
            <p className="text-white/70">
              Nuestro sistema procesará tu resumen y extraerá toda la información relevante.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-[#FF00FF]/20 rounded-xl flex items-center justify-center mb-4">
              <div className="text-[#FF00FF] font-bold text-xl">3</div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Recibe resultados</h3>
            <p className="text-white/70">
              Obtén un análisis detallado de tus gastos y recomendaciones personalizadas.
            </p>
          </div>
        </div>

        {/* Sección de carga de PDF */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <PdfUploader initialAnalysisId={id} onReset={handleReset} />
        </div>
      </div>
    </div>
  );
} 