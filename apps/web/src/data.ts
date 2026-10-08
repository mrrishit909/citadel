import type { Gate, LogEntry } from "@citadel/schemas";
export type Data = { gates: Gate[]; log: LogEntry[] };
export const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export async function loadData(): Promise<Data> {
  const g = async <T,>(n: string) => (await fetch(`${base}/data/${n}.json`)).json() as Promise<T>;
  const [gates, log] = await Promise.all([g<Gate[]>("gates"), g<LogEntry[]>("log")]);
  return { gates, log };
}
