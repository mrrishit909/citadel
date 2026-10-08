"use client";
import { useEffect, useMemo, useRef } from "react";
import { gateClosedAt, gateFlowAt } from "@citadel/domain";
import type { Data } from "../data";
import { set, state, STAGES, stageIndex, useStore } from "../store";

const LABELS: Record<string, string> = { "doors-open": "Doors Open", arrival: "Arrival", "peak-ingress": "Peak Ingress", event: "Event", intermission: "Intermission", egress: "Egress", emergency: "Emergency" };
const go = (t: number) => set({ t, playing: false });

function Gates({ data }: { data: Data }) {
  const s = useStore(), rows = useMemo(() => data.gates.map((g) => ({ g, flow: gateFlowAt(data.gates, g, s.t), closed: gateClosedAt(g.id, s.t) })), [data, s.t]);
  return (
    <section aria-labelledby="h-gates"><h2 id="h-gates">Gates</h2>
      <table className="obs" data-testid="gate-table"><thead><tr><th>Gate</th><th>Flow</th><th>Status</th></tr></thead>
        <tbody>{rows.map(({ g, flow, closed }) => <tr key={g.id} className={closed ? "on" : ""}><td>{g.name}</td><td data-testid={`flow-${g.id}`}>{flow.toFixed(0)}/min</td><td>{closed ? "CLOSED" : "open"}</td></tr>)}</tbody></table>
    </section>
  );
}

function Logbook({ data }: { data: Data }) {
  const s = useStore(), sel = data.log.find((l) => l.id === s.selLog);
  return (
    <section aria-labelledby="h-log"><h2 id="h-log">Operations Log</h2>
      <ul>{data.log.map((l) => <li key={l.id}><button className={`row ${l.id === s.selLog ? "on" : ""}`} onClick={() => set({ selLog: l.id })} data-testid={`log-${l.id}`}>{l.text}</button></li>)}</ul>
      {sel && <aside className="note" data-testid="log-detail"><p>{sel.text}</p></aside>}
    </section>
  );
}

export default function Panels({ data }: { data: Data }) {
  const s = useStore(), stage = STAGES[Math.round(s.t)];
  const lock = useRef(0);
  useEffect(() => {
    const onWheel = (e: WheelEvent) => { if ((e.target as Element).closest(".panel,.rail,.intro")) return; const n = performance.now(); if (n - lock.current < 700 || Math.abs(e.deltaY) < 20 || !state.introDone) return; lock.current = n; const i = stageIndex(STAGES[Math.round(state.t)]) + (e.deltaY > 0 ? 1 : -1); if (STAGES[i]) go(i); };
    addEventListener("wheel", onWheel, { passive: true }); return () => removeEventListener("wheel", onWheel);
  }, []);
  return (
    <div className="hud" data-testid="hud">
      <header className="top"><span className="brand">CITADEL</span><span className="gauge" data-testid="gauge">{LABELS[stage]}</span>
        <button className="btn ghost" aria-pressed={s.pauseMotion} onClick={() => set({ pauseMotion: !s.pauseMotion })} data-testid="pause-motion">{s.pauseMotion ? "Resume motion" : "Pause motion"}</button></header>
      <nav className="rail" aria-label="Event timeline">{STAGES.map((st, i) => <button key={st} className={st === stage ? "on" : ""} aria-current={st === stage ? "page" : undefined} onClick={() => go(i)} data-testid={`nav-${st}`}><b>{LABELS[st]}</b></button>)}</nav>
      <main className="panel" key={stage} tabIndex={-1}>
        <label className="scrub">Timeline <input type="range" min={0} max={6} step={0.05} value={s.t} onChange={(e) => go(Number(e.target.value))} aria-valuetext={LABELS[stage]} data-testid="timeline-scrub" /><output>{LABELS[stage]}</output></label>
        <Gates data={data} />
        <Logbook data={data} />
      </main>
    </div>
  );
}
