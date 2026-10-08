# CITADEL

Stadium/large-venue crowd flow and evacuation intelligence platform (blueprint 06, Advanced Engineering Build Book Vol. VIII). Architectural wayfinding under pressure. The public site is static; the Blender asset is scripted.

- Build the asset: `npm run model` (needs Blender 4.5 at ~/Applications). Then `node scripts/copy-assets.ts`.
- Data: `npm run seed` (deterministic, synthetic). Tests: `npm test` (domain + API), `npm run e2e` after `npm run build`.
- Scroll advances event time: doors-open, arrival, peak-ingress, event, intermission, egress, emergency.
- Multi-agent is the DEVELOPMENT process (see .claude/agents); the product contains no agents.
- Everything in the UI is a synthetic crowd model. Do not present it as a real safety analysis.
