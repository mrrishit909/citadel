# QA report

Run on Apple M3 Pro, Chrome (stable), Playwright 1.63, WebGL through SwiftShader. Last full run: 19 e2e passed, 10 unit/API tests passed.

| Matrix row | Covered by | Result |
|---|---|---|
| Intro: first load, skip, reduced motion | demo walk, "reduced motion" test | pass |
| Input: click, keyboard | gate table, "keyboard-only" nav test (waits for HUD first, per blueprint 05's lesson) | pass |
| Input: range (timeline scrub) | "timeline scrub moves between stages", "out-of-range clamps natively" | pass |
| Input: empty/invalid | idempotent notes POST tested in `apps/api/test/api.test.ts` | pass |
| Gate closure reroutes flow | unit test: total flow after closure stays positive, the closed gate's own flow is exactly 0 | pass |
| Crowd renders differently across stages, not just the table | "crowd density actually renders differently across stages" (pixel-sample check) | pass |
| Responsive | 375 px: HUD and gate table visible | pass (one size) |
| Motion: reduced | static keyframe list, no GSAP timeline mounted | pass |
| Graphics: success | all WebGL e2e tests | pass |
| Graphics: failure | `?gfx=off` swaps to the poster with zero canvas elements | pass |
| Graphics: slow GPU | SwiftShader median frame 16.7 ms | pass as a bound |
| Visual regression | 7 stages against the poster fallback | pass |
| Performance | `tests/e2e/performance.spec.ts` | pass |

No `instanceColor` deadlock this time: the crowd's color-update loop called `setColorAt` in its matrix-setup effect from the start (the lesson from blueprint 03), confirmed by the pixel-sample test passing on the first run.
