import { Readable } from "node:stream";
import { videoStorage } from "@/lib/videos";
export const runtime = "nodejs";

async function serve(
  request: Request,
  context: { params: Promise<{ id: string }> },
  head: boolean,
) {
  const { id } = await context.params;
  if (!/^[a-z0-9-]{1,80}$/.test(id)) return new Response(null, { status: 404 });
  try {
    const { records, bucket } = await videoStorage();
    const record = await records.findOne({ _id: id, published: true });
    if (!record) return new Response(null, { status: 404 });
    const file = await bucket.find({ _id: record.fileId }).next();
    if (!file || file.length <= 0) return new Response(null, { status: 404 });
    const headers = new Headers({
      "Content-Type": "video/mp4",
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    });
    let start = 0,
      end = file.length - 1,
      status = 200;
    const range = head ? null : request.headers.get("range");
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      const invalid = () =>
        new Response(null, {
          status: 416,
          headers: {
            "Content-Range": "bytes */" + file.length,
            "Accept-Ranges": "bytes",
          },
        });
      if (!match || (!match[1] && !match[2])) return invalid();
      if (!match[1]) {
        const suffix = Number(match[2]);
        if (!Number.isSafeInteger(suffix) || suffix <= 0) return invalid();
        start = Math.max(0, file.length - suffix);
      } else {
        start = Number(match[1]);
        end = match[2] ? Number(match[2]) : end;
        if (
          !Number.isSafeInteger(start) ||
          !Number.isSafeInteger(end) ||
          start >= file.length ||
          end < start
        )
          return invalid();
        end = Math.min(end, file.length - 1);
      }
      status = 206;
      headers.set(
        "Content-Range",
        "bytes " + start + "-" + end + "/" + file.length,
      );
    }
    headers.set("Content-Length", String(end - start + 1));
    if (head) return new Response(null, { status, headers });
    // GridFS uses an exclusive end offset. Stream only the requested bytes.
    const stream = bucket.openDownloadStream(record.fileId, {
      start,
      end: end + 1,
    });
    const abort = () => {
      void stream.abort().catch(() => {});
    };
    request.signal.addEventListener("abort", abort, { once: true });
    stream.once("close", () =>
      request.signal.removeEventListener("abort", abort),
    );
    if (request.signal.aborted) abort();
    const body = Readable.toWeb(stream) as ReadableStream<Uint8Array>;
    return new Response(body, { status, headers });
  } catch {
    return new Response(null, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return serve(request, context, false);
}
export async function HEAD(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return serve(request, context, true);
}
