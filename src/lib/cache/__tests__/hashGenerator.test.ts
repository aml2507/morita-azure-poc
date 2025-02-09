import { generateHash } from '../hashGenerator';

describe('generateHash', () => {
  it('should generate consistent hashes for same data', () => {
    const data1 = {
      transactions: [
        { amount: 100, date: '2024-03-20', type: 'debit' },
        { amount: 200, date: '2024-03-21', type: 'credit' }
      ],
      totalAmount: 300,
      statementDate: '2024-03-22'
    };

    const data2 = {
      transactions: [
        { amount: 200, date: '2024-03-21', type: 'credit' },
        { amount: 100, date: '2024-03-20', type: 'debit' }
      ],
      totalAmount: 300,
      statementDate: '2024-03-22'
    };

    const hash1 = generateHash(data1);
    const hash2 = generateHash(data2);

    expect(hash1).toBe(hash2);
  });

  it('should generate different hashes for different data', () => {
    const data1 = {
      transactions: [
        { amount: 100, date: '2024-03-20', type: 'debit' }
      ],
      totalAmount: 100,
      statementDate: '2024-03-22'
    };

    const data2 = {
      transactions: [
        { amount: 200, date: '2024-03-20', type: 'debit' }
      ],
      totalAmount: 200,
      statementDate: '2024-03-22'
    };

    const hash1 = generateHash(data1);
    const hash2 = generateHash(data2);

    expect(hash1).not.toBe(hash2);
  });
}); 