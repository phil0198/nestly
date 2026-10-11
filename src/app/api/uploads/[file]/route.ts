import { readFile } from "fs/promises";
import path from "path";
import { ALLOWED_TYPES, UPLOAD_DIR } from "@/lib/uploads";

const MIME = Object.fromEntries(Object.entries(ALLOWED_TYPES).map(([mime, ext]) => [ext, mime]));

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  // Only plain generated names: uuid.ext — rejects traversal like ../
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp|gif|avif)$/.test(file)) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(path.join(UPLOAD_DIR, file));
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": MIME[file.split(".").pop()!], "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
