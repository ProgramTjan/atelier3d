import { useEffect, useRef, useCallback } from "react";
import { partBounds2D } from "../furniture/custom.js";

const SCALE = 88;
const SNAP = 0.05;

function snap(v) {
  return Math.round(v / SNAP) * SNAP;
}

function hitEllipse(px, py, cx, cy, hw, hh) {
  const dx = (px - cx) / hw;
  const dy = (py - cy) / hh;
  return dx * dx + dy * dy <= 1;
}

function hitRect(px, py, cx, cy, hw, hh) {
  return px >= cx - hw && px <= cx + hw && py >= cy - hh && py <= cy + hh;
}

/**
 * Interactief 2D-vlak: bovenaanzicht (x/z) of zijaanzicht (x/y).
 * Sleep om te verplaatsen, hoek-handles om te schalen.
 */
export function EditorPlanView({
  parts,
  selPartId,
  onSelect,
  onUpdatePart,
  view,
  accent,
  label,
}) {
  const canvasRef = useRef(null);
  const dragRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const ox = w / 2;
    const oy = h / 2;

    ctx.fillStyle = "#14171c";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(255,255,255,.06)";
    ctx.lineWidth = 1;
    for (let i = -4; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(ox + i * SCALE, 0);
      ctx.lineTo(ox + i * SCALE, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, oy + i * SCALE);
      ctx.lineTo(w, oy + i * SCALE);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(244,233,210,.25)";
    ctx.beginPath();
    ctx.moveTo(ox, 0);
    ctx.lineTo(ox, h);
    ctx.moveTo(0, oy);
    ctx.lineTo(w, oy);
    ctx.stroke();

    parts.forEach((part) => {
      const b = partBounds2D(part, view);
      const sx = ox + b.cx * SCALE;
      const sy = oy + b.cy * SCALE;
      const sw = b.hw * SCALE * 2;
      const sh = b.hh * SCALE * 2;
      const selected = part.id === selPartId;
      const fill = part.color || "#8A9B8E";

      ctx.fillStyle = fill + (selected ? "cc" : "88");
      ctx.strokeStyle = selected ? accent : "rgba(255,255,255,.35)";
      ctx.lineWidth = selected ? 2 : 1;

      if (b.kind === "ellipse") {
        ctx.beginPath();
        ctx.ellipse(sx, sy, b.hw * SCALE, b.hh * SCALE, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(sx - sw / 2, sy - sh / 2, sw, sh);
        ctx.strokeRect(sx - sw / 2, sy - sh / 2, sw, sh);
      }

      if (selected) {
        const handles = [
          [sx + sw / 2, sy + sh / 2],
          [sx + sw / 2, sy - sh / 2],
          [sx - sw / 2, sy + sh / 2],
          [sx - sw / 2, sy - sh / 2],
        ];
        handles.forEach(([hx, hy]) => {
          ctx.fillStyle = accent;
          ctx.fillRect(hx - 5, hy - 5, 10, 10);
        });
      }

      ctx.fillStyle = "#F4E9D2";
      ctx.font = "11px system-ui,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(part.label || part.type, sx, sy - b.hh * SCALE - 6);
    });
  }, [parts, selPartId, view, accent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(r.width * devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(r.height * devicePixelRatio));
      draw();
    });
    ro.observe(canvas);
    draw();
    return () => ro.disconnect();
  }, [draw]);

  useEffect(() => { draw(); }, [draw]);

  const toWorld = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const r = canvas.getBoundingClientRect();
    const px = ((clientX - r.left) / r.width) * canvas.width;
    const py = ((clientY - r.top) / r.height) * canvas.height;
    const ox = canvas.width / 2;
    const oy = canvas.height / 2;
    return { x: (px - ox) / SCALE, y: (py - oy) / SCALE, px, py, ox, oy };
  };

  const pickPart = (wx, wy) => {
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      const b = partBounds2D(part, view);
      const hit = b.kind === "ellipse"
        ? hitEllipse(wx, wy, b.cx, b.cy, b.hw, b.hh)
        : hitRect(wx, wy, b.cx, b.cy, b.hw, b.hh);
      if (hit) return part;
    }
    return null;
  };

  const pickHandle = (part, px, py, ox, oy) => {
    const b = partBounds2D(part, view);
    const sx = ox + b.cx * SCALE;
    const sy = oy + b.cy * SCALE;
    const sw = b.hw * SCALE * 2;
    const sh = b.hh * SCALE * 2;
    const handles = {
      se: [sx + sw / 2, sy + sh / 2],
      ne: [sx + sw / 2, sy - sh / 2],
      sw: [sx - sw / 2, sy + sh / 2],
      nw: [sx - sw / 2, sy - sh / 2],
    };
    for (const [key, [hx, hy]] of Object.entries(handles)) {
      if (Math.abs(px - hx) <= 8 && Math.abs(py - hy) <= 8) return key;
    }
    return null;
  };

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y, px, py, ox, oy } = toWorld(e.clientX, e.clientY);
    const sel = parts.find((p) => p.id === selPartId);
    if (sel) {
      const handle = pickHandle(sel, px, py, ox, oy);
      if (handle) {
        dragRef.current = { mode: "resize", id: sel.id, handle, start: { x, y, part: { ...sel } } };
        return;
      }
    }
    const hit = pickPart(x, y);
    if (hit) {
      onSelect(hit.id);
      dragRef.current = {
        mode: "move",
        id: hit.id,
        offX: hit.x - x,
        offY: view === "side" ? hit.y - y : hit.z - y,
      };
    } else {
      onSelect(null);
    }
  };

  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const { x, y } = toWorld(e.clientX, e.clientY);

    if (d.mode === "move") {
      const part = parts.find((p) => p.id === d.id);
      if (!part) return;
      if (view === "side") {
        onUpdatePart(d.id, { x: snap(x + d.offX), y: snap(Math.max(part.h / 2, y + d.offY)) });
      } else {
        onUpdatePart(d.id, { x: snap(x + d.offX), z: snap(y + d.offY) });
      }
    } else if (d.mode === "resize") {
      const p0 = d.start.part;
      const dx = x - d.start.x;
      const dy = y - d.start.y;
      if (view === "side") {
        let nw = Math.max(0.08, p0.w + dx * 2);
        let nh = Math.max(0.08, p0.h + dy * 2);
        if (d.handle.startsWith("n")) nh = Math.max(0.08, p0.h - dy * 2);
        if (d.handle.startsWith("w")) nw = Math.max(0.08, p0.w - dx * 2);
        onUpdatePart(d.id, { w: snap(nw), h: snap(nh) });
      } else {
        if (p0.type === "cyl" || p0.type === "sphere" || p0.type === "cone") {
          const nr = Math.max(0.04, p0.w / 2 + Math.max(dx, dy));
          onUpdatePart(d.id, { w: snap(nr * 2), d: snap(nr * 2), h: p0.type === "sphere" ? snap(nr * 2) : p0.h });
        } else {
          let nw = Math.max(0.08, p0.w + dx * 2);
          let nd = Math.max(0.08, p0.d + dy * 2);
          if (d.handle.startsWith("n")) nd = Math.max(0.08, p0.d - dy * 2);
          if (d.handle.startsWith("w")) nw = Math.max(0.08, p0.w - dx * 2);
          onUpdatePart(d.id, { w: snap(nw), d: snap(nd) });
        }
      }
    }
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
        color: "rgba(237,234,227,.5)", padding: "6px 8px 4px",
      }}
      >
        {label}
      </span>
      <canvas
        ref={canvasRef}
        style={{ flex: 1, width: "100%", minHeight: 140, touchAction: "none", cursor: "grab" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
    </div>
  );
}
