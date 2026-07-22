import { isTauri } from "./export";

export type CaptureMode = "interactive" | "window" | "fullscreen";

/**
 * Trigger a native macOS screen capture through the Tauri backend and return a
 * `data:` URL of the resulting PNG. Captures are taken WITHOUT the system window
 * shadow — the editor adds its own soft shadow, exactly like CleanShot — so the
 * frame stays clean and re-shadowable.
 *
 * - `interactive`: drag a region, or press Space to pick a window.
 * - `window`: pick a single window (Space-to-window is pre-armed).
 * - `fullscreen`: the whole display.
 *
 * Returns `null` if the user cancels the capture (Esc).
 */
export async function capture(mode: CaptureMode): Promise<string | null> {
  if (!isTauri()) {
    throw new Error(
      "Screen capture is only available in the desktop app. Run `npm run app` to launch the Tauri shell.",
    );
  }
  const { invoke } = await import("@tauri-apps/api/core");
  const base64 = await invoke<string | null>("capture_screen", { mode });
  if (!base64) return null;
  return `data:image/png;base64,${base64}`;
}

/** Load a data/blob/object URL into an HTMLImageElement, resolving once decoded. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to decode image"));
    img.src = src;
  });
}
