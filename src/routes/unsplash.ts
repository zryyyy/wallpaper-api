import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
// biome-ignore format: readability
import { check, type InferOutput, integer, literal, maxValue, minValue, nonEmpty, number, object, optional, picklist, pipe, string, transform, unknown, variant } from 'valibot';
import { getUnsplashWallpapers } from '../services/unsplash';

const toInt = (min: number, max: number, fallback?: number) =>
  optional(
    pipe(unknown(), transform(Number), number(), integer(), minValue(min), maxValue(max)),
    fallback,
  );

const randomQuerySchema = pipe(
  object({
    mode: literal('random'),
    n: toInt(1, 30, 1), // count
    collections: optional(pipe(string(), nonEmpty())),
    topics: optional(pipe(string(), nonEmpty())),
    username: optional(string()),
    query: optional(string()),
    orientation: optional(picklist(['landscape', 'portrait', 'squarish'])),
    content_filter: optional(picklist(['low', 'high'])),
  }),
  check((input) => !(!!input.collections && !!input.topics)),
);

const searchQuerySchema = object({
  mode: literal('search'),
  n: toInt(1, 30, 1), // per_page
  query: optional(pipe(string(), nonEmpty()), 'landscape'),
  page: toInt(1, 100, 1),
  order_by: optional(picklist(['relevant', 'latest'])),
  orientation: optional(picklist(['landscape', 'portrait', 'squarish'])),
  // biome-ignore format: readability
  color: optional(picklist(['black_and_white', 'black', 'white', 'yellow', 'orange', 'red', 'purple', 'magenta', 'green', 'teal', 'blue'])),
  content_filter: optional(picklist(['low', 'high'])),
});

const listQuerySchema = object({
  mode: literal('list'),
  n: toInt(1, 30, 10), // per_page
  page: toInt(1, 100, 1),
});

const querySchema = variant('mode', [randomQuerySchema, searchQuerySchema, listQuerySchema]);

export type UnsplashQueryParams = InferOutput<typeof querySchema>;

const unsplashRoute = new Hono<{ Bindings: Env }>();

unsplashRoute.get('/', vValidator('query', querySchema), async (c) => {
  return c.json(await getUnsplashWallpapers(c.req.valid('query'), c.env.UNSPLASH_ACCESS_KEY));
});

unsplashRoute.get('/pic', vValidator('query', querySchema), async (c) => {
  const data = await getUnsplashWallpapers(c.req.valid('query'), c.env.UNSPLASH_ACCESS_KEY);
  if (data.length === 0) {
    return c.text('No wallpaper found', 404);
  }
  return c.redirect(data[0].url, 302);
});

export default unsplashRoute;
