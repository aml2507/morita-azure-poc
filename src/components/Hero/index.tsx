"use client";

import Link from "next/link";
import { AnimatedPig } from "../AnimatedPig";

const Hero = () => {
  return (
    <main className="relative pt-20 pb-16">
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-8xl md:text-9xl font-bold mb-40">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF00FF] to-[#7C4DFF] [text-shadow:0_0_30px_rgba(255,0,255,0.3)]">
              Morita
            </span>
          </h1>

          <div className="mb-35">
            <AnimatedPig />
          </div>

          <div>
            <h2 className="text-5xl md:text-6xl font-bold text-white">
              Entiende tus resúmenes de
              <br />
              tarjeta
            </h2>
          </div>

          <div className="mt-8">
            <p className="text-xl text-white/70 max-w-2xl mx-auto text-center mb-8">
              Optimiza tus finanzas con nuestro analizador inteligente.
            </p>
            <Link
              href="/resumen"
              className="bg-[#FF00FF] hover:bg-[#7C4DFF] hover:scale-105 transition-all duration-300 text-lg px-8 py-4 rounded-full shadow-[0_0_30px_rgba(255,0,255,0.3)] text-white font-medium"
            >
              Analizar mi resumen
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Hero;
