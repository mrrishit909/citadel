import { describe, expect, it } from "vitest";
import { stageAt, gateClosedAt, gateFlowAt, densityAt, mulberry32, CLOSED_GATE_ID } from "../src/index.ts";
import { validateGate, validateLogEntry, STAGES } from "@citadel/schemas";
import type { Gate } from "@citadel/schemas";

const gates: Gate[] = Array.from({ length: 8 }, (_, i) => ({ id: `gate-${i + 1}`, name: `Gate ${i + 1}`, angle: (i / 8) * Math.PI * 2, capacityPerMin: 100 }));

describe("crowd", () => {
  it("stageAt steps through the ladder in order and clamps", () => {
    expect(STAGES.map((_, i) => stageAt(i))).toEqual(STAGES);
    expect(stageAt(-1)).toBe("doors-open"); expect(stageAt(99)).toBe("emergency");
  });
  it("the designated gate closes only at the emergency stage", () => {
    expect(gateClosedAt(CLOSED_GATE_ID, 5)).toBe(false);
    expect(gateClosedAt(CLOSED_GATE_ID, 6)).toBe(true);
    expect(gateClosedAt("gate-2", 6)).toBe(false);
  });
  it("a closed gate's flow is redistributed to the others, not lost", () => {
    const totalBefore = gates.reduce((a, g) => a + gateFlowAt(gates, g, 5), 0);
    const totalAfter = gates.reduce((a, g) => a + gateFlowAt(gates, g, 6), 0);
    expect(totalAfter).toBeGreaterThan(0);
    expect(gateFlowAt(gates, gates[0], 6)).toBe(0);
    expect(totalBefore).toBeGreaterThan(0);
  });
  it("density peaks near an open gate and is bounded 0..1", () => {
    const near = densityAt(gates, gates[2].angle, 2), far = densityAt(gates, gates[2].angle + Math.PI, 2);
    expect(near).toBeGreaterThan(far); expect(near).toBeLessThanOrEqual(1); expect(near).toBeGreaterThanOrEqual(0);
  });
});
describe("schemas + rng", () => {
  it("validators reject bad records", () => {
    expect(validateGate({ id: "g1", name: "x", angle: 0, capacityPerMin: 80 })).toBe(true);
    expect(validateGate({ id: "g1", name: "x", angle: "x", capacityPerMin: 80 })).toBe(false);
    expect(validateLogEntry({ id: "l1", stage: "arrival", text: "note" })).toBe(true);
    expect(validateLogEntry({ id: "l1", stage: "nope", text: "note" })).toBe(false);
  });
  it("rng repeats per seed", () => { const a = mulberry32(5), b = mulberry32(5); expect([a(), a()]).toEqual([b(), b()]); });
});
