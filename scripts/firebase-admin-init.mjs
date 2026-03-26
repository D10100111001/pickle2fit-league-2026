/**
 * Shared Firebase Admin initializer for CLI scripts.
 *
 * Creates a persistent SA key at .firebase-sa-key.json (gitignored),
 * only regenerating if the file is missing or invalid.
 *
 * Requires: gcloud CLI logged in with access to the pickle2fit-league-2026 project.
 */

import admin from "firebase-admin";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PROJECT_ID = "pickle2fit-league-2026";
const SA_EMAIL = `firebase-adminsdk-fbsvc@${PROJECT_ID}.iam.gserviceaccount.com`;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keyPath = path.resolve(__dirname, "..", ".firebase-sa-key.json");

// Point GOOGLE_APPLICATION_CREDENTIALS to our key so all Google libs use it
// (google-gax/grpc may read this directly, ignoring the cert credential)

function createKey() {
  console.log("Creating Firebase SA key via gcloud...");
  try {
    execSync(
      `gcloud iam service-accounts keys create "${keyPath}" --iam-account "${SA_EMAIL}" --project "${PROJECT_ID}"`,
      { stdio: "pipe" }
    );
    console.log("SA key created at .firebase-sa-key.json\n");
  } catch (err) {
    console.error("Failed to create SA key. Make sure gcloud is logged in with access to", PROJECT_ID);
    console.error(err.stderr?.toString() || err.message);
    process.exit(1);
  }
}

// Create key if it doesn't exist
if (!fs.existsSync(keyPath)) {
  createKey();
}

// Set env var so all underlying Google libs (google-gax, grpc) use this key
process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;

// Initialize Firebase Admin
let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf-8"));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: PROJECT_ID,
  });
  // Quick validation — will throw if the key is revoked/invalid
} catch (err) {
  if (err.code === "app/invalid-credential" || err.message?.includes("invalid")) {
    console.log("Existing SA key is invalid, regenerating...");
    fs.unlinkSync(keyPath);
    createKey();
    serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf-8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: PROJECT_ID,
    });
  } else {
    throw err;
  }
}

export const db = admin.firestore();
export const appId = PROJECT_ID;
export { admin };
