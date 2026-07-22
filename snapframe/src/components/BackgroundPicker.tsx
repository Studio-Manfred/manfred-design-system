import React, { useRef } from "react";
import type { Background } from "../lib/types";
import { GRADIENTS, SOLIDS } from "../lib/presets";

/** CSS representation of a background, used only for the swatch previews. */
export function backgroundToCss(bg: Background): React.CSSProperties {
  switch (bg.kind) {
    case "solid":
      return { background: bg.color };
    case "gradient":
      return { background: `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})` };
    case "image":
      return { backgroundImage: `url(${bg.src})`, backgroundSize: "cover" };
    case "transparent":
      return {};
  }
}

function sameBg(a: Background, b: Background): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

interface Props {
  value: Background;
  onChange: (bg: Background) => void;
}

export function BackgroundPicker({ value, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      onChange({ kind: "image", src: String(reader.result), fit: "cover" });
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  const isCustomGradient =
    value.kind === "gradient" && !GRADIENTS.some((g) => sameBg(g.bg, value));

  return (
    <div className="section">
      <h3>Background</h3>

      <div className="field">
        <div className="field-label">
          <span>Gradients</span>
        </div>
        <div className="swatches">
          {GRADIENTS.map((g) => (
            <button
              key={g.name}
              title={g.name}
              type="button"
              className={`swatch ${sameBg(g.bg, value) ? "active" : ""}`}
              style={backgroundToCss(g.bg)}
              onClick={() => onChange(g.bg)}
            />
          ))}
        </div>
      </div>

      <div className="field">
        <div className="field-label">
          <span>Solids</span>
        </div>
        <div className="swatches">
          {SOLIDS.map((s) => (
            <button
              key={s.name}
              title={s.name}
              type="button"
              className={`swatch ${sameBg(s.bg, value) ? "active" : ""}`}
              style={backgroundToCss(s.bg)}
              onClick={() => onChange(s.bg)}
            />
          ))}
          <button
            title="Transparent"
            type="button"
            className={`swatch ${value.kind === "transparent" ? "active" : ""}`}
            onClick={() => onChange({ kind: "transparent" })}
          >
            <span className="none" />
          </button>
        </div>
      </div>

      <div className="field">
        <div className="field-label">
          <span>Custom gradient</span>
        </div>
        <div className="row">
          <input
            className="color-input"
            type="color"
            value={value.kind === "gradient" ? value.from : "#4568dc"}
            onChange={(e) =>
              onChange({
                kind: "gradient",
                from: e.target.value,
                to: value.kind === "gradient" ? value.to : "#b06ab3",
                angle: value.kind === "gradient" ? value.angle : 135,
              })
            }
          />
          <input
            className="color-input"
            type="color"
            value={value.kind === "gradient" ? value.to : "#b06ab3"}
            onChange={(e) =>
              onChange({
                kind: "gradient",
                from: value.kind === "gradient" ? value.from : "#4568dc",
                to: e.target.value,
                angle: value.kind === "gradient" ? value.angle : 135,
              })
            }
          />
          {isCustomGradient && value.kind === "gradient" && (
            <input
              type="range"
              min={0}
              max={360}
              value={value.angle}
              onChange={(e) => onChange({ ...value, angle: Number(e.target.value) })}
            />
          )}
        </div>
      </div>

      <div className="field">
        <button
          type="button"
          className="btn"
          style={{ width: "100%", justifyContent: "center" }}
          onClick={() => fileRef.current?.click()}
        >
          <span className="icon">🖼️</span> Upload wallpaper
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={onUpload}
        />
      </div>
    </div>
  );
}
