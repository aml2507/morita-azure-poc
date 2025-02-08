import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre Morita | Tu Asistente de Finanzas Personales",
  description: "Conoce más sobre Morita, tu compañero en el camino hacia la libertad financiera. Descubre nuestra misión de hacer la educación financiera accesible para todos.",
  keywords: "educación financiera, finanzas personales, misión, valores, equipo Morita",
};

const AboutPage = () => {
  return (
    <>
      <AboutSectionOne />
      <AboutSectionTwo />
    </>
  );
};

export default AboutPage;
