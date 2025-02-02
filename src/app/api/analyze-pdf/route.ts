import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Por ahora ignoramos el PDF y solo devolvemos datos de prueba
    return NextResponse.json({
      analysis: {
        deudaActual: "132862.05",
        pagoMinimo: "101110.00",
        fechaVencimiento: "3 de Febrero 2025",
        distribucionGastos: [
          { categoria: "Supermercados", monto: "45000.00" },
          { categoria: "Restaurantes", monto: "28000.00" },
          { categoria: "Servicios", monto: "35000.00" },
          { categoria: "Otros", monto: "24862.05" }
        ],
        simulacionPagoMinimo: {
          totalPagar: "257.51",
          tiempoEstimado: "36 meses",
          interesesTotales: "111.00",
        },
        recomendaciones: [
          "Intenta pagar más que el mínimo para reducir intereses futuros",
          "La tarjeta tiene un límite de compra de $640,000.00. Úsalo con precaución.",
          "Los adelantos en efectivo tienen cargos adicionales y tasas más altas"
        ]
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 