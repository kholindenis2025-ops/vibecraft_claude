export function isYandexDiskUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "disk.yandex.ru" || host === "disk.yandex.com" || host === "yadi.sk";
  } catch {
    return false;
  }
}

// Public resources on Yandex Disk expose a temporary direct download link
// through this unauthenticated REST endpoint. The link is time-limited, so
// it must be resolved fresh on every page render rather than stored.
export async function resolveYandexDiskDirectUrl(publicUrl: string): Promise<string | null> {
  try {
    const apiUrl = `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(publicUrl)}`;
    const res = await fetch(apiUrl, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      console.error("Yandex Disk resolve failed", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = (await res.json()) as { href?: string };
    return data.href ?? null;
  } catch (err) {
    console.error("Yandex Disk resolve threw", err);
    return null;
  }
}
