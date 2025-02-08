"use client";

import Header from "@/components/Header";
import { Inter } from "next/font/google";
import "../styles/index.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.js. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />

      <body className={`${inter.className} bg-[#0A0118]`}>
        {/* Efectos de fondo */}
        <div className="fixed inset-0 z-0">
          {/* Grid futurista */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(124,77,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(124,77,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [transform-origin:0_0] [transform:perspective(500px)_rotateX(60deg)]" />

          {/* Gradientes de fondo */}
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-r from-[#FF00FF]/20 via-transparent to-[#7C4DFF]/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 right-0 h-[500px] bg-gradient-to-r from-[#7C4DFF]/20 via-transparent to-[#FF00FF]/20 blur-3xl" />
        </div>

        {/* Navigation */}
        <Header />

        {/* Contenido */}
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
