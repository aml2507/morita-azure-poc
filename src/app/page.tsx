import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import Blog from "@/components/Blog";
import Brands from "@/components/Brands";
import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import Video from "@/components/Video";
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
      <Video />
      <Brands />
      <AboutSectionOne />
      <AboutSectionTwo />
      <Testimonials />
      <Pricing />
      <Blog />
      <Contact />
    </>
  );
}
