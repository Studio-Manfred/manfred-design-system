use base64::{engine::general_purpose::STANDARD, Engine as _};
use std::process::Command;

/// Capture the screen using macOS' built-in `screencapture` tool and return the
/// PNG as a base64 string. Captures are taken WITHOUT the system window shadow
/// (`-o`) so the editor can apply its own soft shadow, CleanShot-style.
///
/// `mode`:
///   - "interactive": drag a region, or press Space to switch to window mode.
///   - "window":      window picker pre-armed (Space toggle already active).
///   - "fullscreen":  the entire main display.
///
/// Returns `Ok(None)` when the user presses Esc to cancel.
#[tauri::command]
fn capture_screen(mode: String) -> Result<Option<String>, String> {
    // Write to a unique temp file, then read it back and clean up.
    let tmp = std::env::temp_dir().join(format!(
        "snapframe-capture-{}.png",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_millis())
            .unwrap_or(0)
    ));

    let mut cmd = Command::new("screencapture");
    // -x: silent, -o: no window shadow, -t png: format.
    cmd.arg("-x").arg("-o").arg("-t").arg("png");

    match mode.as_str() {
        "interactive" => {
            cmd.arg("-i");
        }
        "window" => {
            // -i with -W starts directly in window-selection mode.
            cmd.arg("-i").arg("-W");
        }
        "fullscreen" => {
            // No -i: capture the main display immediately.
        }
        other => return Err(format!("Unknown capture mode: {other}")),
    }

    cmd.arg(&tmp);

    let status = cmd
        .status()
        .map_err(|e| format!("Failed to launch screencapture: {e}"))?;

    if !status.success() {
        return Err("screencapture exited with an error".into());
    }

    // If the user cancelled an interactive capture, no file is written.
    if !tmp.exists() {
        return Ok(None);
    }

    let bytes = std::fs::read(&tmp).map_err(|e| format!("Failed to read capture: {e}"))?;
    let _ = std::fs::remove_file(&tmp);

    if bytes.is_empty() {
        return Ok(None);
    }

    Ok(Some(STANDARD.encode(bytes)))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![capture_screen])
        .run(tauri::generate_context!())
        .expect("error while running Snapframe");
}
