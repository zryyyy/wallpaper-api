import type { Wallpaper } from '../jobs/updateWallpapers';

export async function getRandomWallpapers(kv: KVNamespace, n: number = 1): Promise<Wallpaper[]> {
  const wallpapers = await kv.get<Wallpaper[]>('DAILY_WALLPAPERS', 'json');
  if (!wallpapers || wallpapers.length === 0) {
    return [];
  }

  if (n === 1) {
    const randomImage = wallpapers[Math.floor(Math.random() * wallpapers.length)];
    return [randomImage];
  }

  const shuffled = [...wallpapers].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
