import { useSyncExternalStore } from "react";
import { STAGES, type Stage } from "@citadel/schemas";
export { STAGES };
export type State = { t: number; selGate: string | null; selLog: string | null; playing: boolean; speed: number; introDone: boolean; introStep: number; reduced: boolean; pauseMotion: boolean; gfx: "webgl" | "poster" };
export const state: State = { t: 0, selGate: null, selLog: null, playing: false, speed: 1, introDone: false, introStep: 0, reduced: false, pauseMotion: false, gfx: "webgl" };
export const live = { rise: 0 };
let snap = { ...state };
const subs = new Set<() => void>();
export function set(p: Partial<State>) { Object.assign(state, p); snap = { ...state }; subs.forEach((f) => f()); }
export const useStore = () => useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => snap, () => snap);
export const stageIndex = (s: Stage) => STAGES.indexOf(s);
