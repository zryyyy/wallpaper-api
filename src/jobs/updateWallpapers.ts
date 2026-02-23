import { getBingWallpapers } from '../services/bing';
import { getPexelsWallpapers } from '../services/pexels';
import { getUnsplashWallpapers } from '../services/unsplash';
import { getWallhavenWallpapers } from '../services/wallhaven';

interface Wallpaper {
  url: string;
  copyright: string;
  title: string;
  source: string;
}

async function fetchAndMapWallpapers(source: string, fetcher: () => Promise<Omit<Wallpaper, 'source'>[]>): Promise<Wallpaper[]> {
  try {
    const rawWallpapers = await fetcher();
    console.log(`[${source}] Successfully fetched ${rawWallpapers.length} wallpapers.`);

    return rawWallpapers.map(({ url, copyright, title }) => ({
      url,
      copyright,
      title,
      source,
    }));
  } catch (error) {
    console.error(`[${source}] Failed to fetch wallpapers:`, error);
    return [];
  }
}

export default async function updateWallpapers(_controller: ScheduledController, env: Env, _ctx: ExecutionContext) {
  try {
    const fetchTasks: Promise<Wallpaper[]>[] = [
      fetchAndMapWallpapers('bing', async () => {
        const [bing1, bing2] = await Promise.all([getBingWallpapers({ idx: 0, n: 7 }), getBingWallpapers({ idx: 8, n: 8 })]);
        return [...bing1, ...bing2];
      }),

      fetchAndMapWallpapers('wallhaven', () => getWallhavenWallpapers({ sorting: 'random', purity: '100', atleast: '2560x1440' })),
    ];

    if (env.UNSPLASH_ACCESS_KEY) {
      fetchTasks.push(fetchAndMapWallpapers('unsplash', () => getUnsplashWallpapers({ mode: 'random', n: 15 }, env.UNSPLASH_ACCESS_KEY)));
    }

    if (env.PEXELS_API_KEY) {
      fetchTasks.push(fetchAndMapWallpapers('pexels', () => getPexelsWallpapers({ mode: 'curated' }, env.PEXELS_API_KEY)));
    }

    const results = await Promise.all(fetchTasks);

    const wallpapers = results.flat();

    if (wallpapers.length > 0) {
      await env.WALLPAPER_KV.put('DAILY_WALLPAPERS', JSON.stringify(wallpapers));
      console.log(`✅ Successfully stored a total of ${wallpapers.length} wallpapers.`);
    } else {
      console.warn('⚠️ No wallpapers were fetched from any source.');
    }
  } catch (e) {
    console.error('Critical failure during updateWallpapers execution:', e);
  }
}
