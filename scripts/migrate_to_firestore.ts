import { Firestore } from "@google-cloud/firestore";
import AdmZip from "adm-zip";
import path from "path";
import fs from "fs";

async function runMigration() {
  console.log(`[Migration] Initializing Firestore client...`);
  
  const firestore = new Firestore();

  const zipFiles = [
    "original.zip",
    "clear_modern.zip",
    "easy_reading.zip",
    "kids_primary.zip",
    "teens_youth.zip",
    "young_adult.zip"
  ];

  const zipsDir = path.join(process.cwd(), "zips");
  const collectionName = "devotionals";

  console.log(`[Migration] Starting batch ingestion of devotionals from zip files...`);
  const startTime = Date.now();
  let totalInserted = 0;

  // We use bulkWriter for optimal high-throughput ingestion with built-in retry and backoff
  const bulkWriter = firestore.bulkWriter();
  
  bulkWriter.onWriteError((error) => {
    console.error(`[Migration] [BulkWriter Error] failed write for ${error.documentRef.path}: ${error.message}`);
    // Return true to attempt retry if retry attempts allow
    return error.failedAttempts < 3;
  });

  bulkWriter.onWriteResult((ref, result) => {
    totalInserted++;
    if (totalInserted % 500 === 0) {
      console.log(`[Migration] Successfully wrote ${totalInserted} documents...`);
    }
  });

  for (const zipFileName of zipFiles) {
    const profileId = zipFileName.replace(".zip", "");
    const zipPath = path.join(zipsDir, zipFileName);

    if (!fs.existsSync(zipPath)) {
      console.warn(`[Migration] Zip archive not found: ${zipPath}. Skipping.`);
      continue;
    }

    console.log(`[Migration] Processing archive: ${zipFileName} (Profile ID: ${profileId})...`);
    
    try {
      const zip = new AdmZip(zipPath);
      const zipEntries = zip.getEntries();
      let fileCount = 0;

      for (const entry of zipEntries) {
        if (entry.entryName.endsWith(".json") && !entry.isDirectory) {
          const filename = path.basename(entry.entryName);
          // File pattern: [book_id]_[month]_[day].json, e.g., ag_01_01.json
          const match = filename.match(/^([a-z0-9_-]+)_(\d{2}_\d{2})\.json$/i);
          
          if (match) {
            const bookId = match[1].toLowerCase();
            const day = match[2];

            try {
              const contentStr = entry.getData().toString("utf8");
              const data = JSON.parse(contentStr);
              const title = data.title || "";
              const originalParagraphs = data.paragraphs || [];

              // Normalize paragraphs to matching output structure with pronunciationOverrides if missing
              const paragraphs = originalParagraphs.map((p: any) => ({
                id: p.id || `p_${Math.random().toString(36).substring(2, 9)}`,
                type: p.type || "body",
                text: p.text || "",
                pronunciationOverrides: p.pronunciationOverrides || []
              }));

              const docId = `${profileId}_${bookId}_${day}`;
              const docRef = firestore.collection(collectionName).doc(docId);

              // Set in BulkWriter
              bulkWriter.set(docRef, {
                profile_id: profileId,
                book_id: bookId,
                day,
                title,
                paragraphs,
                updatedAt: new Date().toISOString(),
                createdAt: new Date().toISOString()
              });

              fileCount++;
            } catch (parseErr) {
              console.error(`[Migration] Error parsing JSON from ${zipFileName}::${entry.entryName}:`, parseErr);
            }
          }
        }
      }

      console.log(`[Migration] Enqueued ${fileCount} documents from ${zipFileName}`);
    } catch (zipErr) {
      console.error(`[Migration] Error processing zip file ${zipFileName}:`, zipErr);
    }
  }

  console.log(`[Migration] Closing BulkWriter. Waiting for all writes to finalize...`);
  await bulkWriter.close();

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[Migration] Ingestion complete! Total inserted docs: ${totalInserted}. Time taken: ${durationSec}s`);
}

runMigration().catch((err) => {
  console.error("[Migration] Serious migration failure:", err);
  process.exit(1);
});
