import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Scene, SourceImage } from "./lib/types";
import { DEFAULT_SCENE } from "./lib/presets";
import { capture, loadImage, type CaptureMode } from "./lib/capture";
import {
  copyToClipboard,
  isTauri,
  renderToBlob,
  saveToFile,
} from "./lib/export";
import { CanvasStage } from "./components/CanvasStage";
import { Sidebar } from "./components/Sidebar";

type ToastKind = "info" | "error";

export function App() {
  const [image, setImage] = useState<SourceImage | null>(null);
  const [scene, setScene] = useState<Scene>(DEFAULT_SCENE);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [exportScale] = useState(2);
  const [toast, setToast] = useState<{ msg: string; kind: ToastKind } | null>(null);
  const [captureMenu, setCaptureMenu] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const notify = useCallback((msg: string, kind: ToastKind = "info") => {
    setToast({ msg, kind });
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const patchScene = useCallback(
    (patch: Partial<Scene>) => setScene((s) => ({ ...s, ...patch })),
    [],
  );

  const useImageSrc = useCallback(
    async (src: string) => {
      try {
        const el = await loadImage(src);
        setImage({ el, width: el.naturalWidth, height: el.naturalHeight });
      } catch {
        notify("Could not load that image", "error");
      }
    },
    [notify],
  );

  const onCapture = useCallback(
    async (mode: CaptureMode) => {
      setCaptureMenu(false);
      try {
        setBusy(true);
        const src = await capture(mode);
        setBusy(false);
        if (src) await useImageSrc(src);
      } catch (err) {
        setBusy(false);
        notify(err instanceof Error ? err.message : "Capture failed", "error");
      }
    },
    [notify, useImageSrc],
  );

  const onFile = useCallback(
    (file: File | undefined | null) => {
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => useImageSrc(String(reader.result));
      reader.readAsDataURL(file);
    },
    [useImageSrc],
  );

  const onCopy = useCallback(async () => {
    if (!image) return;
    try {
      setBusy(true);
      const blob = await renderToBlob(image, scene, exportScale);
      await copyToClipboard(blob);
      notify("Copied to clipboard");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Copy failed", "error");
    } finally {
      setBusy(false);
    }
  }, [image, scene, exportScale, notify]);

  const onSave = useCallback(async () => {
    if (!image) return;
    try {
      setBusy(true);
      const blob = await renderToBlob(image, scene, exportScale);
      const name = `snapframe-${Date.now()}.png`;
      const saved = await saveToFile(blob, name);
      if (saved) notify("Saved");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setBusy(false);
    }
  }, [image, scene, exportScale, notify]);

  // Paste an image from the clipboard, and Cmd/Ctrl+C / Cmd/Ctrl+S shortcuts.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/"),
      );
      if (item) onFile(item.getAsFile());
    };
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "c" && image) {
        e.preventDefault();
        void onCopy();
      } else if (mod && e.key.toLowerCase() === "s" && image) {
        e.preventDefault();
        void onSave();
      }
    };
    window.addEventListener("paste", onPaste);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("paste", onPaste);
      window.removeEventListener("keydown", onKey);
    };
  }, [image, onCopy, onSave, onFile]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      onFile(e.dataTransfer.files?.[0]);
    },
    [onFile],
  );

  return (
    <div className="app">
      <header className="toolbar">
        <div className="brand">
          <span className="dot" /> Snapframe
        </div>

        <div style={{ position: "relative", display: "flex" }}>
          <button
            className="btn primary"
            onClick={() => onCapture("interactive")}
            disabled={busy}
            title={isTauri() ? "Capture a region or window" : "Available in the desktop app"}
          >
            <span className="icon">✂️</span> Capture
          </button>
          <button
            className="btn primary"
            style={{ marginLeft: 2, padding: "7px 8px" }}
            onClick={() => setCaptureMenu((v) => !v)}
            aria-label="Capture options"
          >
            ▾
          </button>
          {captureMenu && (
            <div
              style={{
                position: "absolute",
                top: "110%",
                left: 0,
                background: "var(--panel-2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 4,
                zIndex: 10,
                minWidth: 150,
                boxShadow: "0 10px 30px rgba(0,0,0,.5)",
              }}
            >
              <button className="btn" style={menuItem} onClick={() => onCapture("window")}>
                🪟 Window
              </button>
              <button className="btn" style={menuItem} onClick={() => onCapture("fullscreen")}>
                🖥️ Full screen
              </button>
            </div>
          )}
        </div>

        <button className="btn" onClick={() => fileRef.current?.click()}>
          <span className="icon">📂</span> Open
        </button>

        <div className="spacer" />

        <button className="btn" onClick={onCopy} disabled={!image || busy} title="⌘C">
          <span className="icon">📋</span> Copy
        </button>
        <button className="btn primary" onClick={onSave} disabled={!image || busy} title="⌘S">
          <span className="icon">💾</span> Save
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </header>

      <div
        className="stage"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {image ? (
          <CanvasStage image={image} scene={scene} />
        ) : (
          <div className={`dropzone ${dragging ? "dragging" : ""}`}>
            <div className="glyph">🖼️</div>
            <div>
              <h2>Drop a screenshot to beautify it</h2>
              <p>
                Drag an image here, press <kbd>⌘V</kbd> to paste, click{" "}
                <strong>Open</strong>, or hit <strong>Capture</strong> in the desktop
                app to grab a window or region.
              </p>
            </div>
            <div className="actions">
              <button className="btn primary" onClick={() => fileRef.current?.click()}>
                <span className="icon">📂</span> Open an image
              </button>
            </div>
          </div>
        )}

        {toast && <div className={`toast ${toast.kind}`}>{toast.msg}</div>}
      </div>

      <Sidebar scene={scene} onChange={patchScene} />
    </div>
  );
}

const menuItem: React.CSSProperties = {
  width: "100%",
  justifyContent: "flex-start",
  border: "none",
  background: "transparent",
  marginBottom: 2,
};
