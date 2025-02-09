import { Metadata } from "next";
import PdfUploader from "@/components/Resumen/PdfUploader";
import AnalysisLimit from "@/components/Resumen/AnalysisLimit";

export const metadata: Metadata = {
  title: "Analizador de Resúmenes | Morita",
  description: "Sube tu resumen de tarjeta de crédito y obtén un análisis detallado de tus gastos, patrones de consumo y recomendaciones personalizadas.",
}; 

const ResumenPage = () => {
  return (
    <div className="h-full w-full">
      <div className="container mx-auto px-4 pb-12">
        {/* Sección de encabezado */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Analiza tu Resumen de Tarjeta
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
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
        <div className="max-w-2xl mx-auto">
          <PdfUploader />
        </div>
      </div>
    </div>
  );
};

export default ResumenPage; 