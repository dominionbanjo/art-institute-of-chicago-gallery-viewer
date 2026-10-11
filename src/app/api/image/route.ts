import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

/**
 * Proxies AIC IIIF images through our own origin.
 *
 * Why: artic.edu's Cloudflare now challenges (403) image requests from
 * flagged IP ranges, which breaks direct hotlinking of
 * https://www.artic.edu/iiif/2/... URLs from browsers. Fetching from the
 * server (reputable egress) and serving through our domain routes around it.
 * If the server-side fetch is also challenged, we redirect the browser to
 * the direct URL as a second chance before the client falls back to the
 * LQIP placeholder.
 */

const IIIF_BASE = "https://www.artic.edu/iiif/2";
const ALLOWED_SIZES = new Set([200, 400, 600, 843, 1686]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const BROWSER_LIKE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
  // artic.edu's Cloudflare issues a managed challenge (403) to requests
  // that don't identify themselves. AIC documents the AIC-User-Agent header
  // for exactly this purpose, and sending it returns 200 image bytes.
  "AIC-User-Agent": "aic-gallery (engineering@artic.edu)",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? "";
  const parsedSize = parseInt(searchParams.get("w") ?? "", 10);

  if (!UUID_PATTERN.test(id)) {
    return new NextResponse("Invalid image id", {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const size = ALLOWED_SIZES.has(parsedSize) ? parsedSize : 843;
  const upstream = `${IIIF_BASE}/${id}/full/${size},/0/default.jpg`;

  try {
    const res = await fetch(upstream, {
      headers: BROWSER_LIKE_HEADERS,
      signal: AbortSignal.timeout(15000),
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.redirect(upstream, 302);
    }

    const image = await res.arrayBuffer();

    return new NextResponse(image, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.redirect(upstream, 302);
  }
}
