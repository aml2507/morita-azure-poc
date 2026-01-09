import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Función para validar las credenciales
function validateEnvVariables() {
  if (!process.env.FIREBASE_ADMIN_PROJECT_ID) {
    throw new Error('FIREBASE_ADMIN_PROJECT_ID is missing');
  }
  if (!process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
    throw new Error('FIREBASE_ADMIN_CLIENT_EMAIL is missing');
  }
  if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    throw new Error('FIREBASE_ADMIN_PRIVATE_KEY is missing');
  }
}

// Función para obtener la instancia de Firebase Admin
function getFirebaseAdmin() {
  validateEnvVariables();

  if (getApps().length > 0) {
    return {
      db: getFirestore(),
      auth: getAuth(),
    };
  }

  try {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n');
    
    const app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
      }),
    });

    console.log('Firebase Admin initialized successfully');
    
    return {
      db: getFirestore(app),
      auth: getAuth(app),
    };
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}

// Exportar las instancias
const { db, auth } = getFirebaseAdmin();
export { db, auth }; 