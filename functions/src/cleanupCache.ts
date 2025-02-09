import { onSchedule } from "firebase-functions/v2/scheduler";
import { db } from '../../src/lib/firebase-admin';

export const cleanupCache = onSchedule("0 0 * * *", async (event) => {
  const CACHE_EXPIRATION = 30 * 24 * 60 * 60 * 1000;
  const expiredBefore = Date.now() - CACHE_EXPIRATION;
  
  try {
    const snapshot = await db
      .collection('statement-cache')
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
}); 