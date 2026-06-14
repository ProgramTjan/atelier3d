import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Atelier3D from "./App.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <Atelier3D />
    </ErrorBoundary>
  </StrictMode>
);
