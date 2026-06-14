import { WALL_FINISHES, FLOOR_FINISHES, WALL_SWATCHES, FLOOR_SWATCHES } from "../constants.js";

export function BottomPanel({
  S,
  accent,
  section,
  panel,
  setPanel,
  canUndo,
  undo,
  mode,
  setMode,
  setSelected,
  catalog,
  addItem,
  wallFinish,
  setWallFinish,
  wallColor,
  setWallColor,
  floorFinish,
  setFloorFinish,
  floorColor,
  setFloorColor,
  setActivePreset,
  roomW,
  setRoomW,
  roomD,
  setRoomD,
  saveDesign,
  storageOk,
  designs,
  loadDesign,
  deleteDesign,
  exportDesign,
  importDesign,
}) {
  return (
    <div style={S.bottom}>
      <div style={S.tabRow}>
        {[["meubels", section === "bad" ? "Sanitair" : "Meubels"], ["stijl", "Wanden & vloer"], ["ruimte", "Afmetingen"], ["ontwerpen", "Ontwerpen"]].map(([key, label]) => (
          <button
            key={key}
            style={{ ...S.tab, ...(panel === key ? { color: "#F4E9D2", borderBottom: `2px solid ${accent}` } : {}) }}
            onClick={() => setPanel(panel === key ? "geen" : key)}
          >{label}</button>
        ))}
        <button
          style={{ ...S.undoBtn, opacity: canUndo ? 1 : 0.35 }}
          onClick={undo}
          disabled={!canUndo}
        >⟲ Ongedaan</button>
        <div style={S.modeSeg}>
          <button
            style={{ ...S.modeSegBtn, ...(mode === "inrichten" ? { background: accent, color: "#1C1E22" } : {}) }}
            onClick={() => setMode("inrichten")}
          >Inrichten</button>
          <button
            style={{ ...S.modeSegBtn, ...(mode === "draaien" ? { background: accent, color: "#1C1E22" } : {}) }}
            onClick={() => { setMode("draaien"); setSelected(null); }}
          >Rondkijken</button>
        </div>
      </div>

      {panel === "meubels" && (
        <div style={S.catalogRow}>
          {catalog.map((c) => (
            <button key={c.type + c.label} style={S.catBtn} onClick={() => addItem(c.type)}>
              <span style={{ ...S.catPlus, color: accent }}>+</span>{c.label}
            </button>
          ))}
        </div>
      )}

      {panel === "stijl" && (
        <div style={S.stylePanel}>
          <div style={S.styleGroup}>
            <span style={S.styleLabel}>Muur</span>
            <div style={S.finishRow}>
              {WALL_FINISHES.map((f) => (
                <button
                  key={f.key}
                  onClick={() => { setWallFinish(f.key); setActivePreset(null); }}
                  style={{ ...S.finishChip, ...(wallFinish === f.key ? { border: `1px solid ${accent}`, color: "#F4E9D2" } : {}) }}
                >{f.label}</button>
              ))}
            </div>
          </div>
          <div style={S.styleGroup}>
            <span style={S.styleLabel} />
            <div style={S.swatchRow}>
              {WALL_SWATCHES.map((w) => (
                <button
                  key={w.c}
                  title={w.name}
                  onClick={() => { setWallColor(w.c); setActivePreset(null); }}
                  style={{
                    ...S.swatchLg,
                    background: w.c,
                    outline: wallColor === w.c ? `2px solid ${accent}` : "1px solid rgba(255,255,255,.2)",
                  }}
                />
              ))}
            </div>
          </div>
          <div style={S.styleGroup}>
            <span style={S.styleLabel}>Vloer</span>
            <div style={S.finishRow}>
              {FLOOR_FINISHES.map((f) => (
                <button
                  key={f.key}
                  onClick={() => { setFloorFinish(f.key); setActivePreset(null); }}
                  style={{ ...S.finishChip, ...(floorFinish === f.key ? { border: `1px solid ${accent}`, color: "#F4E9D2" } : {}) }}
                >{f.label}</button>
              ))}
            </div>
          </div>
          <div style={S.styleGroup}>
            <span style={S.styleLabel} />
            <div style={S.swatchRow}>
              {FLOOR_SWATCHES.map((f) => (
                <button
                  key={f.c}
                  title={f.name}
                  onClick={() => { setFloorColor(f.c); setActivePreset(null); }}
                  style={{
                    ...S.swatchLg,
                    background: f.c,
                    outline: floorColor === f.c ? `2px solid ${accent}` : "1px solid rgba(255,255,255,.2)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {panel === "ruimte" && (
        <div style={S.stylePanel}>
          <div style={S.sliderGroup}>
            <span style={S.styleLabel}>Breedte</span>
            <input
              type="range"
              min={2.8}
              max={8}
              step={0.1}
              value={roomW}
              onChange={(e) => { setRoomW(parseFloat(e.target.value)); setActivePreset(null); }}
              style={{ ...S.slider, accentColor: accent }}
            />
            <span style={S.sliderVal}>{roomW.toFixed(1)} m</span>
          </div>
          <div style={S.sliderGroup}>
            <span style={S.styleLabel}>Diepte</span>
            <input
              type="range"
              min={2.4}
              max={6}
              step={0.1}
              value={roomD}
              onChange={(e) => { setRoomD(parseFloat(e.target.value)); setActivePreset(null); }}
              style={{ ...S.slider, accentColor: accent }}
            />
            <span style={S.sliderVal}>{roomD.toFixed(1)} m</span>
          </div>
        </div>
      )}

      {panel === "ontwerpen" && (
        <div style={S.stylePanel}>
          <div style={S.designHeader}>
            <button style={{ ...S.saveDesignBtn, borderColor: accent, color: accent }} onClick={saveDesign}>
              + Huidig ontwerp opslaan
            </button>
            <button style={S.saveDesignBtn} onClick={exportDesign}>Export JSON</button>
            <button style={S.saveDesignBtn} onClick={importDesign}>Import JSON</button>
            {!storageOk && <span style={S.storageWarn}>Opslag niet beschikbaar</span>}
          </div>
          {designs.length === 0 ? (
            <span style={S.emptyDesigns}>Nog geen opgeslagen ontwerpen — je ontwerpen blijven bewaard, ook na het sluiten.</span>
          ) : (
            <div style={S.designList}>
              {designs.map((d) => (
                <div key={d.id} style={S.designRow}>
                  <span style={S.designName}>{d.name}</span>
                  <span style={S.designMeta}>{d.items.length} items · {d.roomW.toFixed(1)}×{d.roomD.toFixed(1)} m</span>
                  <button style={{ ...S.selBtn, color: accent }} onClick={() => loadDesign(d)}>Laden</button>
                  <button style={{ ...S.selBtn, color: "#E07856" }} onClick={() => deleteDesign(d.id)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
