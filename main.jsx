import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Atelier3D from "./App.jsx";
import "./index.css";

// Polyfill voor window.storage (Cursor/artifact-omgeving) → localStorage lokaal
if (!window.storage) {
  window.storage = {
    async get(key) {
      const value = localStorage.getItem(key);
      return value !== null ? { value } : undefined;
    },
    async set(key, value) {
      localStorage.setItem(key, value);
    },
  };
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Atelier3D />
  </StrictMode>
);
