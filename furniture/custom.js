import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const mat = (c, rough = 0.85) =>
  new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: 0.05 });

let _partId = 1;
export const newPartId = () => _partId++;

export const PART_SHAPES = [
  { key: "box", label: "Blok" },
  { key: "roundBox", label: "Afgerond blok" },
  { key: "cyl", label: "Cilinder" },
  { key: "sphere", label: "Bol" },
  { key: "cone", label: "Kegel" },
];

/** Standaard templates om te starten in de tekenomgeving. */
export const CUSTOM_TEMPLATES = {
  bank: [
    { type: "roundBox", label: "Zitvlak", w: 2.1, h: 0.22, d: 0.85, x: 0, y: 0.2, z: 0, round: 0.05 },
    { type: "roundBox", label: "Rugleuning", w: 2.1, h: 0.55, d: 0.18, x: 0, y: 0.5, z: -0.35, round: 0.04 },
    { type: "box", label: "Armleuning L", w: 0.16, h: 0.45, d: 0.85, x: -0.97, y: 0.42, z: 0, round: 0.02 },
    { type: "box", label: "Armleuning R", w: 0.16, h: 0.45, d: 0.85, x: 0.97, y: 0.42, z: 0, round: 0.02 },
  ],
  salontafel: [
    { type: "roundBox", label: "Blad", w: 1.0, h: 0.04, d: 0.6, x: 0, y: 0.36, z: 0, round: 0.02 },
    { type: "cyl", label: "Poot", w: 0.08, h: 0.36, d: 0.08, x: 0, y: 0.18, z: 0, round: 0 },
  ],
  kast: [
    { type: "box", label: "Korpus", w: 1.0, h: 2.0, d: 0.45, x: 0, y: 1.0, z: 0, round: 0.01 },
    { type: "box", label: "Deur L", w: 0.48, h: 1.9, d: 0.02, x: -0.25, y: 1.0, z: 0.24, round: 0 },
    { type: "box", label: "Deur R", w: 0.48, h: 1.9, d: 0.02, x: 0.25, y: 1.0, z: 0.24, round: 0 },
  ],
  default: [
    { type: "roundBox", label: "Blok", w: 0.6, h: 0.6, d: 0.6, x: 0, y: 0.3, z: 0, round: 0.04 },
  ],
};

export function initCustomFromItem(item) {
  const tpl = CUSTOM_TEMPLATES[item.type] || CUSTOM_TEMPLATES.default;
  return {
    parts: tpl.map((p) => normalizePart({ ...p, id: newPartId(), color: item.c })),
  };
}

export function normalizePart(part) {
  return {
    round: 0.04,
    rx: 0,
    ry: 0,
    rz: 0,
    color: null,
    ...part,
    w: part.w ?? 0.5,
    h: part.h ?? 0.4,
    d: part.d ?? 0.5,
    x: part.x ?? 0,
    y: part.y ?? 0.2,
    z: part.z ?? 0,
  };
}

export function createPart(type = "box", label = "Nieuw onderdeel", color = null) {
  return normalizePart({
    id: newPartId(),
    type,
    label,
    color,
    w: type === "sphere" ? 0.4 : 0.5,
    h: type === "sphere" ? 0.4 : 0.4,
    d: type === "sphere" ? 0.4 : 0.5,
    x: 0,
    y: type === "sphere" ? 0.25 : 0.2,
    z: 0,
    round: type === "roundBox" ? 0.05 : 0,
  });
}

/** 2D bounds voor plan-/zicht-editor (axis-aligned). */
export function partBounds2D(part, view) {
  if (view === "side") {
    const hw = part.w / 2;
    const hh = part.h / 2;
    return { cx: part.x, cy: part.y, hw, hh, kind: part.type === "cyl" || part.type === "cone" ? "ellipse" : "rect" };
  }
  const isRound = part.type === "cyl" || part.type === "sphere" || part.type === "cone";
  if (isRound) {
    const r = part.w / 2;
    return { cx: part.x, cy: part.z, hw: r, hh: r, kind: "ellipse" };
  }
  return { cx: part.x, cy: part.z, hw: part.w / 2, hh: part.d / 2, kind: "rect" };
}

export function buildPartMesh(part, defaultColor) {
  const color = part.color || defaultColor || "#C9B8A3";
  const rough = part.type === "sphere" ? 0.35 : 0.88;
  const m = mat(color, rough);
  let mesh;

  switch (part.type) {
    case "roundBox": {
      const maxR = Math.min(part.w, part.h, part.d) / 2 - 0.005;
      const r = THREE.MathUtils.clamp(part.round ?? 0.04, 0, maxR);
      mesh = new THREE.Mesh(new RoundedBoxGeometry(part.w, part.h, part.d, 4, r), m);
      break;
    }
    case "cyl":
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(part.w / 2, part.w / 2, part.h, 22), m);
      break;
    case "sphere":
      mesh = new THREE.Mesh(new THREE.SphereGeometry(part.w / 2, 22, 18), m);
      break;
    case "cone":
      mesh = new THREE.Mesh(new THREE.ConeGeometry(part.w / 2, part.h, 22), m);
      break;
    default:
      mesh = new THREE.Mesh(new THREE.BoxGeometry(part.w, part.h, part.d), m);
  }

  mesh.position.set(part.x, part.y, part.z);
  mesh.rotation.set(
    THREE.MathUtils.degToRad(part.rx || 0),
    THREE.MathUtils.degToRad(part.ry || 0),
    THREE.MathUtils.degToRad(part.rz || 0)
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.partId = part.id;
  return mesh;
}

/** Bouw meubel uit custom onderdelen (tekenomgeving). */
export function buildFromCustom(parts, defaultColor) {
  const g = new THREE.Group();
  parts.forEach((part) => g.add(buildPartMesh(part, defaultColor)));
  return g;
}
