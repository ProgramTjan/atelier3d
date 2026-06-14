import React, { useRef, useState, useCallback } from "react";
import * as THREE from "three";
import {
  ITEM_COLORS,
  CATALOG_WONEN,
  CATALOG_BAD,
  VARIANT_COUNT,
} from "./constants.js";
import { PRESETS } from "./presets.js";
import { nextItemId, syncItemIdCounter } from "./ids.js";
import { styles } from "./styles.js";
import { useAppHistory } from "./hooks/useAppHistory.js";
import { useDesignStorage } from "./hooks/useDesignStorage.js";
import { useFullscreen } from "./hooks/useFullscreen.js";
import { useAtelierScene } from "./hooks/useAtelierScene.js";
import { useKeyboard } from "./hooks/useKeyboard.js";
import { downloadDesignJson, importDesignFromFile } from "./lib/designExport.js";
import { TopBar } from "./components/TopBar.jsx";
import { SelectionBar } from "./components/SelectionBar.jsx";
import { BottomPanel } from "./components/BottomPanel.jsx";
import { FurnitureEditor } from "./components/FurnitureEditor.jsx";
import { InstallBanner } from "./components/InstallBanner.jsx";

export default function Atelier3D() {
  const appRef = useRef(null);
  const itemsRef = useRef([]);
  const roomRef = useRef({ w: 6, d: 4.5 });
  const modeRef = useRef("inrichten");
  const viewRef = useRef("3d");

  const [items, setItems] = useState(() => PRESETS.scandinavisch.items());
  const [selected, setSelected] = useState(null);
  const [section, setSection] = useState("wonen");
  const [mode, setMode] = useState("inrichten");
  const [view, setView] = useState("3d");
  const [lighting, setLighting] = useState("dag");
  const [roomW, setRoomW] = useState(6);
  const [roomD, setRoomD] = useState(4.5);
  const [wallColor, setWallColor] = useState(PRESETS.scandinavisch.wall);
  const [wallFinish, setWallFinish] = useState("verf");
  const [floorColor, setFloorColor] = useState(PRESETS.scandinavisch.floor);
  const [floorFinish, setFloorFinish] = useState("hout");
  const [activePreset, setActivePreset] = useState("scandinavisch");
  const [panel, setPanel] = useState("meubels");
  const [editorItemId, setEditorItemId] = useState(null);

  itemsRef.current = items;

  const getSnapshot = useCallback(() => ({
    items,
    roomW,
    roomD,
    wallColor,
    wallFinish,
    floorColor,
    floorFinish,
    section,
    activePreset,
  }), [items, roomW, roomD, wallColor, wallFinish, floorColor, floorFinish, section, activePreset]);

  const applySnapshot = useCallback((s) => {
    setItems(s.items.map((i) => ({ ...i })));
    setRoomW(s.roomW);
    setRoomD(s.roomD);
    setWallColor(s.wallColor);
    setWallFinish(s.wallFinish);
    setFloorColor(s.floorColor);
    setFloorFinish(s.floorFinish);
    setSection(s.section);
    setActivePreset(s.activePreset ?? null);
    setSelected(null);
  }, []);

  const { pushHistory, pushHistoryRef, undo, canUndo } = useAppHistory(getSnapshot, applySnapshot);

  const { designs, storageOk, saveDesign, loadDesign, deleteDesign } = useDesignStorage({
    getSnapshot,
    pushHistory,
    applySnapshot,
  });

  const { isFullscreen, toggleFullscreen } = useFullscreen(appRef);

  const { mountRef, orbitRef, switchView, saveImage } = useAtelierScene({
    items,
    setItems,
    selected,
    setSelected,
    mode,
    setMode,
    view,
    setView,
    lighting,
    roomW,
    roomD,
    wallColor,
    wallFinish,
    floorColor,
    floorFinish,
    itemsRef,
    roomRef,
    modeRef,
    viewRef,
    pushHistoryRef,
  });

  const loadPreset = (key) => {
    if (!window.confirm(`Preset "${PRESETS[key].label}" laden?`)) return;
    pushHistory();
    const p = PRESETS[key];
    setItems(p.items());
    setWallColor(p.wall);
    setWallFinish(p.wallFinish);
    setFloorColor(p.floor);
    setFloorFinish(p.floorFinish);
    setRoomW(p.room.w);
    setRoomD(p.room.d);
    if (view === "3d") orbitRef.current.radius = Math.max(p.room.w, p.room.d) * 1.55;
    else orbitRef.current.radius = Math.max(p.room.w, p.room.d) * 1.5;
    setActivePreset(key);
    setSelected(null);
  };

  const addItem = (type) => {
    pushHistory();
    const id = nextItemId();
    setItems((cur) => [...cur, {
      id, type,
      x: 0.3 + Math.random() * 0.5,
      z: 0.3 + Math.random() * 0.5,
      r: 0, c: ITEM_COLORS[0], v: 0,
    }]);
    setSelected(id);
    setActivePreset(null);
    if (mode === "draaien") setMode("inrichten");
  };

  const rotateSel = (deg) => {
    if (!selected) return;
    pushHistory();
    setItems((cur) => cur.map((i) => (i.id === selected ? { ...i, r: i.r + deg } : i)));
  };

  const colorSel = (c) => {
    pushHistory();
    setItems((cur) => cur.map((i) => (i.id === selected ? { ...i, c } : i)));
  };

  const cycleVariant = () => {
    pushHistory();
    setItems((cur) => cur.map((i) => {
      if (i.id !== selected) return i;
      const count = VARIANT_COUNT[i.type] || 1;
      return { ...i, v: ((i.v || 0) + 1) % count, custom: undefined };
    }));
  };

  const duplicateSel = () => {
    const src = items.find((i) => i.id === selected);
    if (!src) return;
    pushHistory();
    const id = nextItemId();
    const { w, d } = roomRef.current;
    setItems((cur) => [...cur, {
      ...src,
      id,
      custom: src.custom ? structuredClone(src.custom) : undefined,
      x: THREE.MathUtils.clamp(src.x + 0.35, -w / 2 + 0.3, w / 2 - 0.3),
      z: THREE.MathUtils.clamp(src.z + 0.35, -d / 2 + 0.3, d / 2 - 0.3),
    }]);
    setSelected(id);
  };

  const deleteSel = () => {
    if (!selected) return;
    pushHistory();
    setItems((cur) => cur.filter((i) => i.id !== selected));
    setSelected(null);
  };

  const clearRoom = () => {
    if (!window.confirm("Alle meubels verwijderen?")) return;
    pushHistory();
    setItems([]);
    setSelected(null);
    setActivePreset(null);
  };

  const openEditor = () => {
    if (!selected) return;
    setEditorItemId(selected);
  };

  const applyCustom = (custom) => {
    pushHistory();
    setItems((cur) => cur.map((i) => (i.id === editorItemId ? { ...i, custom } : i)));
    setEditorItemId(null);
  };

  const exportDesign = () => {
    const snap = getSnapshot();
    downloadDesignJson({
      version: 1,
      name: "Export",
      ...snap,
      exportedAt: new Date().toISOString(),
    });
  };

  const importDesign = async () => {
    try {
      const data = await importDesignFromFile();
      if (!window.confirm("Geïmporteerd ontwerp laden? Huidige wijzigingen gaan verloren.")) return;
      pushHistory();
      applySnapshot({
        items: (data.items || []).map((i) => ({ ...i })),
        roomW: data.roomW ?? 6,
        roomD: data.roomD ?? 4.5,
        wallColor: data.wallColor ?? "#F1EDE5",
        wallFinish: data.wallFinish ?? "verf",
        floorColor: data.floorColor ?? "#D7BE9C",
        floorFinish: data.floorFinish ?? "hout",
        section: data.section ?? "wonen",
        activePreset: null,
      });
      if (data.items?.length) {
        syncItemIdCounter(Math.max(...data.items.map((i) => i.id + 1)));
      }
    } catch (e) {
      window.alert("Import mislukt — ongeldig JSON-bestand.");
    }
  };

  useKeyboard(
    {
      onDelete: deleteSel,
      onUndo: undo,
      onEscape: () => setSelected(null),
      onRotate: () => rotateSel(45),
    },
    !editorItemId
  );

  const selItem = items.find((i) => i.id === selected);
  const editorItem = items.find((i) => i.id === editorItemId);
  const presetsInSection = Object.entries(PRESETS).filter(([, p]) => p.section === section);
  const catalog = section === "bad" ? CATALOG_BAD : CATALOG_WONEN;
  const accent = section === "bad" ? "#8FB8AE" : "#E8B45A";
  const S = styles;

  return (
    <div ref={appRef} style={S.app}>
      <div ref={mountRef} style={S.canvasWrap} />

      <TopBar
        S={S}
        accent={accent}
        section={section}
        setSection={setSection}
        view={view}
        switchView={switchView}
        lighting={lighting}
        setLighting={setLighting}
        roomW={roomW}
        roomD={roomD}
        saveImage={saveImage}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        presetsInSection={presetsInSection}
        activePreset={activePreset}
        loadPreset={loadPreset}
        clearRoom={clearRoom}
      />

      {selItem && mode === "inrichten" && !editorItemId && (
        <SelectionBar
          S={S}
          accent={accent}
          selItem={selItem}
          selected={selected}
          pushHistory={pushHistory}
          setItems={setItems}
          cycleVariant={cycleVariant}
          rotateSel={rotateSel}
          duplicateSel={duplicateSel}
          colorSel={colorSel}
          deleteSel={deleteSel}
          openEditor={openEditor}
        />
      )}

      <BottomPanel
        S={S}
        accent={accent}
        section={section}
        panel={panel}
        setPanel={setPanel}
        canUndo={canUndo}
        undo={undo}
        mode={mode}
        setMode={setMode}
        setSelected={setSelected}
        catalog={catalog}
        addItem={addItem}
        wallFinish={wallFinish}
        setWallFinish={setWallFinish}
        wallColor={wallColor}
        setWallColor={setWallColor}
        floorFinish={floorFinish}
        setFloorFinish={setFloorFinish}
        floorColor={floorColor}
        setFloorColor={setFloorColor}
        setActivePreset={setActivePreset}
        roomW={roomW}
        setRoomW={setRoomW}
        roomD={roomD}
        setRoomD={setRoomD}
        saveDesign={saveDesign}
        storageOk={storageOk}
        designs={designs}
        loadDesign={loadDesign}
        deleteDesign={deleteDesign}
        exportDesign={exportDesign}
        importDesign={importDesign}
      />

      {editorItem && (
        <FurnitureEditor
          item={editorItem}
          accent={accent}
          onApply={applyCustom}
          onClose={() => setEditorItemId(null)}
        />
      )}

      <InstallBanner accent={accent} hidden={!!editorItemId} />
    </div>
  );
}
