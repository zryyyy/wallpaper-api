import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
// biome-ignore format: readability
import { integer, maxValue, minValue, number, object, optional, pipe, regex, string, transform, unknown, } from 'valibot';
import { getBingWallpapers } from '../services/bing';

const querySchema = object({
  mkt: optional(pipe(string(), regex(/^[a-z]{2}-[A-Z]{2}$/))),
  idx: optional(
    pipe(unknown(), transform(Number), number(), integer(), minValue(0), maxValue(7)),
    0,
  ),
  n: optional(pipe(unknown(), transform(Number), number(), integer(), minValue(1), maxValue(8)), 1),
});

const bingRoute = new Hono();

bingRoute.get('/', vValidator('query', querySchema), async (c) => {
  const { mkt, idx, n } = c.req.valid('query');

  return c.json(await getBingWallpapers({ mkt, idx, n }));
});

bingRoute.get('/pic', vValidator('query', querySchema), async (c) => {
  const { mkt, idx } = c.req.valid('query');

  const data = await getBingWallpapers({ mkt, idx });
  if (data.length === 0) {
    return c.text('No wallpaper found', 404);
  }
  return c.redirect(data[0].url, 302);
});

export default bingRoute;
