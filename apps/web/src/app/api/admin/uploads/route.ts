import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

type UploadResponse = {
  success: boolean;
  data: { urls: string[] } | null;
  error: { code: string; message: string } | null;
};

export async function POST(request: NextRequest) {
  try {
    if (!request.headers.get("authorization")) {
      return uploadError("UNAUTHORIZED", "Authentication is required.", 401);
    }

    const formData = await request.formData();
    const files = formData.getAll("files").filter((value): value is File => value instanceof File);

    if (!files.length) {
      return uploadError("VALIDATION_ERROR", "Select at least one image.", 400);
    }

    if (files.length > MAX_FILES) {
      return uploadError("VALIDATION_ERROR", `Upload up to ${MAX_FILES} images at a time.`, 400);
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      const extension = ALLOWED_TYPES.get(file.type);

      if (!extension) {
        return uploadError("VALIDATION_ERROR", "Only JPG, PNG, WebP, or GIF images are allowed.", 400);
      }

      if (file.size > MAX_FILE_SIZE) {
        return uploadError("VALIDATION_ERROR", "Each image must be 5MB or smaller.", 400);
      }

      const filename = `${Date.now()}-${randomUUID()}.${extension}`;
      const bytes = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, filename), bytes);
      urls.push(new URL(`/uploads/products/${filename}`, request.url).toString());
    }

    return NextResponse.json<UploadResponse>({ success: true, data: { urls }, error: null });
  } catch (error) {
    return uploadError("UPLOAD_FAILED", error instanceof Error ? error.message : "Image upload failed.", 500);
  }
}

function uploadError(code: string, message: string, status: number) {
  return NextResponse.json<UploadResponse>({ success: false, data: null, error: { code, message } }, { status });
}
