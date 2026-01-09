import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-admin';
import { anthropic } from '@/lib/anthropic';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { AnalysisResult } from '@/types/analysis';
import { generateStatementHash } from '@/lib/cache/hashGenerator';

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
    // Verificar que Firebase Admin esté inicializado
    if (!db || !auth) {
      console.error('Firebase Admin no está inicializado');
      return NextResponse.json(
        { error: 'Error de configuración del servidor', success: false },
        { status: 500 }
      );
    }

    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado', success: false },
        { status: 401 }
      );
    }

    let userId;
    try {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await auth.verifyIdToken(token);
      userId = decodedToken.uid;
    } catch (error) {
      console.error('Error al verificar token:', error);
      return NextResponse.json(
        { error: 'Token inválido', success: false },
        { status: 401 }
      );
    }

    // Verificar límite mensual
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const analysisSnapshot = await db
        .collection('analyses')
        .where('userId', '==', userId)
        .where('createdAt', '>=', startOfMonth)
        .get();

      if (analysisSnapshot.size >= 2) {
        return NextResponse.json(
          { 
            error: '⚠️ Has alcanzado el límite de 2 análisis este mes. Podrás analizar más resúmenes el próximo mes.',
            success: false 
          },
          { status: 429 }
        );
      }
    } catch (error) {
      console.error('Error al verificar límite:', error);
      return NextResponse.json(
        { error: 'Error al verificar límite de análisis', success: false },
        { status: 500 }
      );
    }

    // Procesar el archivo
    const formData = await request.formData();
    const pdfFile = formData.get('pdf');
    
    if (!pdfFile || !(pdfFile instanceof Blob)) {
      return NextResponse.json(
        { error: 'Archivo PDF requerido', success: false },
        { status: 400 }
      );
    }

    // Convertir el archivo a buffer
    let pdfBuffer;
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      return NextResponse.json(
        { error: 'Error al procesar el archivo PDF', success: false },
        { status: 400 }
      );
    }

    // Extraer texto del PDF
    let pdfText;
    try {
      const pdfData = await pdfParse(pdfBuffer);
      pdfText = pdfData.text;
    } catch (error) {
      console.error('Error al extraer texto del PDF:', error);
      return NextResponse.json(
        { error: 'Error al leer el contenido del PDF', success: false },
        { status: 400 }
      );
    }

    // Generar hash
    const hash = generateStatementHash(pdfText);

    // Verificar caché
    try {
      const cacheSnapshot = await db
        .collection('cache')
        .where('hash', '==', hash)
        .limit(1)
        .get();

      if (!cacheSnapshot.empty) {
        const cachedData = cacheSnapshot.docs[0].data();
        return NextResponse.json({
          success: true,
          fromCache: true,
          analysis: cachedData.analysis,
          analysisId: hash
        });
      }
    } catch (error) {
      console.error('Error al verificar caché:', error);
      // Continuar con el análisis aunque falle la verificación de caché
    }

    // Analizar con Claude
    let analysis;
    try {
      analysis = await analyzeWithClaude(pdfText);
    } catch (error) {
      console.error('Error en análisis con Claude:', error);
      return NextResponse.json(
        { error: 'Error al analizar el documento', success: false },
        { status: 500 }
      );
    }

    // Guardar resultados
    try {
      // Guardar en caché
      await db.collection('cache').add({
        hash,
        analysis,
        userId,
        createdAt: new Date()
      });

      // Registrar análisis
      await db.collection('analyses').add({
        userId,
        hash,
        createdAt: new Date()
      });

      return NextResponse.json({
        success: true,
        fromCache: false,
        analysis,
        analysisId: hash
      });
    } catch (error) {
      console.error('Error al guardar resultados:', error);
      return NextResponse.json(
        { error: 'Error al guardar resultados', success: false },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error general:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', success: false },
      { status: 500 }
    );
  }
}

async function analyzeWithClaude(text: string): Promise<AnalysisResult> {
  const prompt = `Analiza este resumen de tarjeta de crédito y extrae los siguientes datos específicos.
  IMPORTANTE: Responde SOLO con un objeto JSON válido, sin formato markdown ni backticks:

  {
    "deudaActual": number,        // El monto total de la deuda actual
    "pagoMinimo": number,         // El monto del pago mínimo requerido
    "fechaVencimiento": string,   // La fecha de vencimiento en formato YYYY-MM-DD
    "tasas": {
      "tem": number,              // Tasa efectiva mensual (como decimal, ej: 0.15 para 15%)
      "tea": number,              // Tasa efectiva anual
      "cft": number,              // Costo financiero total
      "tna": number               // Tasa nominal anual
    },
    "recomendaciones": {
      "urgentes": string[],       // Lista de recomendaciones urgentes
      "generales": string[]       // Lista de recomendaciones generales
    },
    "planesEspeciales": {
      "nombre": string,              // Nombre del plan (ej: "Plan V")
      "tasaPreferencial": number,    // Tasa del plan como decimal
      "plazosDisponibles": number[], // Array de plazos disponibles en meses
      "cuotaEstimada": number,       // Estimación de cuota mensual
      "beneficios": string[],        // Lista de beneficios del plan
      "requisitos": string[]         // Requisitos para acceder al plan
    }
  }

  REGLAS:
  - No incluyas backticks (\`\`\`) ni la palabra "json" en tu respuesta
  - Responde solo con el objeto JSON
  - Si no encuentras algún valor numérico específico, usa 0
  - Si no encuentras la fecha, usa la fecha actual
  - Incluye al menos 3 recomendaciones generales
  - Presta especial atención a menciones del "Plan V" o planes especiales
  
  Resumen a analizar:
  ${text}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 4096,
      temperature: 0,
      system: "Eres un experto analista financiero. Extrae solo los datos numéricos solicitados del resumen y responde únicamente con JSON válido.",
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    // Limpiar la respuesta de posibles backticks o formato markdown
    const cleanResponse = response.content[0].text
      .trim()
      .replace(/```json\s*|\s*```/g, '')
      .trim();

    try {
      const analysis = JSON.parse(cleanResponse);
      return analysis;
    } catch (parseError) {
      console.error('Error parsing Claude response:', cleanResponse);
      throw new Error('Error al procesar la respuesta del análisis');
    }
  } catch (error) {
    console.error('Error calling Claude:', error);
    throw error;
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

// Función auxiliar para validar fechas
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
} 