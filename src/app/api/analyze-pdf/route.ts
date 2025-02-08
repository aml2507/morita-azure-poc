import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { anthropic } from '@/lib/anthropic';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

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
    try {
      await auth.verifyIdToken(token);
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

    try {
      console.log('Backend: Procesando archivo PDF');
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const options = {
        max: 0,
        version: 'default'
      };

      console.log('Backend: Iniciando extracción de texto');
      const pdfData = await pdfParse(buffer, options);
      const pdfText = pdfData.text;
      console.log('Backend: Texto extraído, longitud:', pdfText.length);

      console.log('Backend: Enviando texto a Claude');
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
            ${pdfText}
          `
        }]
      });

      console.log('Backend: Respuesta recibida de Claude');
      let analysis;
      try {
        const responseText = message.content[0].text.trim();
        console.log('Backend: Texto de respuesta:', responseText);
        analysis = JSON.parse(responseText);
        console.log('Backend: Análisis parseado correctamente');
      } catch (parseError) {
        console.error('Backend: Error al parsear respuesta de Claude:', parseError);
        throw new Error('Error al procesar la respuesta del análisis');
      }

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
      console.error('Error procesando PDF:', error);
      return new Response(
        JSON.stringify({ 
          error: error instanceof Error ? error.message : 'Error al procesar el PDF',
          success: false 
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
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