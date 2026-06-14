import { ITEM_COLORS, VARIANT_COUNT, LIGHT_TYPES, ALL_TYPES } from "../constants.js";

export function SelectionBar({
  S,
  accent,
  selItem,
  selected,
  pushHistory,
  setItems,
  cycleVariant,
  rotateSel,
  duplicateSel,
  colorSel,
  deleteSel,
}) {
  return (
    <div style={S.selBar}>
      <span style={S.selLabel}>
        {ALL_TYPES.find((c) => c.type === selItem.type)?.label || selItem.type}
      </span>
      {(VARIANT_COUNT[selItem.type] || 1) > 1 && (
        <button style={{ ...S.selBtn, color: accent }} onClick={cycleVariant}>
          Model {(selItem.v || 0) + 1}/{VARIANT_COUNT[selItem.type]}
        </button>
      )}
      <button style={S.selBtn} onClick={() => rotateSel(-45)} aria-label="Draai linksom">⟲</button>
      <button style={S.selBtn} onClick={() => rotateSel(45)} aria-label="Draai rechtsom">⟳</button>
      <button style={S.selBtn} onClick={duplicateSel}>Dupliceer</button>
      {LIGHT_TYPES.includes(selItem.type) && (
        <>
          <span style={S.selDivider} />
          <span style={S.lightLabel}>Licht</span>
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={selItem.b === undefined ? 1 : selItem.b}
            onPointerDown={pushHistory}
            onChange={(e) => {
              const b = parseFloat(e.target.value);
              setItems((cur) => cur.map((i) => (i.id === selected ? { ...i, b } : i)));
            }}
            style={{ ...S.lightSlider, accentColor: accent }}
          />
          <span style={S.lightVal}>
            {Math.round((selItem.b === undefined ? 1 : selItem.b) * 100)}%
          </span>
        </>
      )}
      <span style={S.selDivider} />
      {ITEM_COLORS.map((c) => (
        <button
          key={c}
          onClick={() => colorSel(c)}
          aria-label={`Kleur ${c}`}
          style={{
            ...S.swatchSm,
            background: c,
            outline: selItem.c === c ? `2px solid ${accent}` : "1px solid rgba(255,255,255,.25)",
          }}
        />
      ))}
      <span style={S.selDivider} />
      <button style={{ ...S.selBtn, color: "#E07856" }} onClick={deleteSel}>Verwijder</button>
    </div>
  );
}
