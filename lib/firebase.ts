import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

function getServiceAccount() {
  // 1. Check if provided as JSON string or base64 in environment variable (for Vercel production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
      if (raw.startsWith("{")) {
        return JSON.parse(raw);
      }
      const decoded = Buffer.from(raw, "base64").toString("utf8");
      return JSON.parse(decoded);
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY env var:", e);
    }
  }

  // 2. Check individual environment variables
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  }

  // 3. Fallback to local secret file in development
  const localSecretPath = path.join(process.cwd(), "secret", "fir-02-7b7cf-firebase-adminsdk-fbsvc-c07ed99fa4.json");
  if (fs.existsSync(localSecretPath)) {
    try {
      const fileData = fs.readFileSync(localSecretPath, "utf8");
      return JSON.parse(fileData);
    } catch (e) {
      console.error("Failed to read local service account file:", e);
    }
  }

  throw new Error(
    "Firebase Admin credentials not found. Provide FIREBASE_SERVICE_ACCOUNT_KEY or place the service account JSON in /secret."
  );
}

export function getFirebaseAdminApp() {
  if (admin.getApps().length > 0) {
    return admin.getApp();
  }

  const serviceAccount = getServiceAccount();
  return admin.initializeApp({
    credential: admin.cert(serviceAccount),
    projectId: serviceAccount.project_id || serviceAccount.projectId || "fir-02-7b7cf",
  });
}

export function getDb() {
  const app = getFirebaseAdminApp();
  return getFirestore(app);
}
