import { computeLayout, drawScene } from "./render";
import type { Scene, SourceImage } from "./types";

/** True when running inside the Tauri shell rather than a plain browser. */
export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * Render the current scene to a detached canvas at the requested export scale
 * and return it as a PNG blob. `exportScale` of 2 yields retina-crisp output.
 */
export async function renderToBlob(
  img: SourceImage,
  scene: Scene,
  exportScale: number,
  bgImage?: HTMLImageElement,
): Promise<Blob> {
  const layout = computeLayout(img.width, img.height, scene);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(layout.W * exportScale);
  canvas.height = Math.round(layout.H * exportScale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not acquire a 2D canvas context");
  drawScene(ctx, img, scene, layout, { scale: exportScale, bgImage });

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob returned null"))),
      "image/png",
    );
  });
}

async function blobToBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

/**
 * Copy the rendered image to the system clipboard. Uses Tauri's clipboard
 * plugin when available (so paste-into-another-app works natively on macOS),
 * and falls back to the async Clipboard API in the browser.
 */
export async function copyToClipboard(blob: Blob): Promise<void> {
  if (isTauri()) {
    const { writeImage } = await import("@tauri-apps/plugin-clipboard-manager");
    // Tauri expects raw RGBA + dimensions; decode the PNG through an ImageData.
    const bitmap = await createImageBitmap(blob);
    const c = document.createElement("canvas");
    c.width = bitmap.width;
    c.height = bitmap.height;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);
    const data = ctx.getImageData(0, 0, c.width, c.height);
    await writeImage({ width: c.width, height: c.height, rgba: Array.from(data.data) } as never);
    return;
  }

  // Browser path: ClipboardItem with an image/png blob.
  if (navigator.clipboard && "write" in navigator.clipboard) {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return;
  }
  throw new Error("Clipboard image write is not supported in this environment");
}

/**
 * Save the rendered image to disk. In Tauri this opens a native save dialog and
 * writes the file; in the browser it triggers a download.
 */
export async function saveToFile(blob: Blob, suggestedName: string): Promise<string | null> {
  if (isTauri()) {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const { writeFile } = await import("@tauri-apps/plugin-fs");
    const path = await save({
      defaultPath: suggestedName,
      filters: [{ name: "PNG Image", extensions: ["png"] }],
    });
    if (!path) return null;
    await writeFile(path, await blobToBytes(blob));
    return path;
  }

  // Browser path: synthesize an anchor download.
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = suggestedName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return suggestedName;
}
