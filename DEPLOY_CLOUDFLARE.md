# Deploying FossRadar to Cloudflare Workers

FossRadar has been migrated to **vinext**, enabling native deployment to Cloudflare Workers with high performance and minimal overhead.

## Prerequisites

1.  A [Cloudflare Account](https://dash.cloudflare.com/sign-up).
2.  The Cloudflare CLI (`wrangler`) is already installed as a dev dependency.

## Local Development

To run the app locally using the vinext dev server:

```bash
npm run dev
```

## Deployment Steps

### 1. Login to Cloudflare

If you haven't authenticated wrangler yet, run:

```bash
npx wrangler login
```

### 2. Create a KV Namespace (Recommended for ISR)

vinext uses Cloudflare KV for Incremental Static Regeneration (ISR). This makes your app extremely fast by caching rendered pages on the edge.

1.  Create a new KV namespace:
    ```bash
    npx wrangler kv:namespace create VINEXT_CACHE
    ```
2.  Cloudflare will output a `kv_namespaces` configuration. Copy the `id` and update your `wrangler.jsonc` file:

    ```json
    "kv_namespaces": [
      {
        "binding": "VINEXT_CACHE",
        "id": "YOUR_KV_NAMESPACE_ID"
      }
    ]
    ```

### 3. Deploy

Running the deploy command will automatically build the project and upload it to Cloudflare:

```bash
npm run deploy
```

## Features Enabled on Cloudflare

- **Hono-powered Routing**: Blazing fast request handling on the edge.
- **Image Optimization**: Local images are automatically optimized using Cloudflare's Image Transformation service (via the `IMAGES` binding).
- **ISR Caching**: Pages like the Home screen (which has `revalidate = 86400`) are cached in KV across all Cloudflare data centers.
- **Node.js Compatibility**: Enabled via `nodejs_compat` flag in `wrangler.jsonc`.

## Troubleshooting

- **KV Binding Error**: If the deploy fails with a KV binding error, ensure you've created the namespace and updated the `id` in `wrangler.jsonc`.
- **Image Errors**: Ensure your Cloudflare account has the "Image Resizing" feature enabled (included in most plans, including Free tier with limits).
