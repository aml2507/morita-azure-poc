import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Procesar la clave privada correctamente
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

if (!privateKey) {
  throw new Error('FIREBASE_ADMIN_PRIVATE_KEY no está definida');
}

if (!process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
  throw new Error('FIREBASE_ADMIN_CLIENT_EMAIL no está definida');
}

if (!process.env.FIREBASE_ADMIN_PROJECT_ID) {
  throw new Error('FIREBASE_ADMIN_PROJECT_ID no está definida');
}

// Inicializar Firebase Admin solo si no hay instancias previas
if (!getApps().length) {
  initializeApp({
    credential: cert({
      privateKey: privateKey,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    }),
  });
}

export const auth = getAuth(); 