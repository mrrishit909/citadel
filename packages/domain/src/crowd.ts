// CITADEL: a deterministic synthetic crowd-flow model. Not a real safety/evacuation analysis.
import { STAGES, type Gate, type Stage } from "@citadel/schemas";

const LEVEL: Record<Stage, number> = { "doors-open": 0.05, arrival: 0.35, "peak-ingress": 0.9, event: 0.5, intermission: 0.7, egress: 0.85, emergency: 0.95 };
export function stageAt(t: number): Stage {
  return STAGES[Math.max(0, Math.min(STAGES.length - 1, Math.round(t)))];
}
export function stageProgress(t: number): number {
  return Math.max(0, Math.min(1, t - Math.floor(t)));
}
/** The one gate that closes once the emergency stage begins. */
export const CLOSED_GATE_ID = "gate-1";
export function gateClosedAt(gateId: string, t: number): boolean {
  return gateId === CLOSED_GATE_ID && t >= 6;
}
/** People/min through a gate at time t: base capacity scaled by the stage's overall level; a closed gate carries nothing and its flow is redistributed evenly to the others. */
export function gateFlowAt(gates: Gate[], gate: Gate, t: number): number {
  const level = LEVEL[stageAt(t)];
  if (gateClosedAt(gate.id, t)) return 0;
  const open = gates.filter((g) => !gateClosedAt(g.id, t));
  const closedGate = gates.find((g) => gateClosedAt(g.id, t));
  const redistributed = closedGate ? (closedGate.capacityPerMin * level) / open.length : 0;
  return gate.capacityPerMin * level + redistributed;
}
/** Crowd density (0..1) at an angle around the concourse ring: a sum of gaussian bumps at each open gate, scaled by its current flow, plus a smaller baseline. */
export function densityAt(gates: Gate[], angle: number, t: number): number {
  let d = 0.04;
  const maxFlow = Math.max(...gates.map((g) => g.capacityPerMin));
  for (const g of gates) {
    const flow = gateFlowAt(gates, g, t);
    let da = Math.abs(angle - g.angle) % (Math.PI * 2);
    if (da > Math.PI) da = Math.PI * 2 - da;
    d += (flow / (maxFlow * 1.6)) * Math.exp(-(da * da) / 0.35);
  }
  return Math.min(1, d);
}
