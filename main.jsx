import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Atelier3D from "./App.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { InstallBanner } from "./components/InstallBanner.jsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <Atelier3D />
    </ErrorBoundary>
  </StrictMode>
);
