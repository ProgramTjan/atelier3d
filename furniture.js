import * as THREE from "three";
import { shade } from "./textures.js";

export const mat = (c, rough = 0.85) =>
  new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: 0.05 });

const box = (w, h, d, m, x = 0, y = 0, z = 0) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};
const cyl = (rT, rB, h, m, x = 0, y = 0, z = 0, seg = 20) => {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rT, rB, h, seg), m);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};
const ell = (r, h, m, x, y, z, sx, seg = 30) => {
  const mesh = cyl(r, r, h, m, x, y, z, seg);
  mesh.scale.x = sx;
  return mesh;
};
const tube = (p1, p2, r, m) => {
  const a = new THREE.Vector3(...p1), b = new THREE.Vector3(...p2);
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), m);
  mesh.position.copy(a).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  mesh.castShadow = true;
  return mesh;
};
const shell = (r, h, m, x, y, z) => {
  m.side = THREE.DoubleSide;
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r * 0.92, h, 24, 1, true, Math.PI / 2, Math.PI), m
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  return mesh;
};

const WOOD = "#8B6B4A";
const DARKWOOD = "#5C4632";
const METAL = "#3A3A3C";

export function buildFurniture(type, color, v = 0) {
  const g = new THREE.Group();
  const c = color || "#C9B8A3";
  const fabric = mat(c, 0.95);
  const wood = mat(WOOD, 0.7);
  const dark = mat(DARKWOOD, 0.6);
  const metal = mat(METAL, 0.4);
  const white = mat("#F4F2EE", 0.35);
  const chrome = new THREE.MeshStandardMaterial({ color: "#C8CCD0", roughness: 0.25, metalness: 0.85 });
  const legs4 = (pts, h = 0.12) =>
    pts.forEach(([x, z]) => g.add(cyl(0.02, 0.015, h, metal, x, h / 2, z, 10)));
  const addBulbLight = (x, y, z, intensity = 0.5, dist = 4.5) => {
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 12, 10),
      new THREE.MeshStandardMaterial({ color: "#FFE9B8", emissive: "#FFD98A", emissiveIntensity: 1.4 })
    );
    bulb.position.set(x, y, z);
    bulb.userData.glow = 1.4;
    g.add(bulb);
    const light = new THREE.PointLight(0xffe2ae, intensity, dist, 2);
    light.position.set(x, y + 0.04, z);
    light.userData.baseIntensity = intensity;
    g.add(light);
  };

  switch (type) {
    case "bank": {
      if (v === 1) {
        g.add(box(1.85, 0.32, 0.9, fabric, 0, 0.22, 0));
        g.add(box(0.85, 0.12, 0.78, mat(c, 0.98), -0.45, 0.42, 0.04));
        g.add(box(0.85, 0.12, 0.78, mat(c, 0.98), 0.45, 0.42, 0.04));
        g.add(box(1.85, 0.42, 0.2, fabric, 0, 0.5, -0.35));
        const armL = cyl(0.17, 0.17, 0.9, fabric, -1.0, 0.42, 0, 18);
        armL.rotation.x = Math.PI / 2;
        g.add(armL);
        const armR = cyl(0.17, 0.17, 0.9, fabric, 1.0, 0.42, 0, 18);
        armR.rotation.x = Math.PI / 2;
        g.add(armR);
        g.add(box(2.3, 0.06, 0.9, wood, 0, 0.06, 0));
      } else if (v === 2) {
        g.add(box(2.1, 0.22, 0.85, wood, 0, 0.2, 0));
        g.add(box(0.85, 0.22, 0.7, wood, 0.6, 0.2, 0.75));
        g.add(box(1.0, 0.14, 0.75, fabric, -0.52, 0.39, 0.03));
        g.add(box(0.95, 0.14, 1.45, fabric, 0.55, 0.39, 0.38));
        g.add(box(2.1, 0.55, 0.18, fabric, 0, 0.55, -0.36));
        g.add(box(0.16, 0.45, 0.85, fabric, -0.97, 0.45, 0));
        legs4([[-0.95, -0.35], [0.95, -0.35], [-0.95, 0.35], [0.95, 1.0]]);
      } else {
        g.add(box(2.1, 0.22, 0.85, wood, 0, 0.2, 0));
        g.add(box(1.0, 0.14, 0.75, fabric, -0.52, 0.39, 0.03));
        g.add(box(1.0, 0.14, 0.75, fabric, 0.52, 0.39, 0.03));
        g.add(box(2.1, 0.55, 0.18, fabric, 0, 0.55, -0.36));
        g.add(box(0.95, 0.3, 0.12, mat(c, 0.98), -0.5, 0.62, -0.27));
        g.add(box(0.95, 0.3, 0.12, mat(c, 0.98), 0.5, 0.62, -0.27));
        g.add(box(0.16, 0.45, 0.85, fabric, -0.97, 0.45, 0));
        g.add(box(0.16, 0.45, 0.85, fabric, 0.97, 0.45, 0));
        legs4([[-0.95, -0.35], [0.95, -0.35], [-0.95, 0.35], [0.95, 0.35]]);
      }
      break;
    }
    case "fauteuil": {
      if (v === 1) {
        g.add(shell(0.4, 0.6, mat(c, 0.9), 0, 0.62, 0));
        g.add(cyl(0.38, 0.38, 0.1, fabric, 0, 0.42, 0, 24));
        g.add(cyl(0.32, 0.32, 0.06, mat(c, 0.98), 0, 0.5, 0.03, 22));
        [[0.26, 0.26], [-0.26, 0.26], [0.26, -0.26], [-0.26, -0.26]].forEach(([x, z]) =>
          g.add(tube([x * 0.4, 0.4, z * 0.4], [x, 0, z], 0.013, metal)));
      } else if (v === 2) {
        g.add(box(0.6, 0.08, 0.6, mat(c, 0.95), 0, 0.4, 0.02));
        const back = box(0.6, 0.55, 0.07, mat(c, 0.95), 0, 0.7, -0.28);
        back.rotation.x = -0.12;
        g.add(back);
        g.add(box(0.55, 0.04, 0.06, wood, 0, 0.58, 0.3));
        g.add(box(0.06, 0.04, 0.62, wood, -0.32, 0.58, 0));
        g.add(box(0.06, 0.04, 0.62, wood, 0.32, 0.58, 0));
        [[-0.29, -0.27], [0.29, -0.27], [-0.29, 0.27], [0.29, 0.27]].forEach(([x, z]) =>
          g.add(box(0.05, 0.58, 0.05, wood, x, 0.29, z)));
      } else {
        g.add(box(0.8, 0.2, 0.75, wood, 0, 0.2, 0));
        g.add(box(0.62, 0.13, 0.62, fabric, 0, 0.37, 0.03));
        g.add(box(0.8, 0.52, 0.16, fabric, 0, 0.52, -0.3));
        g.add(box(0.12, 0.4, 0.75, fabric, -0.34, 0.42, 0));
        g.add(box(0.12, 0.4, 0.75, fabric, 0.34, 0.42, 0));
        legs4([[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]]);
      }
      break;
    }
    case "salontafel": {
      if (v === 1) {
        g.add(box(1.15, 0.05, 0.6, mat(c, 0.5), 0, 0.38, 0));
        g.add(box(0.06, 0.36, 0.55, mat(c, 0.55), -0.5, 0.18, 0));
        g.add(box(0.06, 0.36, 0.55, mat(c, 0.55), 0.5, 0.18, 0));
        g.add(box(0.95, 0.04, 0.5, mat(c, 0.6), 0, 0.1, 0));
      } else if (v === 2) {
        g.add(cyl(0.4, 0.4, 0.035, mat(c, 0.5), -0.18, 0.4, 0, 26));
        g.add(cyl(0.035, 0.04, 0.4, mat(c, 0.6), -0.18, 0.2, 0, 14));
        g.add(cyl(0.26, 0.26, 0.03, dark, 0.38, 0.28, 0.25, 22));
        g.add(cyl(0.03, 0.035, 0.28, dark, 0.38, 0.14, 0.25, 12));
      } else {
        g.add(cyl(0.45, 0.45, 0.04, mat(c, 0.5), 0, 0.36, 0, 28));
        g.add(cyl(0.4, 0.4, 0.025, mat(c, 0.5), 0, 0.18, 0, 28));
        [0, 120, 240].forEach((a) => {
          const r = (a * Math.PI) / 180;
          g.add(cyl(0.015, 0.015, 0.36, metal, Math.cos(r) * 0.32, 0.18, Math.sin(r) * 0.32, 8));
        });
      }
      break;
    }
    case "eettafel": {
      if (v === 1) {
        g.add(cyl(0.62, 0.62, 0.05, mat(c, 0.5), 0, 0.74, 0, 30));
        g.add(cyl(0.08, 0.1, 0.66, dark, 0, 0.4, 0, 16));
        g.add(cyl(0.3, 0.34, 0.05, dark, 0, 0.045, 0, 24));
      } else {
        g.add(box(1.6, 0.05, 0.9, mat(c, 0.5), 0, 0.74, 0));
        [[-0.72, -0.38], [0.72, -0.38], [-0.72, 0.38], [0.72, 0.38]].forEach(([x, z]) =>
          g.add(box(0.06, 0.72, 0.06, dark, x, 0.36, z)));
      }
      break;
    }
    case "stoel": {
      if (v === 1) {
        g.add(shell(0.24, 0.42, mat(c, 0.8), 0, 0.6, 0));
        g.add(cyl(0.23, 0.23, 0.05, mat(c, 0.8), 0, 0.44, 0.02, 20));
        [[0.16, 0.16], [-0.16, 0.16], [0.16, -0.16], [-0.16, -0.16]].forEach(([x, z]) =>
          g.add(tube([x * 0.5, 0.43, z * 0.5], [x, 0, z], 0.011, metal)));
      } else if (v === 2) {
        g.add(box(0.42, 0.04, 0.42, wood, 0, 0.45, 0));
        g.add(box(0.42, 0.05, 0.05, wood, 0, 0.88, -0.19));
        [-0.13, 0, 0.13].forEach((x) =>
          g.add(box(0.03, 0.4, 0.03, wood, x, 0.66, -0.19)));
        [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]].forEach(([x, z]) =>
          g.add(box(0.035, 0.45, 0.035, wood, x, 0.225, z)));
      } else {
        g.add(box(0.42, 0.04, 0.42, mat(c, 0.7), 0, 0.45, 0));
        g.add(box(0.42, 0.42, 0.04, mat(c, 0.7), 0, 0.68, -0.19));
        [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]].forEach(([x, z]) =>
          g.add(cyl(0.015, 0.012, 0.45, metal, x, 0.225, z, 8)));
      }
      break;
    }
    case "bed": {
      if (v === 1) {
        g.add(box(2.2, 0.14, 2.3, dark, 0, 0.09, 0.05));
        g.add(box(1.6, 0.16, 2.0, mat("#EDE8DF", 0.95), 0, 0.25, 0.04));
        g.add(box(1.6, 0.1, 1.2, fabric, 0, 0.33, 0.05));
        g.add(box(0.55, 0.1, 0.32, mat("#F4F1EA", 1), -0.4, 0.36, -0.72));
        g.add(box(0.55, 0.1, 0.32, mat("#F4F1EA", 1), 0.4, 0.36, -0.72));
        g.add(box(2.2, 0.45, 0.08, dark, 0, 0.38, -1.1));
        g.add(box(0.4, 0.1, 0.35, wood, -1.25, 0.4, -0.85));
        g.add(box(0.4, 0.1, 0.35, wood, 1.25, 0.4, -0.85));
      } else {
        g.add(box(1.7, 0.25, 2.15, wood, 0, 0.18, 0));
        g.add(box(1.6, 0.18, 2.0, mat("#EDE8DF", 0.95), 0, 0.4, 0.04));
        g.add(box(1.6, 0.12, 0.6, fabric, 0, 0.47, 0.6));
        g.add(box(1.6, 0.1, 1.1, fabric, 0, 0.5, -0.1));
        g.add(box(0.6, 0.12, 0.35, mat("#F4F1EA", 1), -0.42, 0.53, -0.78));
        g.add(box(0.6, 0.12, 0.35, mat("#F4F1EA", 1), 0.42, 0.53, -0.78));
        g.add(box(1.7, 0.85, 0.1, wood, 0, 0.55, -1.07));
      }
      break;
    }
    case "kast": {
      if (v === 1) {
        g.add(box(1.0, 1.9, 0.5, mat(c, 0.6), 0, 1.05, 0));
        g.add(box(0.46, 1.78, 0.02, mat(c, 0.45), -0.245, 1.05, 0.255));
        g.add(box(0.46, 1.78, 0.02, mat(c, 0.45), 0.245, 1.05, 0.255));
        g.add(cyl(0.011, 0.011, 0.16, metal, -0.05, 1.05, 0.27, 8));
        g.add(cyl(0.011, 0.011, 0.16, metal, 0.05, 1.05, 0.27, 8));
        [[-0.42, -0.18], [0.42, -0.18], [-0.42, 0.18], [0.42, 0.18]].forEach(([x, z]) =>
          g.add(cyl(0.02, 0.015, 0.12, metal, x, 0.06, z, 8)));
      } else {
        g.add(box(1.6, 0.7, 0.45, mat(c, 0.6), 0, 0.5, 0));
        g.add(box(0.76, 0.6, 0.02, mat(c, 0.4), -0.41, 0.5, 0.23));
        g.add(box(0.76, 0.6, 0.02, mat(c, 0.4), 0.41, 0.5, 0.23));
        g.add(cyl(0.012, 0.012, 0.1, metal, -0.06, 0.5, 0.25, 8));
        g.add(cyl(0.012, 0.012, 0.1, metal, 0.06, 0.5, 0.25, 8));
        [[-0.7, -0.16], [0.7, -0.16], [-0.7, 0.16], [0.7, 0.16]].forEach(([x, z]) =>
          g.add(cyl(0.02, 0.015, 0.15, metal, x, 0.075, z, 8)));
        g.add(cyl(0.1, 0.13, 0.18, mat("#7E8C6A", 0.9), 0.5, 0.94, 0, 12));
      }
      break;
    }
    case "boekenkast": {
      const frame = mat(c, 0.6);
      const bookCols = ["#A3552F", "#4A6B4F", "#7A8CA3", "#C2A98B", "#46484C", "#8A5A6B"];
      let seed = 7;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      const addBooks = (shelfY, x0, x1, sparse) => {
        let x = x0;
        while (x < x1) {
          const w = 0.04 + rnd() * 0.05;
          const h = 0.22 + rnd() * 0.14;
          g.add(box(w, h, 0.2, mat(bookCols[Math.floor(rnd() * bookCols.length)], 0.9),
            x + w / 2, shelfY + 0.02 + h / 2, 0));
          x += w + 0.012;
          if (rnd() > (sparse ? 0.6 : 0.78)) x += sparse ? 0.18 : 0.1;
        }
      };
      if (v === 1) {
        g.add(box(0.04, 1.9, 0.3, metal, -0.55, 0.95, 0));
        g.add(box(0.04, 1.9, 0.3, metal, 0.55, 0.95, 0));
        [0.3, 0.78, 1.26, 1.74].forEach((y) => g.add(box(1.18, 0.035, 0.3, frame, 0, y, 0)));
        [0.32, 0.8, 1.28].forEach((y) => addBooks(y, -0.5, 0.3, true));
        g.add(cyl(0.07, 0.09, 0.12, mat("#7E8C6A", 0.9), 0.4, 1.82, 0, 12));
      } else {
        g.add(box(1.1, 0.04, 0.32, frame, 0, 0.02, 0));
        [0.45, 0.9, 1.35, 1.8].forEach((y) => g.add(box(1.1, 0.04, 0.32, frame, 0, y, 0)));
        g.add(box(0.04, 1.82, 0.32, frame, -0.53, 0.91, 0));
        g.add(box(0.04, 1.82, 0.32, frame, 0.53, 0.91, 0));
        [0.04, 0.47, 0.92, 1.37].forEach((y) => addBooks(y, -0.48, 0.42, false));
      }
      break;
    }
    case "tvmeubel": {
      if (v === 1) {
        g.add(box(1.7, 0.32, 0.36, mat(c, 0.6), 0, 0.5, 0));
        g.add(box(1.35, 0.78, 0.04, mat("#161618", 0.3), 0, 1.35, -0.1));
      } else {
        g.add(box(1.8, 0.4, 0.4, mat(c, 0.6), 0, 0.28, 0));
        [[-0.8, -0.14], [0.8, -0.14], [-0.8, 0.14], [0.8, 0.14]].forEach(([x, z]) =>
          g.add(cyl(0.018, 0.014, 0.16, metal, x, 0.08, z, 8)));
        g.add(box(1.25, 0.72, 0.04, mat("#161618", 0.3), 0, 0.9, -0.05));
        g.add(box(0.3, 0.04, 0.18, metal, 0, 0.5, -0.05));
      }
      break;
    }
    case "vloerlamp": {
      if (v === 1) {
        g.add(cyl(0.18, 0.2, 0.05, metal, 0.6, 0.025, 0, 18));
        g.add(tube([0.6, 0.05, 0], [0.05, 1.82, 0], 0.014, metal));
        g.add(tube([0.05, 1.82, 0], [-0.35, 1.78, 0], 0.012, metal));
        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(0.16, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
          mat(c, 0.9)
        );
        dome.material.side = THREE.DoubleSide;
        dome.position.set(-0.36, 1.72, 0);
        dome.castShadow = true;
        g.add(dome);
        addBulbLight(-0.36, 1.66, 0);
      } else if (v === 2) {
        [[0.26, 0], [-0.13, 0.22], [-0.13, -0.22]].forEach(([x, z]) =>
          g.add(tube([0, 1.05, 0], [x, 0, z], 0.013, mat(WOOD, 0.7))));
        g.add(cyl(0.17, 0.22, 0.3, mat(c, 0.9), 0, 1.22, 0, 20));
        addBulbLight(0, 1.12, 0);
      } else {
        g.add(cyl(0.16, 0.18, 0.03, metal, 0, 0.015, 0, 18));
        g.add(cyl(0.014, 0.014, 1.45, metal, 0, 0.75, 0, 10));
        g.add(cyl(0.14, 0.2, 0.28, mat(c, 0.9), 0, 1.55, 0, 20));
        addBulbLight(0, 1.46, 0);
      }
      break;
    }
    case "wandlamp": {
      // tegen de wand (rug aan -z)
      g.add(box(0.1, 0.18, 0.025, metal, 0, 1.6, 0));
      g.add(tube([0, 1.68, 0.01], [0, 1.74, 0.13], 0.011, metal));
      const shade2 = cyl(0.07, 0.1, 0.13, mat(c, 0.9), 0, 1.7, 0.15, 16);
      g.add(shade2);
      addBulbLight(0, 1.63, 0.15, 0.35, 3);
      break;
    }
    case "schilderij": {
      // tegen de wand (rug aan -z)
      const artTexture = () => {
        const cv = document.createElement("canvas");
        cv.width = cv.height = 256;
        const ctx = cv.getContext("2d");
        ctx.fillStyle = "#EFEAE0";
        ctx.fillRect(0, 0, 256, 256);
        const cols = [c, "#46484C", "#C2A98B", "#7A8CA3", "#A3552F"];
        let seed = 13 + (parseInt(c.slice(1), 16) % 97);
        const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
        for (let i = 0; i < 6; i++) {
          ctx.fillStyle = cols[Math.floor(rnd() * cols.length)];
          ctx.globalAlpha = 0.55 + rnd() * 0.4;
          if (rnd() > 0.45) {
            ctx.beginPath();
            ctx.arc(35 + rnd() * 186, 35 + rnd() * 186, 18 + rnd() * 55, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(rnd() * 150, rnd() * 150, 35 + rnd() * 90, 35 + rnd() * 90);
          }
        }
        ctx.globalAlpha = 1;
        return new THREE.CanvasTexture(cv);
      };
      const frame = mat(DARKWOOD, 0.5);
      const addPainting = (w, h, x, y) => {
        g.add(box(w + 0.07, h + 0.07, 0.035, frame, x, y, 0));
        const m = new THREE.MeshStandardMaterial({ map: artTexture(), roughness: 0.85 });
        const p = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.02), m);
        p.position.set(x, y, 0.013);
        p.castShadow = true;
        g.add(p);
      };
      if (v === 1) {
        addPainting(0.5, 0.65, -0.33, 1.45);
        addPainting(0.5, 0.42, 0.33, 1.56);
      } else {
        addPainting(0.95, 0.7, 0, 1.5);
      }
      break;
    }
    case "gordijnen": {
      // raambreed gordijn (rug aan -z), rail bovenaan
      g.add(box(1.75, 0.035, 0.035, metal, 0, 2.44, 0.04));
      const panel = (x) => {
        g.add(box(0.36, 2.32, 0.07, fabric, x, 1.26, 0.04));
        g.add(box(0.1, 2.32, 0.075, mat(shade(c, -0.07), 0.95), x - 0.13, 1.26, 0.042));
        g.add(box(0.1, 2.32, 0.075, mat(shade(c, 0.05), 0.95), x + 0.13, 1.26, 0.042));
      };
      panel(-0.66);
      panel(0.66);
      const sheerMat = new THREE.MeshStandardMaterial({
        color: "#F4F2EC", transparent: true, opacity: 0.3, roughness: 0.9,
      });
      const sheer = new THREE.Mesh(new THREE.BoxGeometry(0.95, 2.28, 0.015), sheerMat);
      sheer.position.set(0, 1.26, 0.025);
      g.add(sheer);
      break;
    }
    case "plant": {
      g.add(cyl(0.14, 0.17, 0.32, mat("#B8866B", 0.9), 0, 0.16, 0, 16));
      const leaf = mat(c || "#4A6B4F", 0.9);
      if (v === 1) {
        g.add(cyl(0.025, 0.035, 1.0, mat("#5A4632", 0.9), 0, 0.78, 0, 8));
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const frond = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), leaf);
          frond.scale.set(1.7, 0.22, 0.45);
          frond.position.set(Math.cos(a) * 0.3, 1.3 + (i % 2) * 0.1, Math.sin(a) * 0.3);
          frond.rotation.y = -a;
          frond.rotation.z = 0.35;
          frond.castShadow = true;
          g.add(frond);
        }
      } else {
        g.add(cyl(0.02, 0.025, 0.35, mat("#5A4632", 0.9), 0, 0.45, 0, 8));
        [[0, 0.78, 0, 0.26], [-0.18, 0.66, 0.08, 0.17], [0.17, 0.7, -0.06, 0.18],
         [0.05, 0.95, 0.1, 0.16], [-0.08, 0.9, -0.12, 0.15]].forEach(([x, y, z, r]) => {
          const s = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), leaf);
          s.position.set(x, y, z);
          s.castShadow = true;
          g.add(s);
        });
      }
      break;
    }
    case "vloerkleed": {
      if (v === 1) {
        const base = box(2.0, 0.014, 1.4, mat(c, 1), 0, 0.007, 0);
        base.castShadow = false;
        g.add(base);
        const inner = box(1.7, 0.016, 1.1, mat(shade(c, -0.06), 1), 0, 0.008, 0);
        inner.castShadow = false;
        g.add(inner);
      } else {
        const rug = cyl(1.05, 1.05, 0.015, mat(c, 1), 0, 0.008, 0, 36);
        rug.castShadow = false;
        g.add(rug);
        const inner = cyl(0.8, 0.8, 0.017, mat(shade(c, -0.06), 1), 0, 0.009, 0, 36);
        inner.castShadow = false;
        g.add(inner);
      }
      break;
    }

    case "bureau": {
      if (v === 1) {
        // slank bureau op schuine metalen poten
        g.add(box(1.2, 0.04, 0.55, mat(c, 0.5), 0, 0.73, 0));
        [[-0.55, -0.24], [-0.55, 0.24], [0.55, -0.24], [0.55, 0.24]].forEach(([x, z]) =>
          g.add(tube([x * 0.8, 0.71, z * 0.7], [x, 0, z], 0.013, metal)));
        g.add(box(1.0, 0.03, 0.28, mat(c, 0.6), 0, 0.28, -0.08));
      } else {
        // bureau met ladeblok
        g.add(box(1.3, 0.05, 0.6, mat(c, 0.5), 0, 0.74, 0));
        g.add(box(0.42, 0.62, 0.55, mat(c, 0.6), 0.42, 0.41, 0));
        [0.58, 0.41, 0.24].forEach((y) => {
          g.add(box(0.36, 0.012, 0.012, dark, 0.42, y, 0.28));
          g.add(cyl(0.009, 0.009, 0.05, metal, 0.42, y + 0.08, 0.285, 8));
        });
        g.add(box(0.05, 0.7, 0.55, mat(c, 0.6), -0.6, 0.37, 0));
      }
      // laptop op het blad
      g.add(box(0.32, 0.015, 0.22, mat("#2A2A2E", 0.4), -0.25, 0.765, 0.02));
      const scr = box(0.32, 0.22, 0.012, mat("#3A4250", 0.3), -0.25, 0.86, -0.08);
      scr.rotation.x = -0.3;
      g.add(scr);
      break;
    }
    case "bureaustoel": {
      g.add(cyl(0.26, 0.26, 0.08, fabric, 0, 0.48, 0, 22));
      g.add(shell(0.24, 0.42, mat(c, 0.9), 0, 0.78, -0.05));
      g.add(cyl(0.022, 0.022, 0.3, metal, 0, 0.32, 0, 10));
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const ex = Math.cos(a) * 0.27, ez = Math.sin(a) * 0.27;
        g.add(tube([0, 0.17, 0], [ex, 0.04, ez], 0.013, metal));
        const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), metal);
        wheel.position.set(ex, 0.028, ez);
        wheel.castShadow = true;
        g.add(wheel);
      }
      break;
    }
    case "hanglamp": {
      g.add(cyl(0.05, 0.05, 0.02, metal, 0, 2.58, 0, 12));
      if (v === 1) {
        // drietal kegels aan een balk
        g.add(box(0.74, 0.022, 0.06, metal, 0, 2.56, 0));
        [[-0.3, 1.95], [0, 1.78], [0.3, 1.95]].forEach(([x, y], i) => {
          g.add(cyl(0.004, 0.004, 2.56 - y - 0.07, metal, x, (2.56 + y) / 2, 0, 6));
          g.add(cyl(0.025, 0.1, 0.15, mat(c, 0.85), x, y, 0, 16));
          const bulb = new THREE.Mesh(
            new THREE.SphereGeometry(0.03, 10, 8),
            new THREE.MeshStandardMaterial({ color: "#FFE9B8", emissive: "#FFD98A", emissiveIntensity: 1.4 })
          );
          bulb.position.set(x, y - 0.085, 0);
          bulb.userData.glow = 1.4;
          g.add(bulb);
          if (i === 1) {
            const light = new THREE.PointLight(0xffe2ae, 0.55, 4.5, 2);
            light.position.set(0, y - 0.1, 0);
            light.userData.baseIntensity = 0.55;
            g.add(light);
          }
        });
      } else {
        // koepel-hanglamp
        g.add(cyl(0.006, 0.006, 0.62, metal, 0, 2.27, 0, 6));
        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2),
          mat(c, 0.85)
        );
        dome.material.side = THREE.DoubleSide;
        dome.position.set(0, 1.93, 0);
        dome.castShadow = true;
        g.add(dome);
        addBulbLight(0, 1.88, 0, 0.55);
      }
      break;
    }
    case "poef": {
      if (v === 1) {
        g.add(box(0.6, 0.3, 0.6, fabric, 0, 0.23, 0));
        g.add(box(0.56, 0.08, 0.56, mat(shade(c, 0.05), 0.98), 0, 0.41, 0));
        [[-0.24, -0.24], [0.24, -0.24], [-0.24, 0.24], [0.24, 0.24]].forEach(([x, z]) =>
          g.add(box(0.05, 0.08, 0.05, wood, x, 0.04, z)));
      } else {
        g.add(cyl(0.34, 0.36, 0.34, fabric, 0, 0.21, 0, 24));
        g.add(cyl(0.31, 0.31, 0.05, mat(shade(c, 0.05), 0.98), 0, 0.4, 0, 22));
        g.add(cyl(0.35, 0.35, 0.03, wood, 0, 0.025, 0, 24));
      }
      break;
    }
    case "spiegel": {
      // staande, leunende spiegel (rug aan -z)
      const mirSurf = new THREE.MeshStandardMaterial({ color: "#C9DCE4", roughness: 0.05, metalness: 0.6 });
      const lean = new THREE.Group();
      const frame = box(0.55, 1.78, 0.04, mat(c, 0.55), 0, 0.89, 0);
      lean.add(frame);
      const mir = new THREE.Mesh(new THREE.BoxGeometry(0.46, 1.68, 0.02), mirSurf);
      mir.position.set(0, 0.89, 0.014);
      lean.add(mir);
      lean.rotation.x = -0.09;
      lean.position.z = 0.02;
      g.add(lean);
      break;
    }
    case "wandplank": {
      // zwevende plank met decoratie (rug aan -z)
      g.add(box(0.95, 0.035, 0.22, wood, 0, 1.35, 0));
      g.add(box(0.05, 0.05, 0.18, metal, -0.35, 1.31, 0));
      g.add(box(0.05, 0.05, 0.18, metal, 0.35, 1.31, 0));
      // boekjes
      [[-0.36, 0.05, "#A3552F"], [-0.3, 0.045, "#4A6B4F"], [-0.245, 0.05, "#7A8CA3"]].forEach(([x, w, col]) =>
        g.add(box(w, 0.2, 0.15, mat(col, 0.9), x, 1.47, 0)));
      // plantje
      g.add(cyl(0.05, 0.06, 0.09, mat("#B8866B", 0.9), 0.02, 1.42, 0, 12));
      const blob = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), mat("#4A6B4F", 0.9));
      blob.position.set(0.02, 1.52, 0);
      blob.castShadow = true;
      g.add(blob);
      // fotolijstje
      g.add(box(0.16, 0.2, 0.015, dark, 0.3, 1.47, 0));
      g.add(box(0.12, 0.16, 0.012, mat(c, 0.8), 0.3, 1.47, 0.006));
      break;
    }
    case "kledingrek": {
      g.add(cyl(0.015, 0.015, 1.6, metal, -0.5, 0.8, 0, 8));
      g.add(cyl(0.015, 0.015, 1.6, metal, 0.5, 0.8, 0, 8));
      const bar = cyl(0.013, 0.013, 1.06, metal, 0, 1.58, 0, 8);
      bar.rotation.z = Math.PI / 2;
      g.add(bar);
      g.add(box(0.05, 0.025, 0.44, metal, -0.5, 0.013, 0));
      g.add(box(0.05, 0.025, 0.44, metal, 0.5, 0.013, 0));
      // hangende kleding
      [[-0.3, c], [-0.08, shade(c, 0.12)], [0.16, "#7A8CA3"], [0.36, "#46484C"]].forEach(([x, col]) => {
        g.add(cyl(0.006, 0.006, 0.05, metal, x, 1.555, 0, 6));
        g.add(box(0.17, 0.52, 0.03, mat(col, 0.95), x, 1.26, 0));
      });
      break;
    }
    case "haard": {
      // elektrische haard (rug aan -z)
      g.add(box(1.1, 1.0, 0.32, mat(c, 0.8), 0, 0.5, 0));
      g.add(box(1.2, 0.05, 0.38, white, 0, 1.02, 0));
      g.add(box(0.62, 0.56, 0.05, mat("#141414", 0.9), 0, 0.4, 0.15));
      const fire = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.3, 0.02),
        new THREE.MeshStandardMaterial({ color: "#FF8A3C", emissive: "#FF6A1F", emissiveIntensity: 1.5 })
      );
      fire.position.set(0, 0.32, 0.16);
      fire.userData.glow = 1.5;
      g.add(fire);
      [[-0.12, 0.2], [0.1, 0.18]].forEach(([x, y]) => {
        const log = cyl(0.035, 0.035, 0.34, dark, x, y, 0.17, 10);
        log.rotation.z = Math.PI / 2;
        g.add(log);
      });
      const fireLight = new THREE.PointLight(0xff9a4a, 0.45, 3.5, 2);
      fireLight.position.set(0, 0.45, 0.45);
      fireLight.userData.baseIntensity = 0.45;
      g.add(fireLight);
      break;
    }

    /* ---------- Badkamer ---------- */
    case "bad": {
      if (v === 1) {
        g.add(ell(0.42, 0.56, mat(c, 0.45), 0, 0.3, 0, 2.05));
        g.add(ell(0.45, 0.05, white, 0, 0.585, 0, 2.05));
        g.add(ell(0.36, 0.02, mat("#CFE0E2", 0.15), 0, 0.6, 0, 2.0));
        g.add(cyl(0.018, 0.022, 0.95, chrome, 1.05, 0.48, 0, 10));
        const arm = cyl(0.012, 0.012, 0.22, chrome, 0.93, 0.93, 0, 8);
        arm.rotation.z = Math.PI / 2;
        g.add(arm);
        g.add(cyl(0.025, 0.018, 0.05, chrome, 0.83, 0.9, 0, 10));
      } else {
        const panel = mat(c, 0.45);
        g.add(box(1.7, 0.5, 0.74, panel, 0, 0.28, 0));
        g.add(box(1.78, 0.09, 0.82, white, 0, 0.565, 0));
        g.add(box(1.5, 0.03, 0.56, mat("#CFE0E2", 0.15), 0, 0.6, 0));
        g.add(box(0.1, 0.04, 0.82, white, -0.84, 0.59, 0));
        g.add(box(0.1, 0.04, 0.82, white, 0.84, 0.59, 0));
        g.add(box(1.78, 0.04, 0.1, white, 0, 0.59, -0.36));
        g.add(box(1.78, 0.04, 0.1, white, 0, 0.59, 0.36));
        g.add(cyl(0.018, 0.018, 0.28, chrome, 0.72, 0.72, 0, 10));
        const arm = cyl(0.013, 0.013, 0.18, chrome, 0.63, 0.85, 0, 8);
        arm.rotation.z = Math.PI / 2;
        g.add(arm);
        g.add(cyl(0.025, 0.018, 0.04, chrome, 0.55, 0.83, 0, 10));
      }
      break;
    }
    case "douche": {
      g.add(box(1.0, 0.05, 1.0, white, 0, 0.025, 0));
      g.add(cyl(0.035, 0.035, 0.012, mat("#8E9296", 0.3), 0, 0.058, 0, 14));
      const glassMat = new THREE.MeshStandardMaterial({
        color: "#D6ECEE", transparent: true, opacity: 0.22, roughness: 0.08, metalness: 0,
      });
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.95, 1.0), glassMat);
      glass.position.set(0.49, 1.02, 0);
      g.add(glass);
      g.add(box(0.03, 1.95, 0.03, chrome, 0.49, 1.02, -0.49));
      g.add(box(0.03, 0.03, 1.0, chrome, 0.49, 1.99, 0));
      g.add(cyl(0.016, 0.016, 2.0, chrome, -0.42, 1.05, -0.42, 10));
      const arm = cyl(0.012, 0.012, 0.35, chrome, -0.26, 2.02, -0.42, 8);
      arm.rotation.z = Math.PI / 2;
      g.add(arm);
      g.add(cyl(0.1, 0.1, 0.02, chrome, -0.1, 2.0, -0.42, 16));
      g.add(box(0.12, 0.18, 0.04, chrome, -0.42, 1.1, -0.4));
      break;
    }
    case "wastafel": {
      const mirrorMat = new THREE.MeshStandardMaterial({ color: "#C9DCE4", roughness: 0.05, metalness: 0.6 });
      const addTap = (x) => {
        g.add(cyl(0.013, 0.013, 0.22, chrome, x, 0.95, -0.16, 8));
        const tap = cyl(0.01, 0.01, 0.14, chrome, x, 1.05, -0.09, 8);
        tap.rotation.x = Math.PI / 2;
        g.add(tap);
      };
      if (v === 1) {
        g.add(box(1.45, 0.42, 0.44, mat(c, 0.55), 0, 0.58, 0));
        [-0.54, -0.18, 0.18, 0.54].forEach((x) =>
          g.add(box(0.33, 0.36, 0.02, mat(c, 0.4), x, 0.58, 0.225)));
        g.add(box(1.5, 0.04, 0.48, white, 0, 0.81, 0));
        g.add(cyl(0.15, 0.12, 0.1, white, -0.38, 0.88, 0.02, 20));
        g.add(cyl(0.15, 0.12, 0.1, white, 0.38, 0.88, 0.02, 20));
        addTap(-0.38);
        addTap(0.38);
        const mirror = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.7, 0.015), mirrorMat);
        mirror.position.set(0, 1.55, -0.2);
        g.add(mirror);
        g.add(box(1.36, 0.76, 0.012, metal, 0, 1.55, -0.21));
      } else {
        g.add(box(0.85, 0.42, 0.44, mat(c, 0.55), 0, 0.58, 0));
        g.add(box(0.4, 0.36, 0.02, mat(c, 0.4), -0.21, 0.58, 0.225));
        g.add(box(0.4, 0.36, 0.02, mat(c, 0.4), 0.21, 0.58, 0.225));
        g.add(box(0.9, 0.04, 0.48, white, 0, 0.81, 0));
        g.add(cyl(0.17, 0.14, 0.11, white, 0, 0.885, 0.02, 22));
        addTap(0);
        const mirror = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.015, 28), mirrorMat);
        mirror.rotation.x = Math.PI / 2;
        mirror.position.set(0, 1.5, -0.2);
        g.add(mirror);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.012, 8, 30), mat(METAL, 0.4));
        ring.position.set(0, 1.5, -0.2);
        g.add(ring);
      }
      break;
    }
    case "toilet": {
      g.add(box(0.4, 0.38, 0.16, white, 0, 0.62, -0.2));
      g.add(box(0.09, 0.025, 0.06, chrome, 0, 0.82, -0.2));
      g.add(box(0.34, 0.4, 0.28, white, 0, 0.2, -0.04));
      g.add(cyl(0.19, 0.15, 0.16, white, 0, 0.33, 0.1, 20));
      g.add(cyl(0.21, 0.21, 0.035, white, 0, 0.425, 0.1, 20));
      g.add(box(0.36, 0.04, 0.1, white, 0, 0.45, -0.12));
      break;
    }
    case "handdoekrek": {
      g.add(cyl(0.013, 0.013, 1.25, chrome, -0.24, 0.72, 0, 8));
      g.add(cyl(0.013, 0.013, 1.25, chrome, 0.24, 0.72, 0, 8));
      [0.25, 0.42, 0.59, 0.95, 1.12, 1.29].forEach((y) => {
        const bar = cyl(0.011, 0.011, 0.48, chrome, 0, y, 0, 8);
        bar.rotation.z = Math.PI / 2;
        g.add(bar);
      });
      g.add(box(0.46, 0.52, 0.025, mat(c, 1), 0, 0.66, 0.035));
      g.add(box(0.46, 0.06, 0.06, mat(c, 1), 0, 0.93, 0.02));
      break;
    }
    case "wasmachine": {
      g.add(box(0.6, 0.85, 0.6, white, 0, 0.46, 0));
      const door = new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.026, 10, 28), chrome);
      door.position.set(0, 0.42, 0.305);
      g.add(door);
      const glas = cyl(0.16, 0.16, 0.02, mat("#2E3A44", 0.2), 0, 0.42, 0.3, 24);
      glas.rotation.x = Math.PI / 2;
      g.add(glas);
      g.add(box(0.56, 0.1, 0.02, mat("#E4E1DA", 0.5), 0, 0.81, 0.305));
      g.add(cyl(0.028, 0.028, 0.025, metal, -0.2, 0.81, 0.315, 14));
      g.add(box(0.14, 0.035, 0.012, mat("#9DA3AC", 0.4), 0.14, 0.81, 0.312));
      [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]].forEach(([x, z]) =>
        g.add(cyl(0.02, 0.02, 0.04, metal, x, 0.02, z, 8)));
      break;
    }
    case "wasmand": {
      g.add(cyl(0.2, 0.16, 0.46, mat(c, 0.95), 0, 0.23, 0, 18));
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.018, 8, 22), mat(shade(c, -0.08), 0.95));
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.46;
      g.add(rim);
      [0.14, 0.26, 0.38].forEach((y) => {
        const groove = new THREE.Mesh(new THREE.TorusGeometry(0.165 + y * 0.075, 0.008, 6, 20), mat(shade(c, -0.06), 1));
        groove.rotation.x = Math.PI / 2;
        groove.position.y = y;
        g.add(groove);
      });
      g.add(box(0.18, 0.07, 0.18, mat("#F4F2EE", 1), 0.05, 0.49, -0.02));
      break;
    }
    default:
      g.add(box(0.5, 0.5, 0.5, fabric, 0, 0.25, 0));
  }
  return g;
}
