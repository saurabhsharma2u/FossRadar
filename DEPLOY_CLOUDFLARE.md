# Deploying FossRadar to Cloudflare Workers

FossRadar has been migrated to **vinext**, enabling native deployment to Cloudflare Workers via GitHub auto-sync.

## Local Development

To run the app locally:

```bash
npm run dev
```

## GitHub Auto-Sync Setup

If you have already linked your GitHub repository to a Cloudflare Worker, Cloudflare will automatically build and deploy new versions when you push to the `main` branch.

### Recommended Build Settings

In your Cloudflare Dashboard (Workers & Pages > your-worker > Settings > Builds):

- **Build Command**: `npm run build`
- **Output Directory**: `dist/client`
- **Compatibility Flag**: `nodejs_compat` (This is already in `wrangler.jsonc`)

## KV Namespace for Caching (ISR)

This app uses Cloudflare KV for edge caching.

1.  Create a KV namespace:
    ```bash
    npx wrangler kv namespace create VINEXT_CACHE
    ```
2.  Add the generated ID to the `kv_namespaces` section in your `wrangler.jsonc` file:

    ```json
    "kv_namespaces": [
      {
        "binding": "VINEXT_CACHE",
        "id": "YOUR_KV_NAMESPACE_ID"
      }
    ]
    ```

## Features

- **X (Twitter) Integration**: Open Graph images automatically include the `X /FossRadar` handle.
- **Image Optimization**: Powered by Cloudflare's Image Transformation.
- **ISR**: Pages are cached globally on the Cloudflare edge.
