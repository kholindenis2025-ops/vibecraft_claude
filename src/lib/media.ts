// A URL that points straight at a playable video file (e.g. our own Vercel
// Blob uploads) rather than a page that needs an iframe embed.
export function isDirectVideoUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("public.blob.vercel-storage.com")) return true;
    return /\.(mp4|webm|mov|m4v)$/i.test(u.pathname);
  } catch {
    return false;
  }
}

// True for any URL that needs to go through our /api/slides proxy rather
// than being iframed directly — i.e. a raw file (our own Blob uploads),
// as opposed to a hosted viewer page (Drive/Slides) that has to stay on
// the provider's own domain since it's an interactive page, not bytes.
export function isProxiedSlideUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      !u.hostname.includes("drive.google.com") && !u.hostname.includes("docs.google.com")
    );
  } catch {
    return false;
  }
}

export function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url);

    if (u.hostname.includes("drive.google.com")) {
      const match = u.pathname.match(/\/file\/d\/([^/]+)/);
      const fileId = match?.[1] ?? u.searchParams.get("id");
      if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    if (u.hostname.includes("docs.google.com") && u.pathname.includes("/presentation/")) {
      return url.replace(/\/(edit|preview).*$/, "/embed");
    }

    if (u.hostname.includes("youtube.com") || u.hostname === "youtu.be") {
      let videoId = u.searchParams.get("v");
      if (!videoId && u.hostname === "youtu.be") videoId = u.pathname.slice(1);
      if (!videoId && u.pathname.includes("/embed/")) return url;
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    return url;
  } catch {
    return url;
  }
}
