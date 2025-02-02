import { NextResponse } from 'next/server';
import PDFParser from 'pdf-parse';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Agregar en .env.local
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get('pdf') as File;
    
    // Extraer texto del PDF
    const buffer = Buffer.from(await pdfFile.arrayBuffer());
    const pdfData = await PDFParser(buffer);
    const pdfText = pdfData.text;

    // Analizar con Claude
    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `Analiza este resumen de tarjeta de crédito y proporciona un resumen detallado de los gastos, categorías y recomendaciones:
        
        ${pdfText}`
      }]
    });

    return NextResponse.json({
      analysis: message.content
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Error al procesar el PDF' },
      { status: 500 }
    );
  }
} 