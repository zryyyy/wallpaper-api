import type { PexelsQueryParams } from '../routes/pexels';
import { fetchJson } from '../utils/client';

const PEXELS_API_URL = 'https://api.pexels.com/v1/';

interface PexelsImageRaw {
  url: string;
  photographer: string;
  src: {
    original: string;
  };
  alt: string;
}

interface PexelsResponse {
  page: number;
  per_page: number;
  photos: PexelsImageRaw[];
}

interface PexelsWallpaper {
  url: string;
  copyright: string;
  title: string;
}

const mapRaw = (img: PexelsImageRaw): PexelsWallpaper => ({
  url: img.src.original,
  copyright: `${img.alt} (© ${img.photographer}/Pexels)`,
  title: img.alt,
});

export async function getPexelsWallpapers(params: PexelsQueryParams, apiKey: string): Promise<PexelsWallpaper[]> {
  if (!apiKey) throw new Error('Pexels Api Key is missing');
  const headers = {
    Authorization: apiKey,
  };
  switch (params.mode) {
    case 'search':
      return await fetchSearchPhotos(
        {
          query: params.query,
          orientation: params.orientation,
          size: params.size,
          color: params.color,
          locale: params.locale,
          page: params.page,
          per_page: params.n,
        },
        headers,
      );
    case 'curated':
      return await fetchCuratedPhotos({ page: params.page, per_page: params.n }, headers);
    default: {
      const _exhaustive: never = params.mode;
      void _exhaustive;
      throw new Error(`Unsupported mode: ${(params as { mode: string }).mode}`);
    }
  }
}

async function fetchSearchPhotos(
  params: { query: string; orientation?: string; size?: string; color?: string; locale?: string; page?: number; per_page?: number },
  headers: HeadersInit,
): Promise<PexelsWallpaper[]> {
  const url = new URL('search', PEXELS_API_URL);

  url.searchParams.set('query', params.query);
  params.orientation && url.searchParams.set('orientation', params.orientation);
  params.size && url.searchParams.set('size', params.size);
  params.color && url.searchParams.set('color', params.color);
  params.locale && url.searchParams.set('locale', params.locale);
  params.page && url.searchParams.set('page', params.page.toString());
  params.per_page && url.searchParams.set('per_page', params.per_page.toString());

  const data = await fetchJson<PexelsResponse>(url, { headers });
  return data.photos.map<PexelsWallpaper>(mapRaw);
}

async function fetchCuratedPhotos(params: { page?: number; per_page?: number }, headers: HeadersInit): Promise<PexelsWallpaper[]> {
  const url = new URL('curated', PEXELS_API_URL);

  params.page && url.searchParams.set('page', params.page.toString());
  params.per_page && url.searchParams.set('per_page', params.per_page.toString());

  const data = await fetchJson<PexelsResponse>(url, { headers });
  return data.photos.map<PexelsWallpaper>(mapRaw);
}
