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
