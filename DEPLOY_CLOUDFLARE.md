# Deploying FossRadar to Cloudflare Pages

FossRadar is now built with **Astro** as a fully static site. This provides the best possible performance and SEO while being completely free to host on Cloudflare Pages.

## Local Development

To run the app locally:

```bash
npm run dev
```

## Cloudflare Pages Setup

1.  Push your code to GitHub.
2.  Go to the **Cloudflare Dashboard** > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3.  Select the `FossRadar` repository.
4.  Use these **Build Settings**:
    - **Framework preset**: `Astro`
    - **Build command**: `npm run build`
    - **Build output directory**: `dist`
5.  Click **Save and Deploy**.

## Why this is better:
- **Zero Configuration**: No `wrangler.toml` or KV bindings needed.
- **Instant Loads**: Pure HTML is served directly from Cloudflare's global edge network.
- **Infinite Scalability**: Static files can handle any amount of traffic with zero latency.
- **Great SEO**: Every repository page is pre-rendered at build time.
