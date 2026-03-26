/**
 * Backup all matches, players, and rsvps from Firestore to a local JSON file.
 * Only saves if data has changed since the last backup.
 * Uses Firebase Admin SDK with Application Default Credentials.
 *
 * Usage: node scripts/backup.mjs          # skip if unchanged
 *        node scripts/backup.mjs --force  # always save
 * Output: backups/backup-YYYY-MM-DDTHH-MM-SS.json
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { db, appId } from "./firebase-admin-init.mjs";

const COLLECTIONS = ["matches", "players", "timeSlots", "rsvps"];
const force = process.argv.includes("--force");

async function backup() {
  const data = {};

  for (const col of COLLECTIONS) {
    const snapshot = await db.collection(`artifacts/${appId}/public/data/${col}`).get();
    data[col] = {};
    snapshot.forEach((doc) => {
      data[col][doc.id] = doc.data();
    });
    console.log(`  ${col}: ${snapshot.size} documents`);
  }

  const backupsDir = path.resolve("backups");
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  // Check if data has changed since the last backup
  const content = JSON.stringify(data, null, 2);
  const newHash = crypto.createHash("sha256").update(content).digest("hex");

  if (!force) {
    const files = fs.readdirSync(backupsDir)
      .filter((f) => f.startsWith("backup-") && f.endsWith(".json"))
      .sort();

    if (files.length > 0) {
      const lastBackup = fs.readFileSync(path.join(backupsDir, files[files.length - 1]), "utf-8");
      const lastHash = crypto.createHash("sha256").update(lastBackup).digest("hex");

      if (newHash === lastHash) {
        console.log("\nNo changes since last backup. Skipping.");
        process.exit(0);
      }
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `backup-${timestamp}.json`;
  const filepath = path.join(backupsDir, filename);

  fs.writeFileSync(filepath, content);
  console.log(`\nBackup saved to ${filepath}`);

  // Keep only the last 30 backups
  const allFiles = fs.readdirSync(backupsDir)
    .filter((f) => f.startsWith("backup-") && f.endsWith(".json"))
    .sort();

  if (allFiles.length > 30) {
    const toDelete = allFiles.slice(0, allFiles.length - 30);
    for (const f of toDelete) {
      fs.unlinkSync(path.join(backupsDir, f));
      console.log(`  Pruned old backup: ${f}`);
    }
  }

  process.exit(0);
}

backup().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
