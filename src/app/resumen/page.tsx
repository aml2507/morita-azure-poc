import { Metadata } from "next";
import Breadcrumb from "@/components/Common/Breadcrumb";
import PdfUploader from "@/components/Resumen/PdfUploader";

export const metadata: Metadata = {
  title: "Analizador de Resúmenes | Morita",
  description: "Sube tu resumen de tarjeta de crédito y obtén un análisis detallado de tus gastos, patrones de consumo y recomendaciones personalizadas.",
  keywords: "análisis de gastos, resumen de tarjeta, categorización de gastos, patrones de consumo",
}; 

const ResumenPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Analizador de Resúmenes"
        description="Sube tu resumen de tarjeta de crédito y obtén un análisis detallado instantáneo"
      />
      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <PdfUploader />
        </div>
      </section>
    </>
  );
};

export default ResumenPage; 