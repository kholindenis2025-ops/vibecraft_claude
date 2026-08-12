import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function filenameFor(url: string, title: string | null): string {
  let ext = "md";
  try {
    const match = new URL(url).pathname.match(/\.([a-zA-Z0-9]+)$/);
    if (match) ext = match[1];
  } catch {
    // fall back to default extension
  }
  const base = (title && title.trim()) || "material";
  return `${base}.${ext}`;
}

// Streams lesson materials (e.g. markdown files) through our own origin
// instead of pointing straight at blob.vercel-storage.com — same reasoning
// as the video/slides/image proxies: that hosting domain isn't reliably
// reachable for Russian viewers without a VPN.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ materialId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { materialId } = await params;
  const material = await prisma.lessonMaterial.findUnique({
    where: { id: materialId },
    select: { url: true, title: true },
  });
  if (!material) return new Response("Not found", { status: 404 });

  let upstream: Response;
  try {
    upstream = await fetch(material.url, { cache: "no-store" });
  } catch (err) {
    console.error("Material proxy fetch failed", err);
    return new Response("Upstream fetch failed", { status: 502 });
  }
  if (!upstream.ok) {
    return new Response(`Upstream error ${upstream.status}`, { status: 502 });
  }

  const headers = new Headers();
  for (const h of ["content-type", "content-length", "cache-control"]) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  headers.set(
    "content-disposition",
    `attachment; filename="${filenameFor(material.url, material.title)}"`
  );

  return new Response(upstream.body, { status: 200, headers });
}
