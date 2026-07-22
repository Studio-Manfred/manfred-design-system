/**
 * The full editor scene model. Everything here is serializable so a scene can be
 * saved as a preset or restored. All spatial values are expressed in "scene units",
 * where 1 unit == 1 pixel of the source screenshot at scale 1. Rendering multiplies
 * these by a display or export scale, so the model itself is resolution-independent.
 */

export type Background =
  | { kind: "solid"; color: string }
  | { kind: "gradient"; from: string; to: string; angle: number }
  | { kind: "image"; src: string; fit: "cover" | "contain" }
  | { kind: "transparent" };

export interface Shadow {
  /** Blur radius in scene units. */
  blur: number;
  /** Vertical offset in scene units. */
  y: number;
  /** 0..1 alpha of the shadow. */
  opacity: number;
  /** Base shadow color (alpha is applied separately via opacity). */
  color: string;
}

export type Aspect = "auto" | "16:9" | "4:3" | "3:2" | "1:1" | "9:16";

export interface Scene {
  background: Background;
  /** Padding between the image and the frame edge, in scene units. */
  padding: number;
  /** Corner radius applied to the screenshot, in scene units. */
  cornerRadius: number;
  /** Uniform scale of the screenshot within the frame (0.3..1). */
  imageScale: number;
  shadow: Shadow;
  /** Horizontal image offset within the free space, -1..1. */
  balanceX: number;
  /** Vertical image offset within the free space, -1..1. */
  balanceY: number;
  aspect: Aspect;
  /** Subtle 1px inner highlight ring on the screenshot, à la CleanShot. */
  innerBorder: boolean;
}

/** A loaded screenshot plus its natural dimensions. */
export interface SourceImage {
  el: HTMLImageElement;
  width: number;
  height: number;
}

/** Computed placement of the screenshot within the output frame. */
export interface Layout {
  /** Frame (output canvas) width in scene units. */
  W: number;
  /** Frame (output canvas) height in scene units. */
  H: number;
  /** Image x/y/w/h within the frame, in scene units. */
  x: number;
  y: number;
  w: number;
  h: number;
}
