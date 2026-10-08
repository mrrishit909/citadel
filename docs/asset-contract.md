# Asset contract

## gate.glb
Root empty `Gate`. `Post` (x2), `Lintel`, `Signage` share one pivot. Placed once per gate (8 instances via `<primitive>`, not `InstancedMesh`, since each needs an independently recolorable `Signage` child found by name via `traverse`). `Signage`'s material color is driven per-gate between Safety Lime (open) and Emergency Red (closed).

## human-glyph.glb
Root empty `HumanGlyph`. `GlyphBody`, `GlyphHead` share one pivot. The browser instances `GlyphBody`'s geometry alone (320 instances, one draw call) scattered around the concourse ring; per-instance scale is driven to near-zero when that position's local crowd density is below a per-instance threshold, which reads as people appearing/thinning rather than a hard visibility toggle. Per-instance color encodes local density (darker steel at low density, brighter white at high density).

Both assets are procedural primitive composition from `model/build.py`. Color is wired via `setColorAt` inside the matrix-setup effect, not gated behind an `instanceColor` null-check in the per-frame loop (see blueprint 03's note on the `InstancedMesh.instanceColor` deadlock).
