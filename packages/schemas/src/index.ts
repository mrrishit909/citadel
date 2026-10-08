// CITADEL: shared types + runtime validators.
export const STAGES = ["doors-open", "arrival", "peak-ingress", "event", "intermission", "egress", "emergency"] as const;
export type Stage = (typeof STAGES)[number];
export type Gate = { id: string; name: string; angle: number; capacityPerMin: number };
export type LogEntry = { id: string; stage: Stage; text: string };

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
export function validateGate(r: unknown): r is Gate {
  const o = r as Gate;
  return !!o && typeof o.id === "string" && [o.angle, o.capacityPerMin].every(isNum);
}
export function validateLogEntry(r: unknown): r is LogEntry {
  const o = r as LogEntry;
  return !!o && typeof o.id === "string" && STAGES.includes(o.stage) && typeof o.text === "string";
}
