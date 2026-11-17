import { listVideos } from "@/lib/videos";
export const runtime = "nodejs";
export async function GET() {
  try {
    return Response.json(
      { videos: await listVideos() },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
        },
      },
    );
  } catch {
    return Response.json(
      { error: "Videos are temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
