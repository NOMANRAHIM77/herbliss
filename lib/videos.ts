import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { parseStorefrontEnv } from "@/lib/env-schema";
import type { StoreVideo } from "@/content/videos";

export type VideoRecord = {
  _id: string;
  title: string;
  fileId: mongoose.mongo.ObjectId;
  poster: string;
  position: number;
  published: boolean;
  updatedAt: Date;
};

// Versions identify the published originals used to create the bundled MP4s.
const bundledFilmVersions = new Map([
  ["herbliss-film-05", "0d69d7cdf43ae2f04a2c3486"],
  ["herbliss-film-04", "13981eaf01d81e8b8517bbd9"],
  ["herbliss-film-01", "cd3a45b38f51fcedccaf2b7b"],
  ["herbliss-film-02", "ff5a84e2626e2faaa0bc0913"],
  ["herbliss-film-03", "4aba3f3877008912e42bec09"],
]);

function bundledFilmPath(id: string, version: string) {
  return `/media/videos/${id}-${version}.mp4`;
}

function bundledVideoList(): StoreVideo[] {
  return Array.from(bundledFilmVersions, ([id, version]) => ({
    id,
    title: `Herbliss film ${id.slice(-2)}`,
    src: bundledFilmPath(id, version),
    poster: `/images/videos/${id}.jpg`,
  }));
}

export async function videoStorage() {
  const connection = await connectDB();
  const db = connection.connection.db;
  if (!db) throw new Error("Video storage is unavailable.");
  return {
    records: db.collection<VideoRecord>("store_videos"),
    bucket: new mongoose.mongo.GridFSBucket(db, {
      bucketName: "store_video_files",
    }),
  };
}

async function readPublishedVideos(): Promise<VideoRecord[]> {
  const { records } = await videoStorage();
  return records
    .find({ published: true })
    .sort({ position: 1, _id: 1 })
    .limit(30)
    .maxTimeMS(5_000)
    .toArray();
}

export async function listVideos(): Promise<StoreVideo[]> {
  const { BACKEND_URL } = parseStorefrontEnv(process.env);
  if (BACKEND_URL) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/videos`, {
        cache: "no-store",
        signal: AbortSignal.timeout(2_500),
      });
      if (response.ok) {
        const { videos } = (await response.json()) as { videos: StoreVideo[] };
        return videos;
      }
    } catch {
      // Bundled films keep the storefront usable while the backend starts.
    }
    return bundledVideoList();
  }

  let timeout: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<null>((resolve) => {
    timeout = setTimeout(() => resolve(null), 2_000);
  });
  // A cold Atlas connection may take longer than the homepage can wait.
  const videos = await Promise.race([readPublishedVideos(), deadline])
    .catch(() => null)
    .finally(() => clearTimeout(timeout));
  if (videos === null) return bundledVideoList();

  return videos.map((video) => {
    const id = video._id;
    const version = video.fileId.toHexString();
    const original = `/api/videos/${id}?v=${version}`;
    const bundled = bundledFilmVersions.get(id) === version;
    return {
      id,
      title: video.title,
      src: bundled ? bundledFilmPath(id, version) : original,
      ...(bundled ? { fallbackSrc: original } : {}),
      poster: video.poster,
    };
  });
}
