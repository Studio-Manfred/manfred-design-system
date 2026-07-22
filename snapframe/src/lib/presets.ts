import type { Background, Scene } from "./types";

/** Curated gradient backgrounds, in the spirit of CleanShot's wallpaper picker. */
export const GRADIENTS: { name: string; bg: Background }[] = [
  { name: "Dusk", bg: { kind: "gradient", from: "#4568dc", to: "#b06ab3", angle: 135 } },
  { name: "Sunset", bg: { kind: "gradient", from: "#ff9966", to: "#ff5e62", angle: 135 } },
  { name: "Mint", bg: { kind: "gradient", from: "#43e97b", to: "#38f9d7", angle: 135 } },
  { name: "Ocean", bg: { kind: "gradient", from: "#2193b0", to: "#6dd5ed", angle: 135 } },
  { name: "Grape", bg: { kind: "gradient", from: "#7f00ff", to: "#e100ff", angle: 135 } },
  { name: "Peach", bg: { kind: "gradient", from: "#ffecd2", to: "#fcb69f", angle: 135 } },
  { name: "Slate", bg: { kind: "gradient", from: "#334155", to: "#0f172a", angle: 135 } },
  { name: "Coral", bg: { kind: "gradient", from: "#ff6a88", to: "#ff99ac", angle: 135 } },
  { name: "Aurora", bg: { kind: "gradient", from: "#00c6ff", to: "#0072ff", angle: 135 } },
  { name: "Ember", bg: { kind: "gradient", from: "#f83600", to: "#f9d423", angle: 135 } },
];

/** Flat solid backgrounds. */
export const SOLIDS: { name: string; bg: Background }[] = [
  { name: "Ink", bg: { kind: "solid", color: "#0f172a" } },
  { name: "Graphite", bg: { kind: "solid", color: "#1f2937" } },
  { name: "Paper", bg: { kind: "solid", color: "#f5f5f4" } },
  { name: "Sky", bg: { kind: "solid", color: "#e0f2fe" } },
  { name: "Blush", bg: { kind: "solid", color: "#ffe4e6" } },
  { name: "Sand", bg: { kind: "solid", color: "#fef3c7" } },
];

/** The default scene applied when a fresh screenshot is loaded. */
export const DEFAULT_SCENE: Scene = {
  background: GRADIENTS[0].bg,
  padding: 96,
  cornerRadius: 14,
  imageScale: 1,
  shadow: { blur: 60, y: 24, opacity: 0.35, color: "#000000" },
  balanceX: 0,
  balanceY: 0,
  aspect: "auto",
  innerBorder: true,
};
