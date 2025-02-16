import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analizador de Resúmenes | Morita",
  description: "Sube tu resumen de tarjeta de crédito y obtén un análisis detallado de tus gastos, patrones de consumo y recomendaciones personalizadas.",
};

export default function ResumenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 