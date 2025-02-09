import ScrollUp from "@/components/Common/ScrollUp";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ContactForm from "@/components/Contact/ContactForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Morita | Educación Financiera Simplificada",
  description: "Analiza tus resúmenes de tarjeta de crédito de forma inteligente y mejora tu salud financiera con Morita. Aprende a gestionar tus finanzas de manera simple y efectiva.",
  keywords: "educación financiera, análisis de tarjeta de crédito, finanzas personales, gestión de gastos, resumen de cuenta",
  openGraph: {
    title: "Morita | Educación Financiera Simplificada",
    description: "Analiza tus resúmenes de tarjeta de crédito de forma inteligente",
    images: ["/images/og-image.jpg"],
  }
};

export default function Home() {
  return (
    <>
      <ScrollUp />
      <Hero />
      <Features />
      <ContactForm />
    </>
  );
}
