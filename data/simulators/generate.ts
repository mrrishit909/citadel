// Synthetic CITADEL gates and operator log. Deterministic. Not a real venue.
import { mkdirSync, writeFileSync } from "node:fs";
import type { Gate, LogEntry } from "../../packages/schemas/src/index.ts";

const gates: Gate[] = Array.from({ length: 8 }, (_, i) => ({ id: `gate-${i + 1}`, name: `Gate ${String.fromCharCode(65 + i)}`, angle: (i / 8) * Math.PI * 2, capacityPerMin: 80 + (i % 3) * 30 }));
const log: LogEntry[] = [
  { id: "log-1", stage: "doors-open", text: "Doors open. Concourse empty, staff in position." },
  { id: "log-2", stage: "arrival", text: "First arrivals at Gates A and E." },
  { id: "log-3", stage: "peak-ingress", text: "Peak ingress across all eight gates." },
  { id: "log-4", stage: "event", text: "Event underway; concourse traffic drops as seats fill." },
  { id: "log-5", stage: "intermission", text: "Intermission surge at concession gates." },
  { id: "log-6", stage: "egress", text: "Doors reopen for egress; flow reverses outward." },
  { id: "log-7", stage: "emergency", text: "Gate B closed. Flow rerouted evenly across the remaining seven." },
];
mkdirSync(new URL("../generated", import.meta.url), { recursive: true });
const out = (n: string, v: unknown) => writeFileSync(new URL(`../generated/${n}.json`, import.meta.url), JSON.stringify(v));
out("gates", gates); out("log", log);
console.log(`CITADEL seeded: ${gates.length} gates, ${log.length} log entries`);
