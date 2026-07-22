# Snapframe

A lightweight, CleanShot-style screenshot beautifier for macOS, built with **Tauri v2 + React**.

- 📸 **Capture** a window or a selectable region — the native macOS grabber, taken *without* the system shadow so the editor can add its own.
- 🎨 **Beautify** — drop the shot onto a gradient/solid/wallpaper background, add padding, rounded corners, and a soft, adjustable shadow.
- 📋 **Copy** straight to the clipboard, or 💾 **Save** a retina PNG — paste it into Slack, Figma, a doc, wherever.

> Status: **editor-first**. The full editor (background, padding, corners, shadow, position, copy/save) is complete and runs in any browser via `npm run dev`. Native capture runs inside the Tauri desktop shell (`npm run app`) on macOS.

## Quick start

```bash
npm install

# Editor only, in the browser (no native capture) — fastest iteration loop:
npm run dev            # http://localhost:1420

# Full desktop app with native screen capture (macOS):
npm run app            # tauri dev
npm run app:build      # build a distributable .app / .dmg
```

Building the desktop app needs the [Tauri prerequisites](https://tauri.app/start/prerequisites/) (Xcode command-line tools + a Rust toolchain).

## How it works

### Capture (`src-tauri/src/lib.rs`)
The `capture_screen` Tauri command shells out to macOS' built-in `screencapture`:

| Mode          | Flags              | Behaviour                                        |
| ------------- | ------------------ | ------------------------------------------------ |
| `interactive` | `-i -o -t png`     | Drag a region, or press <kbd>Space</kbd> → window |
| `window`      | `-i -W -o -t png`  | Window picker, pre-armed                          |
| `fullscreen`  | `-o -t png`        | The whole main display                           |

`-o` strips the OS window shadow so the editor's own soft shadow is the only one — exactly how CleanShot keeps frames clean and re-shadowable. The PNG is returned to the UI as base64.

> **macOS permission:** the first capture triggers a *Screen Recording* permission prompt (System Settings → Privacy & Security → Screen Recording). Grant it to Snapframe and relaunch.

### Editor (`src/lib/render.ts`)
A single pure `drawScene()` renders background → soft shadow → rounded, clipped screenshot into a canvas. The **preview and the export call the exact same function** (just at different scales), so what you see is pixel-for-pixel what you copy or save. Layout is resolution-independent (`computeLayout()` works in "scene units" = source pixels), and export runs at 2× for retina crispness.

### Export (`src/lib/export.ts`)
- **Copy** → Tauri's clipboard plugin (`writeImage`) natively, or the browser Clipboard API as a fallback.
- **Save** → native save dialog + `fs` write in the app, or a browser download otherwise.

## Keyboard shortcuts

| Shortcut        | Action                          |
| --------------- | ------------------------------- |
| <kbd>⌘V</kbd>   | Paste an image from clipboard   |
| <kbd>⌘C</kbd>   | Copy the beautified result      |
| <kbd>⌘S</kbd>   | Save as PNG                     |
| Drag & drop     | Load an image file              |

## Project layout

```
snapframe/
├── src/                     # React editor (runs in browser or Tauri)
│   ├── App.tsx              # toolbar, shortcuts, capture/import/export wiring
│   ├── components/          # CanvasStage, Sidebar, BackgroundPicker, Controls
│   └── lib/                 # render (canvas engine), export, capture, presets, types
├── src-tauri/               # Rust desktop shell
│   ├── src/lib.rs           # capture_screen command
│   ├── tauri.conf.json      # window, bundle, icons
│   └── capabilities/        # clipboard / dialog / fs permissions
└── scripts/gen-icon.mjs     # regenerates the app icon set
```

## Regenerating icons

```bash
node scripts/gen-icon.mjs                 # refresh the PNG set + app-icon.png
npm run tauri icon app-icon.png           # generate icon.icns / icon.ico for bundling
```

## Roadmap ideas

- Global hotkey to capture from anywhere (the `global-shortcut` plugin is already wired).
- Annotation layer (arrows, highlights, blur-to-redact).
- Saved background presets and per-app defaults.
- Auto-balance / "smart" padding based on image aspect.
