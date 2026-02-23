import { fetchJson } from '../utils/client';

const BING_HOST = 'https://www.bing.com';
const BING_API_URL = `${BING_HOST}/HPImageArchive.aspx`;

interface BingImageRaw {
  startdate: string;
  urlbase: string;
  copyright: string;
  title: string;
  drk: 0 | 1;
}

interface BingResponse {
  images: BingImageRaw[];
  tooltips?: Record<string, string>;
}

interface BingWallpaper {
  date: string;
  url: string;
  copyright: string;
  title: string;
  drk: 0 | 1;
}

export async function getBingWallpapers(params: {
  idx: number;
  n?: number;
  mkt?: string;
}): Promise<BingWallpaper[]> {
  const url = new URL(BING_API_URL);
  url.searchParams.set('format', 'js');
  url.searchParams.set('idx', params.idx.toString());
  url.searchParams.set('n', params.n ? params.n.toString() : '1');
  params.mkt && url.searchParams.set('mkt', params.mkt);

  const data = await fetchJson<BingResponse>(url.toString());

  return data.images.map<BingWallpaper>((img) => ({
    date: img.startdate,
    url: `${BING_HOST}${img.urlbase}_UHD.jpg`,
    copyright: img.copyright,
    title: img.title,
    drk: img.drk,
  }));
}
