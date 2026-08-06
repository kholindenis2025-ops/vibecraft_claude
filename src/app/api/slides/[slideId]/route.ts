import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Streams a lesson PDF through our own origin instead of pointing the
// iframe straight at blob.vercel-storage.com, which — like several other
// third-party hosting domains — isn't reliably reachable for Russian
// viewers without a VPN.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slideId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { slideId } = await params;
  const download = req.nextUrl.searchParams.get("download");
  const slide = await prisma.lessonSlide.findUnique({
    where: { id: slideId },
    select: { url: true },
  });
  if (!slide) return new Response("Not found", { status: 404 });

  const range = req.headers.get("range");
  let upstream: Response;
  try {
    upstream = await fetch(slide.url, {
      headers: range ? { Range: range } : {},
      cache: "no-store",
    });
  } catch (err) {
    console.error("Slides proxy fetch failed", err);
    return new Response("Upstream fetch failed", { status: 502 });
  }

  if (!upstream.ok && upstream.status !== 206) {
    return new Response(`Upstream error ${upstream.status}`, { status: 502 });
  }

  const headers = new Headers();
  for (const h of ["content-type", "content-length", "content-range", "cache-control"]) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  headers.set("accept-ranges", "bytes");
  headers.set(
    "content-disposition",
    download ? 'attachment; filename="presentation.pdf"' : "inline"
  );

  return new Response(upstream.body, { status: upstream.status, headers });
}
