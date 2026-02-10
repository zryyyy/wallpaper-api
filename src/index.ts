import { Hono } from 'hono';
import { cors } from 'hono/cors';
import bingRoute from './routes/bing';

// Start a Hono app
const app = new Hono();

app.use(cors());

app.get('/', (c) => c.text('Wallpaper API is running'));

app.route('/bing', bingRoute);

// Export the Hono app
export default app;
