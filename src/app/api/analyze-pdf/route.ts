import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { anthropic } from '@/lib/anthropic';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { StatementCache } from '@/lib/cache/statementCache';

// Asegurarse de que la ruta sea dinámica
export const dynamic = 'force-dynamic';

// Aumentar el límite de tiempo para archivos grandes
export const maxDuration = 300;

// Configurar el tamaño máximo del cuerpo de la solicitud
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Agregar manejador OPTIONS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Verificar el token de autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado', success: false },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    let userId;
    try {
      const decodedToken = await auth.verifyIdToken(token);
      userId = decodedToken.uid; // Obtener el ID del usuario del token
    } catch (error) {
      console.error('Error verificando token:', error);
      return NextResponse.json(
        { error: 'Token inválido', success: false },
        { status: 401 }
      );
    }

    // Procesar el archivo
    const formData = await request.formData();
    const file = formData.get('pdf');

    if (!file || !(file instanceof File)) {
      console.error('No se encontró el archivo en formData:', 
        Array.from(formData.entries()).map(([key, value]) => ({
          key,
          type: typeof value,
          isFile: value instanceof File
        }))
      );
      return NextResponse.json(
        { error: 'No se encontró el archivo', success: false },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const pdfData = await pdfParse(buffer);
    
    // Extraer datos relevantes para el hash
    const statementData = extractStatementData(pdfData.text);
    
    // Verificar caché (usar userId en lugar de auth.uid)
    const cachedAnalysis = await StatementCache.get(statementData, userId);
    if (cachedAnalysis) {
      console.log('Cache hit! Returning cached analysis');
      return new Response(JSON.stringify({ 
        analysis: cachedAnalysis, 
        fromCache: true,
        success: true 
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Si no hay caché, realizar el análisis
    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 4096,
      messages: [{
        role: "user",
        content: `Analiza este resumen de tarjeta de crédito y extrae SOLO la siguiente información en formato JSON, sin incluir ningún texto adicional o markdown:
          {
            "deudaActual": number,
            "pagoMinimo": number,
            "fechaVencimiento": string,
            "distribucionGastos": [
              {
                "categoria": string,
                "monto": number
              }
            ],
            "simulacionPagoMinimo": {
              "totalPagar": number,
              "tiempoEstimado": string,
              "interesesTotales": number
            },
            "recomendaciones": string[]
          }

          Si no puedes encontrar algún valor, usa null.
          Resumen:
          ${pdfData.text}
        `
      }]
    });

    const analysis = JSON.parse(message.content[0].text.trim());
    
    // Guardar en caché (usar userId en lugar de auth.uid)
    await StatementCache.set(statementData, analysis, userId);

    return new Response(
      JSON.stringify({ analysis, success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error en el endpoint:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        success: false 
      },
      { status: 500 }
    );
  }
}

function extractStatementData(pdfText: string) {
  // Extraer datos relevantes del texto del PDF
  return {
    transactions: [], // Aquí deberías implementar la extracción de transacciones
    totalAmount: 0,   // Extraer monto total
    statementDate: new Date().toISOString().split('T')[0] // Fecha del resumen
  };
} 