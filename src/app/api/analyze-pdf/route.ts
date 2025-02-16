import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { anthropic } from '@/lib/anthropic';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { StatementCache } from '@/lib/cache/statementCache';
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
      userId = decodedToken.uid;
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
      return NextResponse.json(
        { error: 'No se encontró el archivo', success: false },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const pdfData = await pdfParse(buffer);
    
    // Generar hash del contenido del PDF
    const pdfHash = generateStatementHash(pdfData.text);
    
    console.log('Verificando caché para hash:', pdfHash); // Log para debug
    
    // Intentar obtener del caché
    const cachedAnalysis = await StatementCache.get(pdfData.text, userId);
    if (cachedAnalysis) {
      console.log('✅ Análisis recuperado del caché');
      return NextResponse.json({
        success: true,
        analysisId: pdfHash,
        analysis: cachedAnalysis
      });
    }

    console.log('❌ No se encontró en caché, analizando con Claude...');
    
    // Si no está en caché, analizar con Claude
    const analysis = await analyzeWithClaude(pdfData.text);
    
    // Guardar en caché
    await StatementCache.set({
      text: pdfData.text,
      analysis,
      timestamp: Date.now()
    }, userId);

    return NextResponse.json({
      success: true,
      analysisId: pdfHash,
      analysis
    });

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