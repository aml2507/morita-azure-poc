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

export function generateStatementHash(content: string): string {
  // Limpiar el contenido de espacios en blanco y convertir a minúsculas
  const cleanContent = content
    .toLowerCase()
    .replace(/\s+/g, '')
    .trim();

  // Usar un algoritmo simple de hashing
  let hash = 0;
  for (let i = 0; i < cleanContent.length; i++) {
    const char = cleanContent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a 32bit integer
  }

  return hash.toString(16); // Convertir a hexadecimal
}

// Función para verificar si dos resúmenes son similares
export function areStatementsEqual(text1: string, text2: string): boolean {
  const hash1 = generateStatementHash(text1);
  const hash2 = generateStatementHash(text2);
  return hash1 === hash2;
} 