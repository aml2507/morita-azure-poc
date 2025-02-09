import crypto from 'crypto';

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

export function generateStatementHash(data: StatementData): string {
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
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(relevantData))
    .digest('hex');
} 