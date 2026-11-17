import { config } from "dotenv";
import mongoose from "mongoose";

config({ path: ".env.local", quiet: true });

async function main() {
  const { videoStorage } = await import("../lib/videos");
  const { records } = await videoStorage();
  const order = [5, 4, 1, 2, 3];
  const result = await records.bulkWrite(
    order.map((number, position) => ({
      updateOne: {
        filter: { _id: "herbliss-film-" + String(number).padStart(2, "0") },
        update: { $set: { position, updatedAt: new Date() } },
      },
    })),
  );
  if (result.matchedCount !== order.length) {
    throw new Error("Some video records are missing.");
  }
  console.info("Saved video order: 5, 4, 1, 2, 3.");
}

main()
  .catch(() => {
    console.error("Could not update all video positions.");
    process.exitCode = 1;
  })
  .finally(async () => { await mongoose.disconnect(); });
