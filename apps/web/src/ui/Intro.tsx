"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { live, set, state, useStore } from "../store";

// Steps follow blueprint section 2: 0 one person, 1 crowd appears, 2 camera rises, 3 exit closes, 4 reroute, 5 follow one person, 6 exit expands to interface.
export default function Intro({ onDone }: { onDone: () => void }) {
  const s = useStore();
  const [caption, setCaption] = useState("");
  const mask = useRef<HTMLDivElement>(null), root = useRef<HTMLDivElement>(null), tl = useRef<gsap.core.Timeline | null>(null);

  const finish = (instant: boolean) => {
    tl.current?.kill(); document.documentElement.style.setProperty("--mask", "200%"); live.rise = 1;
    set({ introDone: true, introStep: 99, t: 2 });
    if (instant && root.current) root.current.style.display = "none";
    onDone();
  };

  useEffect(() => {
    if (s.reduced) return;
    gsap.ticker.lagSmoothing(0);
    const t = gsap.timeline({ defaults: { ease: "power1.inOut" }, onComplete: () => finish(false) });
    tl.current = t;
    const rise = { v: 0 }, clock = { v: 0 };
    t.call(() => { set({ introStep: 0, t: 0 }); setCaption("One person in an empty concourse."); }, [], 0)
      .call(() => { set({ introStep: 1 }); setCaption("Ten. Hundreds. Thousands."); }, [], 1.8)
      .to(clock, { v: 2, duration: 3, onUpdate: () => set({ t: clock.v }) }, 1.8)
      .call(() => { set({ introStep: 2 }); setCaption("The camera rises; crowd patterns become visible."); }, [], 5)
      .to(rise, { v: 1, duration: 3.4, onUpdate: () => { live.rise = rise.v; } }, 5)
      .call(() => { set({ introStep: 3 }); setCaption("One exit closes. The flow compresses."); }, [], 8.6)
      .to(clock, { v: 6, duration: 3, onUpdate: () => set({ t: clock.v }) }, 8.6)
      .call(() => { set({ introStep: 4 }); setCaption("Routes reroute in real time."); }, [], 11.8)
      .call(() => { set({ introStep: 5 }); setCaption("Follow one person through the crowd."); }, [], 13.2)
      .call(() => { set({ introStep: 6, t: 2 }); setCaption(""); }, [], 15)
      .to({ v: 0 }, { v: 160, duration: 1.8, ease: "power2.inOut", onUpdate: function () { document.documentElement.style.setProperty("--mask", `${this.targets()[0].v}%`); } }, 15);
    return () => { t.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.reduced]);

  if (s.introDone && !s.reduced) return null;
  if (s.reduced) {
    const frames = [["Empty concourse", "One person; then ten, hundreds, thousands as the camera rises."], ["Emergency", "One exit closes; the flow reroutes in real time across the remaining gates."], ["Floor plan", "Following one person through the crowd, the exit expands into the operational floor plan."]];
    return (
      <div className="intro intro-static" ref={root} role="dialog" aria-label="Opening story" data-testid="intro">
        <ol>{frames.map(([d, c], i) => <li key={i}><b>{d}</b> {c}</li>)}</ol>
        <button className="btn primary" onClick={() => finish(true)} data-testid="skip-intro">Enter the floor plan</button>
      </div>
    );
  }
  return (
    <div className="intro" ref={root} data-testid="intro" data-step={s.introStep}>
      <div className="intro-dark" style={{ opacity: s.introStep === 0 ? 1 : 0 }} />
      <p className="caption" role="status">{caption}</p>
      <button className="btn skip" onClick={() => { const t = tl.current; if (t && t.time() < 15) { live.rise = 1; set({ t: 2 }); t.seek(15); } else finish(false); }} data-testid="skip-intro" autoFocus>Skip intro</button>
      <div className="light-mask" ref={mask} aria-hidden />
    </div>
  );
}
