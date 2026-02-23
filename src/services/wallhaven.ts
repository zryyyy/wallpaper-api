import type { WallhavenQueryParams } from '../routes/wallhaven';
import { fetchJson } from '../utils/client';

const WALLHAVEN_API_URL = 'https://wallhaven.cc/api/v1/';

interface WallhavenImageRaw {
  url: string;
  path: string;
  source: string;
}

interface WallhavenResponse {
  data: WallhavenImageRaw[];
}

interface WallhavenWallpaper {
  url: string;
  copyright: string;
  title: string;
}

export async function getWallhavenWallpapers(
  params: WallhavenQueryParams,
  apiKey?: string,
): Promise<WallhavenWallpaper[]> {
  const url = new URL('search', WALLHAVEN_API_URL);
  // check NSFW bit
  if (params.purity?.[2] === '1') {
    if (!apiKey) throw new Error('Wallhaven Api Key is missing');
    url.searchParams.set('apikey', apiKey);
  }

  url.searchParams.set('sorting', params.sorting);
  url.searchParams.set('atleast', params.atleast);
  params.q && url.searchParams.set('q', params.q);
  params.categories && url.searchParams.set('categories', params.categories);
  params.purity && url.searchParams.set('purity', params.purity);
  params.order && url.searchParams.set('order', params.order);
  params.resolutions && url.searchParams.set('resolutions', params.resolutions);
  params.ratios && url.searchParams.set('ratios', params.ratios);
  params.colors && url.searchParams.set('colors', params.colors);
  params.page && url.searchParams.set('page', params.page.toString());
  params.seed && url.searchParams.set('seed', params.seed);

  if (params.sorting === 'toplist' && params.topRange) {
    url.searchParams.set('topRange', params.topRange);
  }

  const data = await fetchJson<WallhavenResponse>(url.toString());

  return data.data.map<WallhavenWallpaper>((img) => ({
    url: img.path,
    copyright: '© Wallhaven',
    title: 'Wallpaper from wallhaven',
  }));
}
