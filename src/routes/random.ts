import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
// biome-ignore format: readability
import { fallback, integer, maxValue, minValue, number, object, pipe, transform, unknown, } from 'valibot';
import { getRandomWallpapers } from '../services/random';

const querySchema = object({
  n: fallback(
    pipe(unknown(), transform(Number), number(), integer(), minValue(1), maxValue(60)),
    1,
  ),
});

const randomRoute = new Hono<{ Bindings: Env }>();

randomRoute.get('/', vValidator('query', querySchema), async (c) => {
  const { n } = c.req.valid('query');

  return c.json(await getRandomWallpapers(c.env.WALLPAPER_KV, n));
});

randomRoute.get('/pic', vValidator('query', querySchema), async (c) => {
  const data = await getRandomWallpapers(c.env.WALLPAPER_KV);
  if (data.length === 0) {
    return c.text('No wallpaper found', 404);
  }
  return c.redirect(data[0].url, 302);
});

export default randomRoute;
