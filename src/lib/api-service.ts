import { Artwork, ApiResponse } from "@/types";

const API_BASE = "https://api.artic.edu/api/v1";
const IIIF_BASE = "https://www.artic.edu/iiif/2";

const FETCH_TIMEOUT_MS = 12000;
const FETCH_RETRY_TIMEOUT_MS = 8000;

/**
 * artic.edu sits behind Cloudflare and challenges (403) requests from
 * flagged egress ranges — e.g. Vercel's — that don't identify themselves.
 * AIC documents the AIC-User-Agent header for exactly this purpose (the
 * image proxy in src/app/api/image/route.ts already relies on it).
 * Send it plus browser-like headers on every API call so production
 * (Vercel) gets 200s just like local dev does.
 */
const AIC_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept: "application/json",
  "AIC-User-Agent": "aic-gallery (engineering@artic.edu)",
};

type ExtendedFetchInit = RequestInit & {
  next?: { revalidate?: number | false };
  cf?: { cacheEverything?: boolean; cacheTtl?: number };
};

/**
 * Core service logic for fetching from the Art Institute of Chicago API.
 * This runs on the "Next.js server" (API routes or Server Components).
 */

function isTimeoutError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  );
}

/**
 * fetch with a hard timeout and a single retry (on timeout, network error,
 * or upstream 5xx), so a degraded AIC API fails fast with a friendly message
 * instead of hanging the request.
 */
async function resilientFetch(
  url: string,
  init: ExtendedFetchInit = {},
): Promise<Response> {
  let firstResponse: Response | null = null;

  try {
    const res = await fetch(url, {
      ...init,
      headers: { ...AIC_HEADERS, ...(init.headers ?? {}) },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (res.status < 500) return res;
    firstResponse = res;
  } catch (error) {
    if (!isTimeoutError(error) && firstResponse === null) throw error;
  }

  try {
    const res = await fetch(url, {
      ...init,
      headers: { ...AIC_HEADERS, ...(init.headers ?? {}) },
      signal: AbortSignal.timeout(FETCH_RETRY_TIMEOUT_MS),
    });
    if (res.status < 500) return res;
    // Upstream still 5xx on the retry — surface the first response's status.
    return firstResponse ?? res;
  } catch (error) {
    if (isTimeoutError(error)) {
      throw new Error(
        "The Art Institute API is taking too long to respond. Please try again shortly.",
      );
    }
    if (firstResponse) return firstResponse;
    throw error;
  }
}

export async function fetchArtworksFromAIC(
  page: number = 1,
  limit: number = 20,
  query: string = "",
): Promise<ApiResponse<Artwork[]>> {
  let url = `${API_BASE}/artworks`;

  if (query) {
    url = `${API_BASE}/artworks/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}&fields=id,title,artist_display,artist_title,date_display,medium_display,image_id,thumbnail,is_public_domain,artwork_type_title`;
  } else {
    url = `${API_BASE}/artworks?page=${page}&limit=${limit}&fields=id,title,artist_display,artist_title,date_display,medium_display,image_id,thumbnail,is_public_domain,artwork_type_title`;
  }

  const res = await resilientFetch(url, {
    next: { revalidate: 3600 },
    cf: {
      cacheEverything: true,
      cacheTtl: 3600,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch artworks. Please try again later.");
  }

  const data: ApiResponse<Artwork[]> = await res.json();

  // Filter out artworks that have no display (no image_id)
  if (data.data && Array.isArray(data.data)) {
    data.data = data.data.filter((artwork: Artwork) => !!artwork.image_id);
  }

  return data;
}

const DETAIL_FIELDS =
  "id,title,artist_display,artist_title,date_display,medium_display,description,short_description,dimensions,credit_line,place_of_origin,image_id,thumbnail,is_public_domain,artwork_type_title";

export async function fetchArtworkByIdFromAIC(
  id: string,
): Promise<ApiResponse<Artwork>> {
  // The dedicated /artworks/{id} detail endpoint currently hangs from many
  // networks, while the list endpoint filtered by ?ids= returns the exact
  // same fields reliably (and often much faster). Prefer the list path.
  const url = `${API_BASE}/artworks?ids=${encodeURIComponent(id)}&fields=${DETAIL_FIELDS}`;

  const res = await resilientFetch(url, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Artwork not found");
    }
    throw new Error("Failed to fetch artwork details.");
  }

  const payload: ApiResponse<Artwork[]> = await res.json();
  const artwork = payload.data?.[0];

  // ?ids= returns an empty data array (not 404) when the id doesn't exist.
  if (!artwork) {
    throw new Error("Artwork not found");
  }

  return { ...payload, data: artwork };
}

/**
 * Helper to construct the IIIF image URL (direct, bypasses our proxy).
 */
export function getDirectImageUrl(
  imageId: string,
  size: number = 843,
): string {
  return `${IIIF_BASE}/${imageId}/full/${size},/0/default.jpg`;
}

/**
 * Helper to construct the image URL used by the UI.
 * Routes through our own proxy (/api/image) so images keep loading even
 * when artic.edu's Cloudflare challenges direct hotlinks.
 */
export function getImageUrl(
  imageId: string | undefined,
  size: number = 843,
): string {
  if (!imageId) return "/placeholder.png";
  return `/api/image?id=${encodeURIComponent(imageId)}&w=${size}`;
}
