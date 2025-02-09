import { Metadata } from "next";
import PdfUploader from "@/components/Resumen/PdfUploader";

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

        <div className="max-w-2xl mx-auto">
          <PdfUploader />
        </div>
      </div>
    </div>
  );
};

export default ResumenPage; 