import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ALL_TYPES } from "../constants.js";
import { buildFromCustom, createPart, initCustomFromItem } from "../furniture/custom.js";
import { disposeObject3D } from "../lib/dispose.js";
import { styles } from "../styles.js";

const S = styles;

function DimInput({ label, value, onChange, min = 0.05, max = 4, step = 0.05 }) {
  return (
    <label style={S.editorDimRow}>
      <span style={S.editorDimLabel}>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={Number(value.toFixed(2))}
        onChange={(e) => onChange(parseFloat(e.target.value) || min)}
        style={S.editorInput}
      />
    </label>
  );
}

export function FurnitureEditor({ item, accent, onApply, onClose }) {
  const mountRef = useRef(null);
  const [custom, setCustom] = useState(() =>
    item.custom ? structuredClone(item.custom) : initCustomFromItem(item)
  );
  const [selPartId, setSelPartId] = useState(custom.parts[0]?.id ?? null);

  const selPart = custom.parts.find((p) => p.id === selPartId);

  const updatePart = (id, patch) => {
    setCustom((c) => ({
      ...c,
      parts: c.parts.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#1a1d22");
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 30);
    camera.position.set(2.8, 1.8, 2.8);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const sun = new THREE.DirectionalLight(0xfff0d6, 0.9);
    sun.position.set(3, 5, 2);
    sun.castShadow = true;
    scene.add(sun);

    const root = new THREE.Group();
    scene.add(root);
    scene.add(new THREE.GridHelper(4, 20, "#444", "#2a2d32"));

    const meshGroup = buildFromCustom(custom.parts, item.c);
    root.add(meshGroup);

    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();
    window.addEventListener("resize", resize);
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      disposeObject3D(meshGroup);
      renderer.dispose();
      if (renderer.domElement.parentNode) mount.removeChild(renderer.domElement);
    };
  }, [custom, item.c]);

  const label = ALL_TYPES.find((t) => t.type === item.type)?.label || item.type;

  return (
    <div style={S.editorOverlay}>
      <div style={S.editorPanel}>
        <div style={S.editorHeader}>
          <div>
            <span style={S.editorTitle}>Tekenomgeving</span>
            <span style={S.editorSubtitle}>{label} — onderdelen aanpassen</span>
          </div>
          <button type="button" style={S.editorClose} onClick={onClose}>✕</button>
        </div>

        <div style={S.editorBody}>
          <div ref={mountRef} style={S.editorCanvas} />

          <div style={S.editorSidebar}>
            <div style={S.editorSection}>
              <span style={S.editorSectionTitle}>Onderdelen</span>
              <div style={S.editorPartList}>
                {custom.parts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    style={{
                      ...S.editorPartBtn,
                      ...(selPartId === p.id ? { borderColor: accent, color: "#F4E9D2" } : {}),
                    }}
                    onClick={() => setSelPartId(p.id)}
                  >
                    {p.label || p.type}
                  </button>
                ))}
              </div>
              <div style={S.editorAddRow}>
                <button type="button" style={S.editorAddBtn} onClick={() => {
                  const p = createPart("box", "Blok");
                  setCustom((c) => ({ ...c, parts: [...c.parts, p] }));
                  setSelPartId(p.id);
                }}>+ Blok</button>
                <button type="button" style={S.editorAddBtn} onClick={() => {
                  const p = createPart("cyl", "Cilinder");
                  setCustom((c) => ({ ...c, parts: [...c.parts, p] }));
                  setSelPartId(p.id);
                }}>+ Cilinder</button>
              </div>
            </div>

            {selPart && (
              <div style={S.editorSection}>
                <span style={S.editorSectionTitle}>Afmetingen (m)</span>
                <DimInput label="Breedte" value={selPart.w} onChange={(v) => updatePart(selPart.id, { w: v })} />
                <DimInput label="Hoogte" value={selPart.h} onChange={(v) => updatePart(selPart.id, { h: v })} />
                <DimInput label="Diepte" value={selPart.d} onChange={(v) => updatePart(selPart.id, { d: v })} />
                <span style={S.editorSectionTitle}>Positie (m)</span>
                <DimInput label="X" value={selPart.x} min={-2} max={2} onChange={(v) => updatePart(selPart.id, { x: v })} />
                <DimInput label="Y" value={selPart.y} min={0} max={2.5} onChange={(v) => updatePart(selPart.id, { y: v })} />
                <DimInput label="Z" value={selPart.z} min={-2} max={2} onChange={(v) => updatePart(selPart.id, { z: v })} />
                <button
                  type="button"
                  style={{ ...S.selBtn, color: "#E07856", marginTop: 8 }}
                  onClick={() => {
                    setCustom((c) => ({ ...c, parts: c.parts.filter((p) => p.id !== selPart.id) }));
                    setSelPartId(null);
                  }}
                >
                  Onderdeel verwijderen
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={S.editorFooter}>
          <button type="button" style={S.editorCancel} onClick={onClose}>Annuleren</button>
          <button
            type="button"
            style={{ ...S.editorApply, background: accent, color: "#1C1E22" }}
            onClick={() => onApply(custom)}
          >
            Toepassen in kamer
          </button>
        </div>
      </div>
    </div>
  );
}
