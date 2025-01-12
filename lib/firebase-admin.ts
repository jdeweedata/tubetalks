import * as admin from 'firebase-admin';

function getServiceAccount() {
  // Get service account details from environment variables
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error('FIREBASE_PRIVATE_KEY is not configured in environment variables');
  }

  // Replace escaped newlines with actual newlines
  const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    privateKey: formattedPrivateKey,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  return serviceAccount;
}

export function getFirebaseAdminApp() {
  const apps = admin.apps;
  
  if (apps.length > 0 && apps[0]) {
    return apps[0];
  }

  const serviceAccount = getServiceAccount();

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.projectId,
      privateKey: serviceAccount.privateKey,
      clientEmail: serviceAccount.clientEmail,
    }),
    projectId: serviceAccount.projectId,
  });
}

export function getFirebaseAdminDB() {
  const app = getFirebaseAdminApp();
  return admin.firestore();
} 