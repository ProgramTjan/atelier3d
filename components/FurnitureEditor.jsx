import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ALL_TYPES, ITEM_COLORS } from "../constants.js";
import {
  buildFromCustom,
  createPart,
  initCustomFromItem,
  normalizePart,
  PART_SHAPES,
  newPartId,
} from "../furniture/custom.js";
import { disposeObject3D } from "../lib/dispose.js";
import { useMediaQuery } from "../hooks/useMediaQuery.js";
import { EditorPlanView } from "./EditorPlanView.jsx";
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

function SliderRow({ label, value, onChange, min, max, step, accent }) {
  return (
    <label style={S.editorDimRow}>
      <span style={S.editorDimLabel}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ ...S.slider, flex: 1, accentColor: accent }}
      />
      <span style={{ ...S.sliderVal, width: 40 }}>{value.toFixed(2)}</span>
    </label>
  );
}

function EditorSidebar({
  custom,
  item,
  accent,
  selPartId,
  selPart,
  setSelPartId,
  updatePart,
  addPart,
  duplicatePart,
  setCustom,
  fullWidth = false,
}) {
  const showRound = selPart && (selPart.type === "box" || selPart.type === "roundBox");

  return (
    <div style={{
      ...S.editorSidebar,
      width: fullWidth ? "100%" : 280,
      borderLeft: fullWidth ? "none" : S.editorSidebar.borderLeft,
      flex: fullWidth ? 1 : undefined,
      minHeight: fullWidth ? 0 : undefined,
    }}
    >
      <div style={S.editorSection}>
        <span style={S.editorSectionTitle}>Vorm toevoegen</span>
        <div style={S.editorShapeGrid}>
          {PART_SHAPES.map((s) => (
            <button key={s.key} type="button" style={S.editorShapeBtn} onClick={() => addPart(s.key)}>
              + {s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={S.editorSection}>
        <span style={S.editorSectionTitle}>Onderdelen</span>
        <div style={S.editorPartList}>
          {custom.parts.map((p) => (
            <button
              key={p.id}
              type="button"
              style={{
                ...S.editorPartBtn,
                borderLeft: `4px solid ${p.color || item.c}`,
                ...(selPartId === p.id ? { borderColor: accent, color: "#F4E9D2" } : {}),
              }}
              onClick={() => setSelPartId(p.id)}
            >
              {p.label || p.type}
            </button>
          ))}
        </div>
      </div>

      {selPart && (
        <>
          <div style={S.editorSection}>
            <span style={S.editorSectionTitle}>Naam &amp; vorm</span>
            <input
              type="text"
              value={selPart.label || ""}
              onChange={(e) => updatePart(selPart.id, { label: e.target.value })}
              style={S.editorInput}
            />
            <div style={S.editorShapeGrid}>
              {PART_SHAPES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  style={{
                    ...S.editorShapeBtn,
                    ...(selPart.type === s.key ? { borderColor: accent, color: "#F4E9D2" } : {}),
                  }}
                  onClick={() => updatePart(selPart.id, {
                    type: s.key,
                    round: s.key === "roundBox" ? (selPart.round || 0.05) : 0,
                  })}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div style={S.editorSection}>
            <span style={S.editorSectionTitle}>Kleur</span>
            <div style={{ ...S.swatchRow, flexWrap: "wrap" }}>
              <button
                type="button"
                title="Standaard meubelkleur"
                onClick={() => updatePart(selPart.id, { color: null })}
                style={{
                  ...S.swatchSm,
                  background: item.c,
                  outline: !selPart.color ? `2px solid ${accent}` : "1px solid rgba(255,255,255,.25)",
                }}
              />
              {ITEM_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updatePart(selPart.id, { color: c })}
                  style={{
                    ...S.swatchSm,
                    background: c,
                    outline: selPart.color === c ? `2px solid ${accent}` : "1px solid rgba(255,255,255,.25)",
                  }}
                />
              ))}
            </div>
          </div>

          {showRound && (
            <div style={S.editorSection}>
              <SliderRow
                label="Afronding"
                value={selPart.round ?? 0}
                min={0}
                max={Math.min(selPart.w, selPart.h, selPart.d) / 2 - 0.01}
                step={0.005}
                accent={accent}
                onChange={(v) => updatePart(selPart.id, { type: "roundBox", round: v })}
              />
            </div>
          )}

          <div style={S.editorSection}>
            <span style={S.editorSectionTitle}>Afmetingen (m)</span>
            <DimInput label="Breedte" value={selPart.w} onChange={(v) => updatePart(selPart.id, { w: v })} />
            <DimInput label="Hoogte" value={selPart.h} onChange={(v) => updatePart(selPart.id, { h: v })} />
            <DimInput label="Diepte" value={selPart.d} onChange={(v) => updatePart(selPart.id, { d: v })} />
          </div>

          <div style={S.editorSection}>
            <span style={S.editorSectionTitle}>Positie (m)</span>
            <DimInput label="X" value={selPart.x} min={-2} max={2} onChange={(v) => updatePart(selPart.id, { x: v })} />
            <DimInput label="Y" value={selPart.y} min={0} max={2.5} onChange={(v) => updatePart(selPart.id, { y: v })} />
            <DimInput label="Z" value={selPart.z} min={-2} max={2} onChange={(v) => updatePart(selPart.id, { z: v })} />
          </div>

          <div style={S.editorSection}>
            <span style={S.editorSectionTitle}>Rotatie (°)</span>
            <DimInput label="X-as" value={selPart.rx || 0} min={-180} max={180} step={5} onChange={(v) => updatePart(selPart.id, { rx: v })} />
            <DimInput label="Y-as" value={selPart.ry || 0} min={-180} max={180} step={5} onChange={(v) => updatePart(selPart.id, { ry: v })} />
            <DimInput label="Z-as" value={selPart.rz || 0} min={-180} max={180} step={5} onChange={(v) => updatePart(selPart.id, { rz: v })} />
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" style={S.selBtn} onClick={duplicatePart}>Dupliceer</button>
            <button
              type="button"
              style={{ ...S.selBtn, color: "#E07856" }}
              onClick={() => {
                setCustom((c) => ({ ...c, parts: c.parts.filter((p) => p.id !== selPart.id) }));
                setSelPartId(null);
              }}
            >
              Verwijder
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function FurnitureEditor({ item, accent, onApply, onClose }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mobileTab, setMobileTab] = useState("draw");
  const mountRef = useRef(null);
  const threeRef = useRef({});
  const [custom, setCustom] = useState(() => {
    const base = item.custom
      ? { parts: item.custom.parts.map((p) => normalizePart(p)) }
      : initCustomFromItem(item);
    return base;
  });
  const [selPartId, setSelPartId] = useState(custom.parts[0]?.id ?? null);

  const selPart = custom.parts.find((p) => p.id === selPartId);

  const updatePart = (id, patch) => {
    setCustom((c) => ({
      ...c,
      parts: c.parts.map((p) => (p.id === id ? normalizePart({ ...p, ...patch }) : p)),
    }));
  };

  const addPart = (type) => {
    const p = createPart(type, PART_SHAPES.find((s) => s.key === type)?.label || type, item.c);
    setCustom((c) => ({ ...c, parts: [...c.parts, p] }));
    setSelPartId(p.id);
    if (isMobile) setMobileTab("settings");
  };

  const duplicatePart = () => {
    if (!selPart) return;
    const copy = normalizePart({
      ...selPart,
      id: undefined,
      label: `${selPart.label || selPart.type} kopie`,
      x: selPart.x + 0.15,
      z: selPart.z + 0.15,
    });
    copy.id = newPartId();
    setCustom((c) => ({ ...c, parts: [...c.parts, copy] }));
    setSelPartId(copy.id);
  };

  const sidebarProps = {
    custom,
    item,
    accent,
    selPartId,
    selPart,
    setSelPartId,
    updatePart,
    addPart,
    duplicatePart,
    setCustom,
  };

  /* ---------- 3D preview + klik-selectie ---------- */
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
    renderer.domElement.style.touchAction = "none";

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const sun = new THREE.DirectionalLight(0xfff0d6, 0.9);
    sun.position.set(3, 5, 2);
    sun.castShadow = true;
    scene.add(sun);
    scene.add(new THREE.GridHelper(4, 20, "#444", "#2a2d32"));

    const root = new THREE.Group();
    scene.add(root);
    threeRef.current = { scene, camera, renderer, root, mount };

    let meshGroup = buildFromCustom(custom.parts, item.c);
    root.add(meshGroup);

    const raycaster = new THREE.Raycaster();
    const onClick = (e) => {
      const r = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -((e.clientY - r.top) / r.height) * 2 + 1
      );
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(meshGroup.children, true);
      for (const h of hits) {
        let o = h.object;
        while (o && o.userData.partId === undefined) o = o.parent;
        if (o?.userData.partId) {
          setSelPartId(o.userData.partId);
          if (isMobile) setMobileTab("settings");
          return;
        }
      }
    };
    renderer.domElement.addEventListener("pointerdown", onClick);

    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w <= 0 || h <= 0) return;
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
      renderer.domElement.removeEventListener("pointerdown", onClick);
      disposeObject3D(meshGroup);
      renderer.dispose();
      if (renderer.domElement.parentNode) mount.removeChild(renderer.domElement);
    };
  }, [custom, item.c, isMobile]);

  const label = ALL_TYPES.find((t) => t.type === item.type)?.label || item.type;
  const mobileTabs = [
    { id: "preview", label: "3D" },
    { id: "draw", label: "Tekenen" },
    { id: "settings", label: "Instellingen" },
  ];

  const showPreview = !isMobile || mobileTab === "preview";
  const showDraw = !isMobile || mobileTab === "draw";
  const showSettings = !isMobile || mobileTab === "settings";

  return (
    <div style={{ ...S.editorOverlay, ...(isMobile ? S.editorOverlayMobile : {}) }}>
      <div style={{
        ...S.editorPanel,
        ...(isMobile ? S.editorPanelMobile : { width: "min(1100px, 98vw)", height: "min(720px, 94vh)" }),
      }}
      >
        <div style={S.editorHeader}>
          <div style={{ minWidth: 0, paddingRight: 8 }}>
            <span style={S.editorTitle}>Tekenomgeving</span>
            {!isMobile && (
              <span style={S.editorSubtitle}>
                {label} — sleep in 2D, klik in 3D, stel kleur &amp; vorm per onderdeel in
              </span>
            )}
            {isMobile && (
              <span style={{ ...S.editorSubtitle, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {label}
              </span>
            )}
          </div>
          <button type="button" style={S.editorClose} onClick={onClose} aria-label="Sluiten">✕</button>
        </div>

        {isMobile && (
          <div style={S.editorMobileTabs}>
            {mobileTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                style={{
                  ...S.editorMobileTab,
                  ...(mobileTab === tab.id ? { ...S.editorMobileTabActive, background: accent, borderColor: accent } : {}),
                }}
                onClick={() => setMobileTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ ...S.editorBody, ...(isMobile ? { flexDirection: "column" } : {}) }}>
          {isMobile ? (
            <>
              <div
                ref={mountRef}
                style={{
                  ...S.editorCanvas,
                  flex: 1,
                  minHeight: 180,
                  display: showPreview ? "block" : "none",
                }}
              />
              {showDraw && (
                <div style={{ ...S.editorPlanRow, ...S.editorPlanRowMobile, flex: 1, borderTop: "none" }}>
                  <EditorPlanView
                    parts={custom.parts}
                    selPartId={selPartId}
                    onSelect={(id) => {
                      setSelPartId(id);
                      setMobileTab("settings");
                    }}
                    onUpdatePart={updatePart}
                    view="top"
                    accent={accent}
                    label="Bovenaanzicht"
                  />
                  <EditorPlanView
                    parts={custom.parts}
                    selPartId={selPartId}
                    onSelect={(id) => {
                      setSelPartId(id);
                      setMobileTab("settings");
                    }}
                    onUpdatePart={updatePart}
                    view="side"
                    accent={accent}
                    label="Zijaanzicht"
                  />
                </div>
              )}
              {showSettings && <EditorSidebar {...sidebarProps} fullWidth />}
            </>
          ) : (
            <>
              <div style={S.editorMainCol}>
                <div ref={mountRef} style={{ ...S.editorCanvas, flex: 1.2, minHeight: 180 }} />
                <div style={S.editorPlanRow}>
                  <EditorPlanView
                    parts={custom.parts}
                    selPartId={selPartId}
                    onSelect={setSelPartId}
                    onUpdatePart={updatePart}
                    view="top"
                    accent={accent}
                    label="Bovenaanzicht — sleep & schaal hoeken"
                  />
                  <EditorPlanView
                    parts={custom.parts}
                    selPartId={selPartId}
                    onSelect={setSelPartId}
                    onUpdatePart={updatePart}
                    view="side"
                    accent={accent}
                    label="Zijaanzicht — hoogte & breedte"
                  />
                </div>
              </div>
              <EditorSidebar {...sidebarProps} />
            </>
          )}
        </div>

        <div style={{ ...S.editorFooter, ...(isMobile ? S.editorFooterMobile : {}) }}>
          <button
            type="button"
            style={{ ...S.editorCancel, ...(isMobile ? S.editorFooterBtnMobile : {}) }}
            onClick={onClose}
          >
            Annuleren
          </button>
          <button
            type="button"
            style={{
              ...S.editorApply,
              ...(isMobile ? S.editorFooterBtnMobile : {}),
              background: accent,
              color: "#1C1E22",
            }}
            onClick={() => onApply(custom)}
          >
            Toepassen in kamer
          </button>
        </div>
      </div>
    </div>
  );
}
