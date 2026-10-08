# Performance report

Hardware: Apple M3 Pro laptop, Chrome stable, **software WebGL (SwiftShader)**, 1280 x 800. Command: `node scripts/measure.mjs` after `npm run build` and `node scripts/serve.ts`.

| Measure | Value | Budget |
|---|---|---|
| Transfer (18 requests, uncompressed local server) | 980 KB | n/a |
| JS gzipped (all chunks) | 565 KB | 750 KB |
| gate GLB / human-glyph GLB | 9.6 KB / 7.6 KB | 20 / 15 KB |
| Draw calls / triangles / geometries | 34 / 12,416 / 6 | 40 / 30,000 |
| LCP | 3.1 s | none set |
| CLS | 0 | 0.1 |
| Long-task total during load | 2.2 s | none set |
| Median / p95 frame time | 16.7 / 16.7 ms (60 fps, software) | none set |

Draw calls sit at 34 (8 gate primitives, 1 crowd instanced mesh, 1 concourse ring, plus lights/overhead) rather than lower, since the gates are not instanced (each needs an independently colorable signage material); the crowd itself is one draw call for all 320 glyphs.

Degradation: frame loop pauses when the tab is hidden; `?gfx=off` and WebGL context loss swap to the poster; reduced motion removes the intro timeline and snaps the camera instead of lerping.
