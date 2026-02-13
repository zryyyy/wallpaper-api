import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
// biome-ignore format: readability
import { fallback, type InferOutput, integer, maxLength, maxValue, minLength, minValue, number, object, optional, picklist, pipe, string, transform, trim, unknown, } from 'valibot';
import { getPexelsWallpapers } from '../services/pexels';

const querySchema = object({
  mode: fallback(picklist(['search', 'curated']), 'curated'),
  query: optional(pipe(string(), trim(), minLength(1), maxLength(300)), 'landscape'),
  orientation: optional(picklist(['landscape', 'portrait', 'square'])),
  size: optional(picklist(['small', 'medium', 'large'])),
  color: optional(pipe(string(), trim(), maxLength(30))),
  // biome-ignore format: readability
  locale: optional(picklist(['en-US', 'pt-BR', 'es-ES', 'ca-ES', 'de-DE', 'it-IT', 'fr-FR', 'sv-SE', 'id-ID', 'pl-PL', 'ja-JP', 'zh-TW', 'zh-CN', 'ko-KR', 'th-TH', 'nl-NL', 'hu-HU', 'vi-VN', 'cs-CZ', 'da-DK', 'fi-FI', 'uk-UA', 'el-GR', 'ro-RO', 'nb-NO', 'sk-SK', 'tr-TR', 'ru-RU'])),
  page: optional(pipe(unknown(), transform(Number), number(), integer(), minValue(1))),
  n: optional(pipe(unknown(), transform(Number), number(), integer(), minValue(1), maxValue(80))), // per_page
});

export type PexelsQueryParams = InferOutput<typeof querySchema>;

const pexelsRoute = new Hono<{ Bindings: Env }>();

pexelsRoute.get('/', vValidator('query', querySchema), async (c) => {
  return c.json(await getPexelsWallpapers(c.req.valid('query'), c.env.PEXELS_API_KEY));
});

pexelsRoute.get('/pic', vValidator('query', querySchema), async (c) => {
  const data = await getPexelsWallpapers(c.req.valid('query'), c.env.PEXELS_API_KEY);
  if (data.length === 0) {
    return c.text('No wallpaper found', 404);
  }
  return c.redirect(data[0].url, 302);
});

export default pexelsRoute;
