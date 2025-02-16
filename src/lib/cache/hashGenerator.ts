import { createHash } from 'crypto';

interface Transaction {
  amount: number;
  date: string;
  type: string;
}

interface StatementData {
  transactions: Transaction[];
  totalAmount: number;
  statementDate: string;
}

export function generateHash(data: StatementData): string {
  // Ordenamos las transacciones para asegurar consistencia
  const sortedTransactions = [...data.transactions].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.amount !== b.amount) return a.amount - b.amount;
    return a.type.localeCompare(b.type);
  });

  // Creamos una cadena con los datos relevantes
  const relevantData = {
    transactions: sortedTransactions.map(t => ({
      amount: t.amount,
      date: t.date,
      type: t.type
    })),
    totalAmount: data.totalAmount,
    statementDate: data.statementDate
  };

  // Generamos el hash
  return createHash('sha256')
    .update(JSON.stringify(relevantData))
    .digest('hex');
}

export function generateStatementHash(pdfText: string): string {
  // Normalizar el texto antes de generar el hash
  const normalizedText = pdfText
    .trim()
    .toLowerCase()
    // Eliminar espacios múltiples
    .replace(/\s+/g, ' ')
    // Eliminar caracteres especiales
    .replace(/[^\w\s]/g, '')
    // Eliminar números de tarjeta y otros datos sensibles
    .replace(/\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/g, 'CARDNUMBER')
    .replace(/\b\d{16}\b/g, 'CARDNUMBER');

  // Generar hash SHA-256
  return createHash('sha256')
    .update(normalizedText)
    .digest('hex');
}

// Función para verificar si dos resúmenes son similares
export function areStatementsEqual(text1: string, text2: string): boolean {
  const hash1 = generateStatementHash(text1);
  const hash2 = generateStatementHash(text2);
  return hash1 === hash2;
} 