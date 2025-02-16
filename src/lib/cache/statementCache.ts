import { db } from '@/lib/firebase-admin';
import { generateStatementHash } from './hashGenerator';
import { encrypt, decrypt } from '@/lib/encryption';
import { createHash } from 'crypto';

interface CacheEntry {
  analysis: any;
  createdAt: number;
  userId: string;
  hash: string;
}

export class StatementCache {
  private static CACHE_EXPIRATION = 30 * 24 * 60 * 60 * 1000; // 30 días en ms
  private static COLLECTION = 'statement-cache';

  static async get(pdfText: string, userId: string): Promise<any | null> {
    try {
      const hash = generateStatementHash(pdfText);
      const cacheRef = db.collection(this.COLLECTION).doc(hash);
      const cache = await cacheRef.get();

      if (!cache.exists) {
        return null;
      }

      const cacheData = cache.data() as CacheEntry;

      // Verificar expiración
      if (Date.now() - cacheData.createdAt > this.CACHE_EXPIRATION) {
        await this.invalidate(hash);
        return null;
      }

      // Verificar permisos
      if (cacheData.userId !== userId) {
        return null;
      }

      // Desencriptar análisis
      return decrypt(cacheData.analysis);
    } catch (error) {
      console.error('Error retrieving from cache:', error);
      return null;
    }
  }

  static async set(data: { text: string; analysis: any; timestamp: number }, userId: string) {
    try {
      const hash = generateStatementHash(data.text);
      await db.collection(this.COLLECTION).doc(hash).set({
        analysis: data.analysis,
        createdAt: data.timestamp,
        userId: userId,
        hash: hash
      });
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  static async invalidate(hash: string): Promise<void> {
    try {
      await db.collection(this.COLLECTION).doc(hash).delete();
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  }

  static async cleanup(): Promise<void> {
    try {
      const expiredBefore = Date.now() - this.CACHE_EXPIRATION;
      const snapshot = await db
        .collection(this.COLLECTION)
        .where('createdAt', '<', expiredBefore)
        .get();

      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error cleaning up cache:', error);
    }
  }

  static generateHash(pdfText: string): string {
    return createHash('sha256').update(pdfText).digest('hex');
  }
} 