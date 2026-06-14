import * as THREE from "three";

const mat = (c, rough = 0.85) =>
  new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: 0.05 });

let _partId = 1;
export const newPartId = () => _partId++;

/** Standaard templates om te starten in de tekenomgeving. */
export const CUSTOM_TEMPLATES = {
  bank: [
    { id: 1, type: "box", label: "Zitvlak", w: 2.1, h: 0.22, d: 0.85, x: 0, y: 0.2, z: 0 },
    { id: 2, type: "box", label: "Rugleuning", w: 2.1, h: 0.55, d: 0.18, x: 0, y: 0.5, z: -0.35 },
    { id: 3, type: "box", label: "Armleuning L", w: 0.16, h: 0.45, d: 0.85, x: -0.97, y: 0.42, z: 0 },
    { id: 4, type: "box", label: "Armleuning R", w: 0.16, h: 0.45, d: 0.85, x: 0.97, y: 0.42, z: 0 },
  ],
  salontafel: [
    { id: 1, type: "box", label: "Blad", w: 1.0, h: 0.04, d: 0.6, x: 0, y: 0.36, z: 0 },
    { id: 2, type: "cyl", label: "Poot", w: 0.04, h: 0.36, d: 0.04, x: 0, y: 0.18, z: 0 },
  ],
  kast: [
    { id: 1, type: "box", label: "Korpus", w: 1.0, h: 2.0, d: 0.45, x: 0, y: 1.0, z: 0 },
    { id: 2, type: "box", label: "Deur L", w: 0.48, h: 1.9, d: 0.02, x: -0.25, y: 1.0, z: 0.24 },
    { id: 3, type: "box", label: "Deur R", w: 0.48, h: 1.9, d: 0.02, x: 0.25, y: 1.0, z: 0.24 },
  ],
  default: [
    { id: 1, type: "box", label: "Blok", w: 0.6, h: 0.6, d: 0.6, x: 0, y: 0.3, z: 0 },
  ],
};

export function initCustomFromItem(item) {
  const tpl = CUSTOM_TEMPLATES[item.type] || CUSTOM_TEMPLATES.default;
  _partId = Math.max(_partId, ...tpl.map((p) => p.id + 1), 1);
  return {
    parts: tpl.map((p) => ({ ...p, id: newPartId() })),
  };
}

function addBox(g, part, m) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(part.w, part.h, part.d), m);
  mesh.position.set(part.x, part.y, part.z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  g.add(mesh);
}

function addCyl(g, part, m) {
  const r = part.w / 2;
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, part.h, 16), m);
  mesh.position.set(part.x, part.y, part.z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  g.add(mesh);
}

/** Bouw meubel uit custom onderdelen (tekenomgeving). */
export function buildFromCustom(parts, defaultColor) {
  const g = new THREE.Group();
  parts.forEach((part) => {
    const fabric = mat(part.color || defaultColor || "#C9B8A3", 0.9);
    if (part.type === "cyl") addCyl(g, part, fabric);
    else addBox(g, part, fabric);
  });
  return g;
}

export function createPart(type = "box", label = "Nieuw onderdeel") {
  return {
    id: newPartId(),
    type,
    label,
    w: 0.5,
    h: 0.4,
    d: 0.5,
    x: 0,
    y: 0.2,
    z: 0,
  };
}
