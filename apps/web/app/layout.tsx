import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "CITADEL", description: "CITADEL: stadium crowd flow and evacuation intelligence platform. All data is synthetic." };
export const viewport: Viewport = { themeColor: "#101417", width: "device-width", initialScale: 1 };
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
