# amir04lm26.github.io

Personal site of Amir Zare. Static, built with [Astro](https://astro.build), no UI framework.

```sh
npm install
npm run dev      # local dev server
npm run build    # static output in dist/
```

- Content lives in `src/data/site.ts`. Edit text there, not in the page.
- `src/data/github.ts` reads the public repositories at build time. `github-fallback.json` is the offline snapshot.
- Motion lives in `src/scripts/motion.ts` and `src/styles/global.css`. Every effect is off under `prefers-reduced-motion`.
- A push to `main` deploys to GitHub Pages (`.github/workflows/deploy.yml`). A weekly run refreshes the repository list.
