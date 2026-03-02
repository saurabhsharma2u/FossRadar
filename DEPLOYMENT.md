# Deploying FossRadar to Vercel

FossRadar is optimized for Vercel using **Next.js App Router** with **Static Site Generation (SSG)**.

## 1. Vercel Configuration (Important!)

Because the project root contains the main `package.json` but the Next.js app is located in the `web/` subdirectory, use these settings:

1. **Framework Preset:** `Next.js`
2. **Root Directory:** Keep this as **`.` (Root)** (or the default). 
3. **Build Command:** `npm run build`
4. **Output Directory:** `web/.next` (This is the fix for the routes-manifest error)
5. **Install Command:** `npm install`

## 2. Environment Variables
Add the following in the Vercel dashboard:
- **`GH_TOKEN`**: Your GitHub Personal Access Token (classic) with `public_repo` scope.

## 3. Automation (GitHub Actions)
To keep your radar metadata updated, create `.github/workflows/refresh.yml`:

```yaml
name: Refresh Radar Data
on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:
jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm install
      - run: npm run refresh:metadata
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: refresh radar metadata"
```
