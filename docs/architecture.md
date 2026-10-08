# Architecture

```
model/build.py ──Blender──> source.blend + exports/{gate,human-glyph}.glb + renders/poster.png
model/validate.py ─fresh-scene re-import─> exports/validation.json
data/simulators/generate.ts ──> data/generated/{gates,log}.json (seeded, synthetic)
        │                              │
scripts/copy-assets.ts ──────────> apps/web/public/{data,models,posters}
                                       │
apps/web (Next.js 16 static export) ───┘      apps/api (node:http + ws) serves the same JSON on the book's /v1 contract
   App ─ store (external, useSyncExternalStore) ─ Panels (all DOM) + Scene (R3F canvas) + Intro (GSAP)
packages/domain: crowd (stage ladder, gate flow with reroute-on-closure, radial density field) - pure, tested
packages/schemas: shared types + runtime validators
```

**Scroll advances event time**, not page position. `state.t` (0..6, one unit per stage: doors-open, arrival, peak-ingress, event, intermission, egress, emergency) drives `gateFlowAt` and `densityAt`, which both the gate table and the 3D crowd read, so the numbers and the glyphs never disagree.

**The reroute.** At the emergency stage, `gate-1` closes; its full flow is split evenly across the seven open gates (`gateFlowAt`'s `redistributed` term), not dropped. This is a deliberately simple model, not a real pathfinding/navmesh solver; `docs/architecture.md`'s "not built" section names the real version.

**Macro/local scale.** At any zoom the crowd is the same 320-instance mesh; local density scales each instance from near-zero up to full size and tints it brighter, so from a distance it reads as a flow-field gradient and up close as individual figures, satisfying the book's "flow fields at macro scale, individuals at local scale" requirement without a LOD swap.

**WebGPU.** Ships WebGL2, same reasoning as the rest of the volume.

**Stack substitutions.** The book names a navmesh/pathfinding library, agent-based simulation, deck.gl and PostGIS. None are used: the crowd is a closed-form density field, not an agent simulation, and there is no map/geo layer since the venue is a single synthetic concourse, not real-world geography.

**Budgets** (asserted in `tests/e2e/performance.spec.ts`): gate GLB < 20 KB, human-glyph GLB < 15 KB, gzipped JS < 750 KB, draw calls < 40, triangles < 30,000.

**Not built.** A real navmesh/pathfinding solver, agent-based crowd simulation, deck.gl/PostGIS, auth.
