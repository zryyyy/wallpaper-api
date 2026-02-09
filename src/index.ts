import { Hono } from 'hono';

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) => c.text('Wallpaper API is running'));

// Export the Hono app
export default app;
