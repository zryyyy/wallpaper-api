import { Hono } from 'hono';
import { cors } from 'hono/cors';

import updateWallpapers from './jobs/updateWallpapers';

import bingRoute from './routes/bing';
import pexelsRoute from './routes/pexels';
import randomRoute from './routes/random';
import unsplashRoute from './routes/unsplash';
import wallhavenRoute from './routes/wallhaven';

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

app.use(cors());

app.onError((err, c) => {
  console.error('[Error]', err);
  return c.json(
    {
      success: false,
      error: err.message || 'Internal Server Error',
    },
    500,
  );
});

app.get('/', (c) => c.text('Wallpaper API is running'));

app.route('/bing', bingRoute);
app.route('/unsplash', unsplashRoute);
app.route('/wallhaven', wallhavenRoute);
app.route('/pexels', pexelsRoute);
app.route('/random', randomRoute);

export default {
  fetch: app.fetch,
  scheduled: updateWallpapers,
};
