import type { Aspect, Scene } from "../lib/types";
import { Segmented, Slider, Toggle } from "./Controls";
import { BackgroundPicker } from "./BackgroundPicker";

interface Props {
  scene: Scene;
  onChange: (patch: Partial<Scene>) => void;
}

const ASPECTS: { value: Aspect; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "16:9", label: "16:9" },
  { value: "4:3", label: "4:3" },
  { value: "1:1", label: "1:1" },
  { value: "9:16", label: "9:16" },
];

export function Sidebar({ scene, onChange }: Props) {
  return (
    <aside className="sidebar">
      <BackgroundPicker
        value={scene.background}
        onChange={(background) => onChange({ background })}
      />

      <div className="section">
        <h3>Frame</h3>
        <Slider
          label="Padding"
          value={scene.padding}
          min={0}
          max={400}
          suffix="px"
          onChange={(padding) => onChange({ padding })}
        />
        <Slider
          label="Corner radius"
          value={scene.cornerRadius}
          min={0}
          max={80}
          suffix="px"
          onChange={(cornerRadius) => onChange({ cornerRadius })}
        />
        <Slider
          label="Image size"
          value={scene.imageScale}
          min={0.3}
          max={1}
          step={0.01}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(imageScale) => onChange({ imageScale })}
        />
        <div className="field">
          <div className="field-label">
            <span>Aspect ratio</span>
          </div>
          <Segmented
            options={ASPECTS}
            value={scene.aspect}
            onChange={(aspect) => onChange({ aspect })}
          />
        </div>
        <Toggle
          label="Inner highlight"
          checked={scene.innerBorder}
          onChange={(innerBorder) => onChange({ innerBorder })}
        />
      </div>

      <div className="section">
        <h3>Shadow</h3>
        <Slider
          label="Blur"
          value={scene.shadow.blur}
          min={0}
          max={200}
          suffix="px"
          onChange={(blur) => onChange({ shadow: { ...scene.shadow, blur } })}
        />
        <Slider
          label="Offset Y"
          value={scene.shadow.y}
          min={0}
          max={120}
          suffix="px"
          onChange={(y) => onChange({ shadow: { ...scene.shadow, y } })}
        />
        <Slider
          label="Opacity"
          value={scene.shadow.opacity}
          min={0}
          max={1}
          step={0.01}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(opacity) => onChange({ shadow: { ...scene.shadow, opacity } })}
        />
      </div>

      <div className="section">
        <h3>Position</h3>
        <Slider
          label="Horizontal"
          value={scene.balanceX}
          min={-1}
          max={1}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={(balanceX) => onChange({ balanceX })}
        />
        <Slider
          label="Vertical"
          value={scene.balanceY}
          min={-1}
          max={1}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={(balanceY) => onChange({ balanceY })}
        />
      </div>
    </aside>
  );
}
