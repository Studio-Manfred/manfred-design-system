import { useEffect, useRef, useState } from "react";
import type { Scene, SourceImage } from "../lib/types";
import { computeLayout, drawScene } from "../lib/render";
import { loadImage } from "../lib/capture";

interface Props {
  image: SourceImage;
  scene: Scene;
}

/**
 * Live preview. Renders the scene into a canvas that is scaled to fit the
 * available stage area, at device-pixel resolution for crispness. Uses the same
 * `drawScene` the exporter uses, so what you see is what you save.
 */
export function CanvasStage({ image, scene }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | undefined>();
  const [box, setBox] = useState({ w: 0, h: 0 });

  // Decode the background image whenever its source changes.
  useEffect(() => {
    let cancelled = false;
    if (scene.background.kind === "image") {
      loadImage(scene.background.src)
        .then((img) => !cancelled && setBgImage(img))
        .catch(() => !cancelled && setBgImage(undefined));
    } else {
      setBgImage(undefined);
    }
    return () => {
      cancelled = true;
    };
  }, [scene.background]);

  // Track the available stage size.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setBox({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Draw whenever anything relevant changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || box.w === 0 || box.h === 0) return;

    const layout = computeLayout(image.width, image.height, scene);
    const dpr = window.devicePixelRatio || 1;
    // Fit the frame into the stage box, never upscaling past 1:1 CSS pixels.
    const fit = Math.min(box.w / layout.W, box.h / layout.H, 1);
    const cssW = layout.W * fit;
    const cssH = layout.H * fit;

    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawScene(ctx, image, scene, layout, { scale: fit * dpr, bgImage });
  }, [image, scene, bgImage, box]);

  return (
    <div ref={wrapRef} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <canvas ref={canvasRef} className="preview-canvas" />
    </div>
  );
}
