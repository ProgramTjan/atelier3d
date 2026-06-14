import { useEffect } from "react";

export function useKeyboard(handlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if ((e.key === "Delete" || e.key === "Backspace") && handlers.onDelete) {
        e.preventDefault();
        handlers.onDelete();
      }
      if (e.ctrlKey && e.key === "z" && handlers.onUndo) {
        e.preventDefault();
        handlers.onUndo();
      }
      if (e.key === "Escape" && handlers.onEscape) {
        handlers.onEscape();
      }
      if ((e.key === "r" || e.key === "R") && handlers.onRotate) {
        handlers.onRotate();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, handlers]);
}
