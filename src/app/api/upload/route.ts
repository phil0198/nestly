import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getUserId } from "@/lib/auth";
import { ALLOWED_TYPES, MAX_UPLOAD_BYTES, UPLOAD_DIR } from "@/lib/uploads";

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Log in to upload photos." }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const files = form?.getAll("files").filter((f): f is File => f instanceof File) ?? [];
  if (!files.length) return NextResponse.json({ error: "No files received." }, { status: 400 });
  if (files.length > 20) return NextResponse.json({ error: "Upload up to 20 photos at a time." }, { status: 400 });

  await mkdir(UPLOAD_DIR, { recursive: true });
  const urls: string[] = [];
  for (const file of files) {
    const ext = ALLOWED_TYPES[file.type];
    if (!ext) return NextResponse.json({ error: `${file.name} isn't a supported image type.` }, { status: 400 });
    if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: `${file.name} is larger than 8 MB.` }, { status: 400 });
    const name = `${randomUUID()}.${ext}`;
    await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
    urls.push(`/api/uploads/${name}`);
  }
  return NextResponse.json({ urls }, { status: 201 });
}
