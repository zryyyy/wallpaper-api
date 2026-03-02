import type { UnsplashQueryParams } from '../routes/unsplash';
import { fetchJson } from '../utils/client';

const UNSPLASH_API_URL = 'https://api.unsplash.com/';

interface UnsplashImageRaw {
  id: string;
  slug: string;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
    small_s3: string;
  };
  links: {
    self: string;
    html: string;
    download: string;
    download_location: string;
  };
  location?: {
    name: string | null;
  };
  user?: {
    name: string | null;
  };
}

type UnsplashPhotosResponse = UnsplashImageRaw[];

interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashImageRaw[];
}

interface UnsplashWallpaper {
  url: string;
  copyright: string;
  title: string;
  download: string;
}

export async function getUnsplashWallpapers(
  params: UnsplashQueryParams,
  apiKey: string,
): Promise<UnsplashWallpaper[]> {
  if (!apiKey) throw new Error('Unsplash Access Key is missing');
  const headers = {
    Authorization: `Client-ID ${apiKey}`,
  };
  switch (params.mode) {
    case 'random':
      return await fetchRandomPhotos(params, headers);
    case 'search':
      return await fetchSearchPhotos(params, headers);
    case 'topic':
      return await fetchTopicPhotos(params, headers);
    case 'list':
      return await fetchListPhotos(params, headers);
    default: {
      const _exhaustive: never = params;
      void _exhaustive;
      throw new Error(`Unsupported mode: ${(params as { mode: string }).mode}`);
    }
  }
}

const mapRaw = (img: UnsplashImageRaw): UnsplashWallpaper => ({
  url: img.urls.full,
  copyright: `${img.description ?? img.alt_description ?? img.slug} ${img.location?.name ?? ''} (© ${img.user?.name ?? 'Unknown'}/Unsplash)`,
  title: img.description ?? img.alt_description ?? img.slug,
  download: img.links.download_location,
});

async function fetchRandomPhotos(
  params: Extract<UnsplashQueryParams, { mode: 'random' }>,
  headers: HeadersInit,
): Promise<UnsplashWallpaper[]> {
  const url = new URL('photos/random', UNSPLASH_API_URL);

  url.searchParams.set('count', params.n.toString());
  params.collections && url.searchParams.set('collections', params.collections);
  params.topics && url.searchParams.set('topics', params.topics);
  params.username && url.searchParams.set('username', params.username);
  params.query && url.searchParams.set('query', params.query);
  params.orientation && url.searchParams.set('orientation', params.orientation);
  params.content_filter && url.searchParams.set('content_filter', params.content_filter);

  const data = await fetchJson<UnsplashPhotosResponse>(url, { headers });
  return data.map<UnsplashWallpaper>(mapRaw);
}

async function fetchSearchPhotos(
  params: Extract<UnsplashQueryParams, { mode: 'search' }>,
  headers: HeadersInit,
): Promise<UnsplashWallpaper[]> {
  const url = new URL('search/photos', UNSPLASH_API_URL);

  url.searchParams.set('query', params.query);
  url.searchParams.set('per_page', params.n.toString());
  url.searchParams.set('page', params.page.toString());
  params.order_by && url.searchParams.set('order_by', params.order_by);
  params.orientation && url.searchParams.set('orientation', params.orientation);
  params.color && url.searchParams.set('color', params.color);
  params.content_filter && url.searchParams.set('content_filter', params.content_filter);

  const data = await fetchJson<UnsplashSearchResponse>(url, { headers });
  return data.results.map<UnsplashWallpaper>(mapRaw);
}

async function fetchTopicPhotos(
  params: Extract<UnsplashQueryParams, { mode: 'topic' }>,
  headers: HeadersInit,
): Promise<UnsplashWallpaper[]> {
  const url = new URL(`topics/${params.topic}/photos`, UNSPLASH_API_URL);

  url.searchParams.set('per_page', params.n.toString());
  url.searchParams.set('page', params.page.toString());
  params.orientation && url.searchParams.set('orientation', params.orientation);
  params.order_by && url.searchParams.set('order_by', params.order_by);

  const data = await fetchJson<UnsplashPhotosResponse>(url, { headers });
  return data.map<UnsplashWallpaper>(mapRaw);
}

async function fetchListPhotos(
  params: Extract<UnsplashQueryParams, { mode: 'list' }>,
  headers: HeadersInit,
): Promise<UnsplashWallpaper[]> {
  const url = new URL('photos', UNSPLASH_API_URL);

  url.searchParams.set('per_page', params.n.toString());
  url.searchParams.set('page', params.page.toString());

  const data = await fetchJson<UnsplashPhotosResponse>(url, { headers });
  return data.map<UnsplashWallpaper>(mapRaw);
}
