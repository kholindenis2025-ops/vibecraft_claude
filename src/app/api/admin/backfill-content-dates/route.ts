import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// One-off admin utility: sets Lesson.contentUpdatedAt to the real Vercel
// Blob upload timestamp of that lesson's video/slide/embedded-image files
// (instead of the "today" placeholder from the earlier blind backfill).
// Lessons with no Blob-hosted material get contentUpdatedAt cleared to null.
export async function POST() {
  await requireAdmin();

  const blobByPathname = new Map<string, Date>();
  let cursor: string | undefined;
  do {
    const page = await list({ cursor, limit: 1000 });
    for (const b of page.blobs) {
      blobByPathname.set(b.pathname, b.uploadedAt);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  function blobDateForUrl(url: string): Date | null {
    try {
      const pathname = decodeURIComponent(new URL(url).pathname).replace(/^\/+/, "");
      return blobByPathname.get(pathname) ?? null;
    } catch {
      return null;
    }
  }

  const lessons = await prisma.lesson.findMany({
    select: {
      id: true,
      content: true,
      videos: { select: { url: true } },
      slides: { select: { url: true } },
    },
  });

  const imageUrlRe = /!\[[^\]]*\]\((https:\/\/[^)\s]+)\)/g;

  let updatedWithDate = 0;
  let clearedToNull = 0;

  for (const lesson of lessons) {
    const urls: string[] = [
      ...lesson.videos.map((v) => v.url),
      ...lesson.slides.map((s) => s.url),
    ];
    for (const match of lesson.content.matchAll(imageUrlRe)) {
      urls.push(match[1]);
    }

    let latest: Date | null = null;
    for (const url of urls) {
      const d = blobDateForUrl(url);
      if (d && (!latest || d > latest)) latest = d;
    }

    await prisma.lesson.update({
      where: { id: lesson.id },
      data: { contentUpdatedAt: latest },
    });

    if (latest) updatedWithDate++;
    else clearedToNull++;
  }

  return NextResponse.json({
    totalLessons: lessons.length,
    updatedWithRealDate: updatedWithDate,
    clearedToNull,
    blobsIndexed: blobByPathname.size,
  });
}
