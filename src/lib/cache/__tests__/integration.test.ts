import { StatementCache } from '../statementCache';
import { generateHash } from '../hashGenerator';

describe('Cache Integration Tests', () => {
  const testData = {
    transactions: [
      { amount: 100, date: '2024-03-20', type: 'debit' },
      { amount: 200, date: '2024-03-21', type: 'credit' }
    ],
    totalAmount: 300,
    statementDate: '2024-03-22'
  };

  const testAnalysis = {
    deudaActual: 5000,
    pagoMinimo: 500,
    fechaVencimiento: '2024-04-15'
  };

  const testUserId = 'test-user-123';

  // Limpiar el caché después de cada test
  afterEach(async () => {
    const hash = generateHash(testData);
    await StatementCache.invalidate(hash);
  });

  it('should store and retrieve analysis from cache', async () => {
    // Guardar en caché
    await StatementCache.set(testData, testAnalysis, testUserId);

    // Recuperar del caché
    const cachedAnalysis = await StatementCache.get(testData, testUserId);

    expect(cachedAnalysis).toEqual(testAnalysis);
  });

  it('should return null for non-existent cache', async () => {
    const result = await StatementCache.get({
      transactions: [],
      totalAmount: 0,
      statementDate: '2024-03-22'
    }, testUserId);

    expect(result).toBeNull();
  });

  it('should not return cache for different user', async () => {
    // Guardar con un usuario
    await StatementCache.set(testData, testAnalysis, testUserId);

    // Intentar recuperar con otro usuario
    const result = await StatementCache.get(testData, 'different-user');

    expect(result).toBeNull();
  });
}); 