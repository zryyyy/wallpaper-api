# Wallpaper API

A lightweight, edge-rendered wallpaper API built with [Cloudflare Workers](https://workers.cloudflare.com/) & [Hono](https://hono.dev/).

## Features

- **Multi-Source Aggregation**: Fetch wallpapers from multiple popular platforms using a unified interface.
- **Scheduled Updates**: Uses Cloudflare Workers Cron Triggers (`0 0 * * *`) to automatically fetch and cache a daily collection of wallpapers into Cloudflare KV.
- **Direct Image Redirects**: Every source includes a `/pic` endpoint that directly redirects the client to the raw image URL.
- **Edge-Ready**: Built for [Cloudflare Workers](https://workers.cloudflare.com/) for global, low-latency responses.
- **Type-Safe Validation**: Query parameters are strictly validated using [Valibot](https://valibot.dev/).
- **Modern Tooling**: Uses [Biome](https://biomejs.dev/) for fast formatting and linting.

## Project Structure

```text
.
├── src/
│   ├── index.ts                 # Main application entry point and router setup
│   ├── jobs/
│   │   └── updateWallpapers.ts  # Scheduled cron job to fetch and cache wallpapers in KV
│   ├── routes/                  # API route definitions and parameter validation
│   │   ├── bing.ts
│   │   ├── pexels.ts
│   │   ├── random.ts
│   │   ├── unsplash.ts
│   │   └── wallhaven.ts
│   ├── services/                # Core logic and external API integrations
│   │   ├── bing.ts
│   │   ├── pexels.ts
│   │   ├── random.ts
│   │   ├── unsplash.ts
│   │   └── wallhaven.ts
│   └── utils/                   # Shared utilities (fetch client, array shuffler)
│       ├── client.ts
│       └── shuffle.ts
├── wrangler.jsonc               # Cloudflare Workers configuration
├── biome.json                   # Biome linter/formatter configuration
└── package.json                 # Project dependencies and scripts
```

## Getting Started

1. **Clone the repository and install dependencies:**

   ```bash
   npm install
   ```

2. **Set up Environment Variables:**

   Create a `.dev.vars` file in the root directory for local development to store your API keys:

   ```env
   UNSPLASH_ACCESS_KEY=your_unsplash_key
   PEXELS_API_KEY=your_pexels_key
   WALLHAVEN_API_KEY=your_wallhaven_key
   ```

3. **Start the local development server:**

   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start the local development server using Wrangler.
- `npm run deploy` - Deploy the project to Cloudflare Workers.
- `npm run lint` - Check for linting errors using Biome.
- `npm run fmt` - Format code using Biome.
- `npm run typecheck` - Run TypeScript compiler checks.
