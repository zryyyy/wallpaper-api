import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
// biome-ignore format: readability
import { type InferOutput, integer, maxLength, minValue, number, object, optional, picklist, pipe, regex, string, transform, trim, unknown } from 'valibot';
import { getWallhavenWallpapers } from '../services/wallhaven';

const querySchema = object({
  q: optional(pipe(string(), trim(), maxLength(300))),
  categories: optional(picklist(['001', '010', '100', '011', '101', '110', '111'])),
  purity: optional(picklist(['001', '010', '100', '011', '101', '110', '111'])),
  sorting: optional(picklist(['date_added', 'relevance', 'random', 'views', 'favorites', 'toplist']), 'random'),
  order: optional(picklist(['desc', 'asc'])),
  topRange: optional(picklist(['1d', '3d', '1w', '1M', '3M', '6M', '1y'])),
  atleast: optional(pipe(string(), trim(), regex(/^\d{2,6}x\d{2,6}$/)), '2560x1440'),
  resolutions: optional(pipe(string(), trim(), regex(/^\d{2,6}x\d{2,6}(,\d{2,6}x\d{2,6})*$/))),
  ratios: optional(pipe(string(), trim(), regex(/^((landscape|portrait|\d{1,3}x\d{1,3})(,(landscape|portrait|\d{1,3}x\d{1,3}))*)$/))),
  colors: optional(pipe(string(), trim(), regex(/^[0-9a-fA-F]{6}$/))),
  page: optional(pipe(unknown(), transform(Number), number(), integer(), minValue(1))),
  seed: optional(pipe(string(), trim(), regex(/^[a-zA-Z0-9]{6}$/))),
});

export type WallhavenQueryParams = InferOutput<typeof querySchema>;

const wallhavenRoute = new Hono<{ Bindings: Env }>();

wallhavenRoute.get('/', vValidator('query', querySchema), async (c) => {
  return c.json(await getWallhavenWallpapers(c.req.valid('query'), c.env.WALLHAVEN_API_KEY));
});

wallhavenRoute.get('/pic', vValidator('query', querySchema), async (c) => {
  const data = await getWallhavenWallpapers(c.req.valid('query'), c.env.WALLHAVEN_API_KEY);
  if (data.length === 0) {
    return c.text('No wallpaper found', 404);
  }
  return c.redirect(data[0].url, 302);
});

export default wallhavenRoute;
