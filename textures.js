import * as THREE from "three";

export function shade(hex, amt) {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, THREE.MathUtils.clamp(hsl.l + amt, 0, 1));
  return "#" + c.getHexString();
}

export function tileTexture({ tileW, tileH, offset, color, variation, gloss }) {
  const px = 512, cover = 1.2;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = px;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = shade(color, -0.18);
  ctx.fillRect(0, 0, px, px);
  const cols = Math.round(cover / tileW);
  const rows = Math.round(cover / tileH);
  const tw = px / cols, th = px / rows;
  const gr = Math.max(1.6, px * 0.005);
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let r = 0; r < rows; r++) {
    const off = offset ? (r % 2) * (tw / 2) : 0;
    for (let col = -1; col <= cols; col++) {
      const x = col * tw + off, y = r * th;
      ctx.fillStyle = shade(color, (rnd() - 0.5) * variation);
      ctx.fillRect(x + gr / 2, y + gr / 2, tw - gr, th - gr);
      if (gloss) {
        const grad = ctx.createLinearGradient(x, y, x, y + th);
        grad.addColorStop(0, "rgba(255,255,255,0.16)");
        grad.addColorStop(0.45, "rgba(255,255,255,0)");
        grad.addColorStop(1, "rgba(0,0,0,0.08)");
        ctx.fillStyle = grad;
        ctx.fillRect(x + gr / 2, y + gr / 2, tw - gr, th - gr);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

export function plankTexture(color) {
  const px = 512, cover = 1.2, plankW = 0.15;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = px;
  const ctx = canvas.getContext("2d");
  const rows = Math.round(cover / plankW);
  const rh = px / rows;
  let seed = 5;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let r = 0; r < rows; r++) {
    ctx.fillStyle = shade(color, (rnd() - 0.5) * 0.12);
    ctx.fillRect(0, r * rh, px, rh);
    ctx.strokeStyle = "rgba(0,0,0,0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const y = r * rh + rnd() * rh;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(px * 0.3, y + (rnd() - 0.5) * 6, px * 0.7, y + (rnd() - 0.5) * 6, px, y);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(0, r * rh, px, 1.5);
    ctx.fillRect(rnd() * px, r * rh, 1.5, rh);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

export function makeWallTexture(finish, color) {
  switch (finish) {
    case "vierkant": return tileTexture({ tileW: 0.3, tileH: 0.3, offset: false, color, variation: 0.05, gloss: true });
    case "metro": return tileTexture({ tileW: 0.3, tileH: 0.15, offset: true, color, variation: 0.04, gloss: true });
    case "zellige": return tileTexture({ tileW: 0.12, tileH: 0.12, offset: false, color, variation: 0.16, gloss: true });
    default: return null;
  }
}
export function makeFloorTexture(finish, color) {
  switch (finish) {
    case "hout": return plankTexture(color);
    case "tegel": return tileTexture({ tileW: 0.4, tileH: 0.4, offset: false, color, variation: 0.06, gloss: false });
    default: return null;
  }
}

// tekstlabel als sprite (voor maatvoering in plattegrond)
export function textSprite(text) {
  const cv = document.createElement("canvas");
  cv.width = 256; cv.height = 96;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "rgba(20,22,26,0.88)";
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(38, 16, 180, 64, 14) : ctx.rect(38, 16, 180, 64);
  ctx.fill();
  ctx.fillStyle = "#F4E9D2";
  ctx.font = "bold 40px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 49);
  const tex = new THREE.CanvasTexture(cv);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }));
  sp.scale.set(1.0, 0.38, 1);
  return sp;
}
