import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";

// Streams images embedded in lesson text through our own origin instead of
// pointing straight at blob.vercel-storage.com — same reasoning as the
// video/slides proxies: that hosting domain isn't reliably reachable for
// Russian viewers without a VPN.
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new Response("Missing url", { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }
  if (!parsed.hostname.endsWith("blob.vercel-storage.com")) {
    return new Response("Host not allowed", { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(parsed.toString(), { cache: "no-store" });
  } catch (err) {
    console.error("Image proxy fetch failed", err);
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
  headers.set("content-disposition", "inline");

  return new Response(upstream.body, { status: 200, headers });
}
