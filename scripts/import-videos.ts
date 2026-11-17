import { config } from "dotenv";
import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import mongoose from "mongoose";
config({ path: ".env.local", quiet: true });

const names = [
  "1fac8aff-1c66-4a31-beda-1eaa40d80c63.mp4",
  "cc51b02f-797b-445c-8ae0-17c7360fb177.mp4",
  "6053ed54-1595-42b9-aea1-a216af7aaddb.mp4",
  "90d683f8-3e72-439c-9406-21b90bb576d8.mp4",
  "VID_20261114_113753_005.mp4",
];

async function main() {
  const directory = process.argv[2];
  if (!directory)
    throw new Error("Pass the folder containing the five supplied videos.");
  const { videoStorage } = await import("../lib/videos");
  const { records, bucket } = await videoStorage();
  for (let index = 0; index < names.length; index++) {
    const path = resolve(directory, names[index]);
    await access(path);
    const hash = createHash("sha256");
    for await (const chunk of createReadStream(path)) hash.update(chunk);
    const checksum = hash.digest("hex");
    const fileId = new mongoose.mongo.ObjectId(checksum.slice(0, 24));
    const id = "herbliss-film-" + String(index + 1).padStart(2, "0");
    const existing = await bucket.find({ _id: fileId }).next();
    if (!existing) {
      const upload = bucket.openUploadStreamWithId(fileId, id + ".mp4", {
        metadata: { contentType: "video/mp4", sha256: checksum },
      });
      try {
        await pipeline(createReadStream(path), upload);
      } catch (error) {
        await upload.abort().catch(() => {});
        throw error;
      }
    }
    await records.updateOne(
      { _id: id },
      {
        $set: {
          title: "Herbliss film " + String(index + 1).padStart(2, "0"),
          fileId,
          poster: "/images/videos/" + id + ".jpg",
          position: [2, 3, 4, 1, 0][index],
          published: true,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
    console.info(
      "Saved video " + (index + 1) + " of " + names.length + " to MongoDB.",
    );
  }
}
main()
  .catch(() => {
    console.error(
      "Video import could not complete. Check the input folder, Atlas network access and database configuration. Completed uploads are safe to resume.",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
