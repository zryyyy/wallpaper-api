import { Hono } from 'hono';
import { cors } from 'hono/cors';

import updateWallpapers from './jobs/updateWallpapers';

import bingRoute from './routes/bing';
import pexelsRoute from './routes/pexels';
import unsplashRoute from './routes/unsplash';
import wallhavenRoute from './routes/wallhaven';

// Start a Hono app
const app = new Hono();

app.use(cors());

app.get('/', (c) => c.text('Wallpaper API is running'));

app.route('/bing', bingRoute);
app.route('/unsplash', unsplashRoute);
app.route('/wallhaven', wallhavenRoute);
app.route('/pexels', pexelsRoute);

export default {
  fetch: app.fetch,
  scheduled: updateWallpapers,
};
