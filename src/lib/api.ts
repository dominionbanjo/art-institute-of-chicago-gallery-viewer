import { ApiResponse, Artwork } from "../types";
import { 
  fetchArtworksFromAIC, 
  fetchArtworkByIdFromAIC, 
  getImageUrl as getImageUrlService,
  getDirectImageUrl as getDirectImageUrlService,
} from "./api-service";

/**
 * These functions act as the gateway for the application.
 * They run on the server (Server Components) and use the core service logic.
 */

export async function getArtworks(
  page: number = 1,
  limit: number = 20,
  query: string = "",
): Promise<ApiResponse<Artwork[]>> {
  return fetchArtworksFromAIC(page, limit, query);
}

export async function getArtworkById(
  id: string,
): Promise<ApiResponse<Artwork>> {
  return fetchArtworkByIdFromAIC(id);
}

/**
 * Re-export the image URL helpers
 */
export const getImageUrl = getImageUrlService;
export const getDirectImageUrl = getDirectImageUrlService;
