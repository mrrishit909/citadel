// Copies the generated data and the validated GLBs + poster into the web app's public folder.
import { cpSync, mkdirSync } from "node:fs";
const root = new URL("../", import.meta.url).pathname, pub = root + "apps/web/public/";
mkdirSync(pub + "data", { recursive: true }); mkdirSync(pub + "models", { recursive: true }); mkdirSync(pub + "posters", { recursive: true });
cpSync(root + "data/generated", pub + "data", { recursive: true });
cpSync(root + "model/exports/gate.glb", pub + "models/gate.glb");
cpSync(root + "model/exports/human-glyph.glb", pub + "models/human-glyph.glb");
cpSync(root + "model/renders/poster.png", pub + "posters/gate.png");
console.log("assets copied");
