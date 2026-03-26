/**
 * Restore Firestore data from a backup JSON file.
 * Uses Firebase Admin SDK with Application Default Credentials.
 *
 * Usage: node scripts/restore.mjs backups/backup-2026-03-26T12-00-00-000Z.json
 */

import fs from "fs";
import { db, appId } from "./firebase-admin-init.mjs";

async function restore() {
  const backupFile = process.argv[2];
  if (!backupFile) {
    console.error("Usage: node scripts/restore.mjs <backup-file.json>");
    console.error("\nAvailable backups:");
    const backupsDir = "backups";
    if (fs.existsSync(backupsDir)) {
      const files = fs.readdirSync(backupsDir)
        .filter((f) => f.startsWith("backup-") && f.endsWith(".json"))
        .sort()
        .reverse();
      files.forEach((f) => console.error(`  ${backupsDir}/${f}`));
    }
    process.exit(1);
  }

  if (!fs.existsSync(backupFile)) {
    console.error(`File not found: ${backupFile}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(backupFile, "utf-8"));

  // Show summary and ask for confirmation
  console.log(`\nRestore from: ${backupFile}`);
  for (const [col, docs] of Object.entries(data)) {
    console.log(`  ${col}: ${Object.keys(docs).length} documents`);
  }
  console.log("\nThis will OVERWRITE existing documents in Firestore.");
  console.log("Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n");

  await new Promise((resolve) => setTimeout(resolve, 5000));

  for (const [col, docs] of Object.entries(data)) {
    const entries = Object.entries(docs);
    // Firestore batch limit is 500
    for (let i = 0; i < entries.length; i += 500) {
      const batch = db.batch();
      const chunk = entries.slice(i, i + 500);
      for (const [docId, docData] of chunk) {
        const ref = db.doc(`artifacts/${appId}/public/data/${col}/${docId}`);
        batch.set(ref, docData);
      }
      await batch.commit();
    }
    console.log(`  Restored ${entries.length} ${col} documents`);
  }

  console.log("\nRestore complete!");
  process.exit(0);
}

restore().catch((err) => {
  console.error("Restore failed:", err);
  process.exit(1);
});
