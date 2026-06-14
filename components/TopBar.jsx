export function TopBar({
  S,
  accent,
  section,
  setSection,
  view,
  switchView,
  lighting,
  setLighting,
  roomW,
  roomD,
  saveImage,
  isFullscreen,
  toggleFullscreen,
  presetsInSection,
  activePreset,
  loadPreset,
  clearRoom,
}) {
  return (
    <div style={S.topBar}>
      <div style={S.wordmark}>
        <span style={S.wordmarkSerif}>Atelier</span>
        <span style={{ ...S.wordmarkBadge, color: accent, borderColor: accent }}>3D</span>
        <span style={S.dims}>{roomW.toFixed(1)} × {roomD.toFixed(1)} m</span>
        <button style={S.photoBtn} onClick={saveImage}>Opslaan als afbeelding</button>
        <button style={S.fsBtn} onClick={toggleFullscreen} aria-label="Volledig scherm">
          {isFullscreen ? "✕ Sluit" : "⛶ Volledig"}
        </button>
      </div>

      <div style={S.controlRow}>
        <div style={S.seg}>
          <button
            style={{ ...S.segBtn, ...(section === "wonen" ? { background: "#E8B45A", color: "#1C1E22" } : {}) }}
            onClick={() => setSection("wonen")}
          >Woonruimte</button>
          <button
            style={{ ...S.segBtn, ...(section === "bad" ? { background: "#8FB8AE", color: "#1C1E22" } : {}) }}
            onClick={() => setSection("bad")}
          >Badkamer</button>
        </div>
        <div style={{ ...S.seg, marginLeft: "auto" }}>
          <button
            style={{ ...S.segBtnSm, ...(view === "3d" ? { background: accent, color: "#1C1E22" } : {}) }}
            onClick={() => switchView("3d")}
          >3D</button>
          <button
            style={{ ...S.segBtnSm, ...(view === "plan" ? { background: accent, color: "#1C1E22" } : {}) }}
            onClick={() => switchView("plan")}
          >Plattegrond</button>
        </div>
        <div style={S.seg}>
          <button
            style={{ ...S.segBtnSm, ...(lighting === "dag" ? { background: accent, color: "#1C1E22" } : {}) }}
            onClick={() => setLighting("dag")}
          >Dag</button>
          <button
            style={{ ...S.segBtnSm, ...(lighting === "avond" ? { background: accent, color: "#1C1E22" } : {}) }}
            onClick={() => setLighting("avond")}
          >Avond</button>
        </div>
      </div>

      <div style={S.presetRow}>
        {presetsInSection.map(([key, p]) => (
          <button
            key={key}
            onClick={() => loadPreset(key)}
            style={{
              ...S.presetChip,
              ...(activePreset === key ? { border: `1px solid ${accent}`, color: "#F4E9D2" } : {}),
            }}
          >
            <span style={S.dotRow}>
              {p.dots.map((d, i) => (
                <span key={i} style={{ ...S.dot, background: d }} />
              ))}
            </span>
            {p.label}
          </button>
        ))}
        <button onClick={clearRoom} style={S.presetChip}>Lege kamer</button>
      </div>
    </div>
  );
}
