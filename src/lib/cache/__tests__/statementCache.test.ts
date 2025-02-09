import { StatementCache } from '../statementCache';
import { db } from '@/lib/firebase-admin';

jest.mock('@/lib/firebase-admin');

describe('StatementCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null for non-existent cache', async () => {
    const mockGet = jest.fn().mockResolvedValue({ exists: false });
    const mockDoc = jest.fn().mockReturnValue({ get: mockGet });
    const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc });
    
    (db.collection as jest.Mock).mockReturnValue({ doc: mockDoc });

    const result = await StatementCache.get({ 
      transactions: [] 
    }, 'user123');

    expect(result).toBeNull();
  });

  it('should return decrypted data for valid cache', async () => {
    const mockData = {
      analysis: 'encrypted-data',
      createdAt: Date.now(),
      userId: 'user123',
      hash: 'test-hash'
    };

    const mockGet = jest.fn().mockResolvedValue({ 
      exists: true,
      data: () => mockData
    });

    const mockDoc = jest.fn().mockReturnValue({ get: mockGet });
    (db.collection as jest.Mock).mockReturnValue({ doc: mockDoc });

    const result = await StatementCache.get({
      transactions: []
    }, 'user123');

    expect(result).not.toBeNull();
  });
}); 