import { getPexelsWallpapers } from '../services/pexels';
import { getUnsplashWallpapers } from '../services/unsplash';
import { getWallhavenWallpapers } from '../services/wallhaven';
import { fetchJson } from '../utils/client';
import { shuffleArray } from '../utils/shuffle';

export interface Wallpaper {
  url: string;
  copyright: string;
  title: string;
  source: string;
}

async function fetchAndMapWallpapers(
  source: string,
  fetcher: () => Promise<Omit<Wallpaper, 'source'>[]>,
): Promise<Wallpaper[]> {
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

export default async function updateWallpapers(
  _controller: ScheduledController,
  env: Env,
  _ctx: ExecutionContext,
) {
  try {
    const fetchTasks: Promise<Wallpaper[]>[] = [
      fetchAndMapWallpapers('bing', async () => {
        const data = await fetchJson<{ date: string; url: string; copyright: string }[]>(
          'https://raw.githubusercontent.com/zryyyy/bing-wallpaper/refs/heads/master/img/en-SG.json',
        );
        return data.map((img) => ({
          date: img.date,
          url: img.url,
          copyright: img.copyright,
          title: img.copyright.replace(/\s*\(.*\)$/, ''),
        }));
      }),

      fetchAndMapWallpapers('wallhaven', () =>
        getWallhavenWallpapers({
          purity: '100',
          sorting: 'toplist',
          topRange: '1M',
          atleast: '2560x1440',
          ratios: 'landscape',
        }),
      ),
    ];

    if (env.UNSPLASH_ACCESS_KEY) {
      fetchTasks.push(
        fetchAndMapWallpapers('unsplash', () =>
          getUnsplashWallpapers(
            { mode: 'random', n: 25, topics: 'wallpapers', orientation: 'landscape' },
            env.UNSPLASH_ACCESS_KEY,
          ),
        ),
      );
    }

    if (env.PEXELS_API_KEY) {
      fetchTasks.push(
        fetchAndMapWallpapers('pexels', () =>
          getPexelsWallpapers(
            { mode: 'search', query: 'nature', orientation: 'landscape', n: 5 },
            env.PEXELS_API_KEY,
          ),
        ),
      );
    }

    const results = await Promise.all(fetchTasks);

    const wallpapers = results.flat();

    if (wallpapers.length > 0) {
      await env.WALLPAPER_KV.put('DAILY_WALLPAPERS', JSON.stringify(shuffleArray(wallpapers)));
      console.log(`✅ Successfully stored a total of ${wallpapers.length} wallpapers.`);
    } else {
      console.warn('⚠️ No wallpapers were fetched from any source.');
    }
  } catch (e) {
    console.error('Critical failure during updateWallpapers execution:', e);
  }
}
