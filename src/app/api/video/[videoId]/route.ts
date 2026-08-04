import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { resolveYandexDiskDirectUrl } from "@/lib/yandex-disk";
import { isYandexDiskUrl } from "@/lib/yandex-disk";

// Streams a lesson video through our own origin instead of handing the
// browser a third-party URL directly (Yandex signed link or a
// blob.vercel-storage.com URL). Several of those hosting domains are
// unreliable or blocked outright for Russian viewers without a VPN, while
// our own app domain isn't — so every video request goes through here
// regardless of where the file actually lives.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { videoId } = await params;
  const video = await prisma.lessonVideo.findUnique({
    where: { id: videoId },
    select: { url: true },
  });
  if (!video) return new Response("Not found", { status: 404 });

  const directUrl = isYandexDiskUrl(video.url)
    ? await resolveYandexDiskDirectUrl(video.url)
    : video.url;
  if (!directUrl) return new Response("Video source unavailable", { status: 502 });

  const range = req.headers.get("range");
  let upstream: Response;
  try {
    upstream = await fetch(directUrl, {
      headers: range ? { Range: range } : {},
      cache: "no-store",
    });
  } catch (err) {
    console.error("Video proxy fetch failed", err);
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

  return new Response(upstream.body, { status: upstream.status, headers });
}
