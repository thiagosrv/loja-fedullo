import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      if (!ALLOWED.includes(file.type)) {
        return NextResponse.json(
          { error: `Tipo não permitido: ${file.type}` },
          { status: 400 }
        );
      }

      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: "Arquivo muito grande (máx 10MB)" }, { status: 400 });
      }

      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      await writeFile(path.join(uploadDir, filename), buffer);
      urls.push(`/uploads/products/${filename}`);
    }

    return NextResponse.json({ urls });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Erro no upload" }, { status: 500 });
  }
}

// App Router Route Handlers parse FormData natively — no config needed
