import type { Background, Layout, Scene, SourceImage } from "./types";

/** Parse an aspect string like "16:9" into a numeric ratio (w / h). */
function aspectRatio(aspect: Scene["aspect"]): number | null {
  if (aspect === "auto") return null;
  const [w, h] = aspect.split(":").map(Number);
  return w / h;
}

/**
 * Compute where the screenshot sits inside the output frame, given the source
 * dimensions and the current scene. Pure — no canvas involved — so it can be
 * reused for hit-testing, export sizing, and preview alike.
 */
export function computeLayout(imgW: number, imgH: number, s: Scene): Layout {
  const w = imgW * s.imageScale;
  const h = imgH * s.imageScale;
  const pad = s.padding;

  const contentW = w + pad * 2;
  const contentH = h + pad * 2;

  let W = contentW;
  let H = contentH;

  const ar = aspectRatio(s.aspect);
  if (ar !== null) {
    // Grow the frame to the requested aspect while still containing the padded image.
    if (contentW / contentH > ar) {
      W = contentW;
      H = contentW / ar;
    } else {
      H = contentH;
      W = contentH * ar;
    }
  }

  // Center, then bias by the balance controls into the available free space.
  const freeX = Math.max(0, W - w - pad * 2);
  const freeY = Math.max(0, H - h - pad * 2);
  const x = pad + freeX / 2 + (s.balanceX * freeX) / 2;
  const y = pad + freeY / 2 + (s.balanceY * freeY) / 2;

  return { W, H, x, y, w, h };
}

/** Trace a rounded rectangle path (radius is clamped to half the smaller side). */
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function withAlpha(color: string, alpha: number): string {
  // Accept #rgb / #rrggbb and produce an rgba() string.
  const hex = color.replace("#", "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Paint the background layer across the whole frame. */
function drawBackground(
  ctx: CanvasRenderingContext2D,
  bg: Background,
  W: number,
  H: number,
  bgImage?: HTMLImageElement,
): void {
  switch (bg.kind) {
    case "transparent":
      return; // leave the canvas clear
    case "solid":
      ctx.fillStyle = bg.color;
      ctx.fillRect(0, 0, W, H);
      return;
    case "gradient": {
      const rad = (bg.angle * Math.PI) / 180;
      // Project the gradient line across the frame at the requested angle.
      const cx = W / 2;
      const cy = H / 2;
      const len = (Math.abs(W * Math.cos(rad)) + Math.abs(H * Math.sin(rad))) / 2;
      const dx = Math.cos(rad) * len;
      const dy = Math.sin(rad) * len;
      const grad = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
      grad.addColorStop(0, bg.from);
      grad.addColorStop(1, bg.to);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      return;
    }
    case "image": {
      if (!bgImage) {
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, W, H);
        return;
      }
      const iw = bgImage.naturalWidth;
      const ih = bgImage.naturalHeight;
      const scale =
        bg.fit === "cover"
          ? Math.max(W / iw, H / ih)
          : Math.min(W / iw, H / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(bgImage, (W - dw) / 2, (H - dh) / 2, dw, dh);
      return;
    }
  }
}

export interface DrawOptions {
  /** Multiplier applied to the whole scene (display fit or export resolution). */
  scale: number;
  /** Optional decoded background image for `kind: "image"` backgrounds. */
  bgImage?: HTMLImageElement;
}

/**
 * Render one full frame — background, soft shadow, rounded screenshot — into
 * `ctx`. The context is expected to be sized to `layout.W * scale` by
 * `layout.H * scale`. Because the entire scene is drawn under a single
 * `ctx.scale()`, the preview and the export are pixel-for-pixel identical.
 */
export function drawScene(
  ctx: CanvasRenderingContext2D,
  img: SourceImage,
  scene: Scene,
  layout: Layout,
  opts: DrawOptions,
): void {
  const { scale, bgImage } = opts;
  const { W, H, x, y, w, h } = layout;

  ctx.save();
  ctx.clearRect(0, 0, W * scale, H * scale);
  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  drawBackground(ctx, scene.background, W, H, bgImage);

  // Cast the shadow by filling the rounded silhouette first, then drawing the
  // image clipped to the same shape on top (so the blur only reads outside it).
  if (scene.shadow.opacity > 0 && scene.shadow.blur >= 0) {
    ctx.save();
    ctx.shadowColor = withAlpha(scene.shadow.color, scene.shadow.opacity);
    ctx.shadowBlur = scene.shadow.blur;
    ctx.shadowOffsetY = scene.shadow.y;
    roundRectPath(ctx, x, y, w, h, scene.cornerRadius);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  roundRectPath(ctx, x, y, w, h, scene.cornerRadius);
  ctx.clip();
  ctx.drawImage(img.el, x, y, w, h);
  ctx.restore();

  if (scene.innerBorder) {
    ctx.save();
    roundRectPath(ctx, x + 0.5, y + 0.5, w - 1, h - 1, scene.cornerRadius);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}
