import { useEffect, useState } from "react";
import { styles } from "../styles.js";

/** Toont 'Installeren' op mobiel wanneer PWA-installatie beschikbaar is. */
export function InstallBanner({ accent = "#E8B45A" }) {
  const [prompt, setPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem("atelier-pwa-dismiss") === "1"
  );
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || window.navigator.standalone === true;
    setIsIos(ios);
    setIsStandalone(standalone);

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  };

  const dismiss = () => {
    localStorage.setItem("atelier-pwa-dismiss", "1");
    setDismissed(true);
  };

  if (isStandalone || dismissed) return null;

  const S = styles;

  if (prompt) {
    return (
      <div style={S.installBanner}>
        <span style={S.installText}>Installeer Atelier 3D op je startscherm</span>
        <button type="button" style={{ ...S.installBtn, background: accent, color: "#1C1E22" }} onClick={install}>
          Installeren
        </button>
        <button type="button" style={S.installDismiss} onClick={dismiss}>✕</button>
      </div>
    );
  }

  if (isIos) {
    return (
      <div style={S.installBanner}>
        <span style={S.installText}>
          Op iPhone: Deel-knop → &quot;Zet op beginscherm&quot;
        </span>
        <button type="button" style={S.installDismiss} onClick={dismiss}>✕</button>
      </div>
    );
  }

  return null;
}
