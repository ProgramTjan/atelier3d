import { useRef, useEffect } from "react";
import * as THREE from "three";
import { ROOM_H } from "../constants.js";
import { makeWallTexture, makeFloorTexture, textSprite } from "../textures.js";
import { buildItem, mat } from "../furniture.js";
import { disposeObject3D } from "../lib/dispose.js";

export function useAtelierScene({
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
}) {
  const mountRef = useRef(null);
  const threeRef = useRef({});
  const footprintRef = useRef({});
  const dragRef = useRef(null);
  const pointersRef = useRef(new Map());
  const orbitRef = useRef({ theta: 0.7, phi: 1.12, radius: 7.4 });
  const prevOrbitRef = useRef(null);

  itemsRef.current = items;
  roomRef.current = { w: roomW, d: roomD };
  modeRef.current = mode;
  viewRef.current = view;

  /* ---------- Scene-initialisatie ---------- */
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#23262B");
    scene.fog = new THREE.Fog("#23262B", 14, 28);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 60);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.display = "block";

    const ambient = new THREE.AmbientLight(0xfff4e2, 0.45);
    scene.add(ambient);
    const hemi = new THREE.HemisphereLight(0xdde6f0, 0x6b5a48, 0.35);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff0d6, 1.05);
    sun.position.set(5, 7.5, 4.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -7; sun.shadow.camera.right = 7;
    sun.shadow.camera.top = 7; sun.shadow.camera.bottom = -7;
    sun.shadow.bias = -0.0004;
    scene.add(sun);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.02, 8, 40),
      new THREE.MeshBasicMaterial({ color: "#E8B45A" })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    ring.visible = false;
    scene.add(ring);

    const roomGroup = new THREE.Group();
    scene.add(roomGroup);
    const furnitureRoot = new THREE.Group();
    scene.add(furnitureRoot);

    threeRef.current = { scene, camera, renderer, roomGroup, furnitureRoot, ring, mount, ambient, hemi, sun };

    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const { theta, phi, radius } = orbitRef.current;
      const target = new THREE.Vector3(0, viewRef.current === "plan" ? 0 : 0.8, 0);
      camera.position.set(
        target.x + radius * Math.sin(phi) * Math.sin(theta),
        target.y + radius * Math.cos(phi),
        target.z + radius * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(target);
      const t = performance.now() / 600;
      ring.scale.setScalar(1 + Math.sin(t) * 0.03);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Kamer (her)bouwen ---------- */
  useEffect(() => {
    const { roomGroup } = threeRef.current;
    if (!roomGroup) return;
    while (roomGroup.children.length) {
      const ch = roomGroup.children[0];
      disposeObject3D(ch);
      roomGroup.remove(ch);
    }

    const W = roomW, D = roomD;
    const night = lighting === "avond";

    const floorTex = makeFloorTexture(floorFinish, floorColor);
    const floorMat = new THREE.MeshStandardMaterial({
      color: floorTex ? "#FFFFFF" : floorColor,
      map: floorTex || null,
      roughness: floorFinish === "glad" ? 0.45 : 0.8,
      metalness: 0.03,
    });
    if (floorTex) floorTex.repeat.set(W / 1.2, D / 1.2);
    const floor = new THREE.Mesh(new THREE.BoxGeometry(W, 0.12, D), floorMat);
    floor.position.y = -0.06;
    floor.receiveShadow = true;
    roomGroup.add(floor);

    const mkWallMat = (len) => {
      const tex = makeWallTexture(wallFinish, wallColor);
      const m = new THREE.MeshStandardMaterial({
        color: tex ? "#FFFFFF" : wallColor,
        map: tex || null,
        roughness: wallFinish === "verf" ? 0.95 : 0.35,
        metalness: 0.02,
      });
      if (tex) tex.repeat.set(len / 1.2, ROOM_H / 1.2);
      return m;
    };
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(W, ROOM_H, 0.12), mkWallMat(W));
    backWall.position.set(0, ROOM_H / 2, -D / 2 - 0.06);
    backWall.receiveShadow = true;
    roomGroup.add(backWall);
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.12, ROOM_H, D), mkWallMat(D));
    leftWall.position.set(-W / 2 - 0.06, ROOM_H / 2, 0);
    leftWall.receiveShadow = true;
    roomGroup.add(leftWall);

    if (wallFinish === "verf") {
      const skirtMat = mat("#FFFFFF", 0.9);
      const sk1 = new THREE.Mesh(new THREE.BoxGeometry(W, 0.09, 0.03), skirtMat);
      sk1.position.set(0, 0.045, -D / 2 + 0.015);
      roomGroup.add(sk1);
      const sk2 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.09, D), skirtMat);
      sk2.position.set(-W / 2 + 0.015, 0.045, 0);
      roomGroup.add(sk2);
    }

    const winW = Math.min(1.7, W - 1.6);
    if (winW > 0.7) {
      const frameMat = mat("#FFFFFF", 0.9);
      const winX = W / 2 - winW / 2 - 0.5;
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(winW, 1.3, 0.02),
        new THREE.MeshStandardMaterial(
          night
            ? { color: "#15202E", emissive: "#27395A", emissiveIntensity: 0.4, roughness: 0.3 }
            : { color: "#CFE3EE", emissive: "#BCD8E8", emissiveIntensity: 0.55, roughness: 0.3 }
        )
      );
      win.position.set(winX, 1.45, -D / 2 + 0.013);
      roomGroup.add(win);
      const winFrame = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.14, 1.44, 0.025), frameMat);
      winFrame.position.set(winX, 1.45, -D / 2 + 0.006);
      roomGroup.add(winFrame);
      const winBar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.3, 0.03), frameMat);
      winBar.position.set(winX, 1.45, -D / 2 + 0.02);
      roomGroup.add(winBar);
    }

    // maatvoering (zichtbaar in plattegrondmodus)
    const dimGroup = new THREE.Group();
    const dimMat = new THREE.MeshBasicMaterial({ color: "#F4E9D2" });
    const lineW = new THREE.Mesh(new THREE.BoxGeometry(W, 0.012, 0.022), dimMat);
    lineW.position.set(0, 0.02, D / 2 + 0.3);
    dimGroup.add(lineW);
    [-W / 2, W / 2].forEach((x) => {
      const tick = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.012, 0.16), dimMat);
      tick.position.set(x, 0.02, D / 2 + 0.3);
      dimGroup.add(tick);
    });
    const labelW = textSprite(`${W.toFixed(1)} m`);
    labelW.position.set(0, 0.06, D / 2 + 0.55);
    dimGroup.add(labelW);

    const lineD = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.012, D), dimMat);
    lineD.position.set(W / 2 + 0.3, 0.02, 0);
    dimGroup.add(lineD);
    [-D / 2, D / 2].forEach((z) => {
      const tick = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.012, 0.022), dimMat);
      tick.position.set(W / 2 + 0.3, 0.02, z);
      dimGroup.add(tick);
    });
    const labelD = textSprite(`${D.toFixed(1)} m`);
    labelD.position.set(W / 2 + 0.75, 0.06, 0);
    dimGroup.add(labelD);

    dimGroup.visible = viewRef.current === "plan";
    roomGroup.add(dimGroup);
    threeRef.current.dimGroup = dimGroup;
  }, [roomW, roomD, wallColor, wallFinish, floorColor, floorFinish, lighting]);

  /* ---------- Verlichting (dag/avond) ---------- */
  useEffect(() => {
    const { scene, ambient, hemi, sun, furnitureRoot } = threeRef.current;
    if (!scene) return;
    const night = lighting === "avond";
    scene.background = new THREE.Color(night ? "#121419" : "#23262B");
    scene.fog = new THREE.Fog(night ? "#121419" : "#23262B", night ? 12 : 14, night ? 26 : 28);
    ambient.intensity = night ? 0.16 : 0.45;
    ambient.color.set(night ? "#C8B79A" : "#FFF4E2");
    hemi.intensity = night ? 0.08 : 0.35;
    sun.intensity = night ? 0.1 : 1.05;
    sun.color.set(night ? "#8FA3C8" : "#FFF0D6");
    if (furnitureRoot) {
      furnitureRoot.traverse((o) => {
        if (o.isPointLight) {
          const base = o.userData.baseIntensity || 0.5;
          const bFac = o.userData.bFactor === undefined ? 1 : o.userData.bFactor;
          o.intensity = base * bFac * (night ? 2.6 : 1);
        }
      });
    }
  }, [lighting, items]);

  /* ---------- Plattegrond-weergave ---------- */
  useEffect(() => {
    if (threeRef.current.dimGroup) threeRef.current.dimGroup.visible = view === "plan";
  }, [view]);

  const switchView = (v) => {
    if (v === view) return;
    if (v === "plan") {
      prevOrbitRef.current = { ...orbitRef.current };
      orbitRef.current = { theta: 0, phi: 0.04, radius: Math.max(roomW, roomD) * 1.5 };
      setMode("inrichten");
    } else {
      orbitRef.current = prevOrbitRef.current || { theta: 0.7, phi: 1.12, radius: 7.4 };
    }
    setView(v);
  };

  /* ---------- Meubels binnen de kamer houden ---------- */
  useEffect(() => {
    setItems((cur) =>
      cur.map((i) => ({
        ...i,
        x: THREE.MathUtils.clamp(i.x, -roomW / 2 + 0.3, roomW / 2 - 0.3),
        z: THREE.MathUtils.clamp(i.z, -roomD / 2 + 0.3, roomD / 2 - 0.3),
      }))
    );
  }, [roomW, roomD]);

  /* ---------- Meubels (her)bouwen + voetafdruk meten ---------- */
  useEffect(() => {
    const { furnitureRoot, ring } = threeRef.current;
    if (!furnitureRoot) return;
    while (furnitureRoot.children.length) {
      const child = furnitureRoot.children[0];
      disposeObject3D(child);
      furnitureRoot.remove(child);
    }
    const fps = {};
    const night = lighting === "avond";
    items.forEach((item) => {
      const g = buildItem(item);
      // onzichtbaar grijpvlak: kleine objecten (wandlamp, wandplank) krijgen
      // een ruimer tikgebied zodat selecteren en slepen soepel gaat
      const localBox = new THREE.Box3().setFromObject(g);
      const size = new THREE.Vector3(), center = new THREE.Vector3();
      localBox.getSize(size);
      localBox.getCenter(center);
      const proxy = new THREE.Mesh(
        new THREE.BoxGeometry(
          Math.max(size.x, 0.26) + 0.05,
          size.y + 0.04,
          Math.max(size.z, 0.26) + 0.05
        ),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      );
      proxy.position.copy(center);
      g.add(proxy);

      g.position.set(item.x, 0, item.z);
      g.rotation.y = (item.r * Math.PI) / 180;
      g.userData.itemId = item.id;
      const bFac = item.b === undefined ? 1 : item.b;
      g.traverse((o) => {
        if (o.isPointLight) {
          const base = o.userData.baseIntensity || 0.5;
          o.userData.bFactor = bFac;
          o.intensity = base * bFac * (night ? 2.6 : 1);
        }
        if (o.userData.glow && o.material) {
          o.material.emissiveIntensity = o.userData.glow * Math.max(0.12, bFac);
        }
      });
      furnitureRoot.add(g);
      g.updateMatrixWorld(true);
      // voetafdruk op basis van de echte geometrie (zonder proxy-marge)
      const b = localBox.clone().applyMatrix4(g.matrixWorld);
      fps[item.id] = {
        hx: (b.max.x - b.min.x) / 2,
        hz: (b.max.z - b.min.z) / 2,
        cx: (b.max.x + b.min.x) / 2 - item.x,
        cz: (b.max.z + b.min.z) / 2 - item.z,
      };
    });
    footprintRef.current = fps;
    const sel = items.find((i) => i.id === selected);
    if (sel && ring) {
      ring.visible = true;
      ring.position.set(sel.x, 0.02, sel.z);
    } else if (ring) {
      ring.visible = false;
    }
  }, [items, selected, lighting]);

  /* ---------- Interactie ---------- */
  useEffect(() => {
    const { renderer, camera, furnitureRoot } = threeRef.current;
    if (!renderer) return;
    const dom = renderer.domElement;
    const raycaster = new THREE.Raycaster();
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    const ndc = (e) => {
      const r = dom.getBoundingClientRect();
      return new THREE.Vector2(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -((e.clientY - r.top) / r.height) * 2 + 1
      );
    };

    const pickItem = (e) => {
      raycaster.setFromCamera(ndc(e), camera);
      const hits = raycaster.intersectObjects(furnitureRoot.children, true);
      for (const h of hits) {
        let o = h.object;
        while (o && o.userData.itemId === undefined) o = o.parent;
        if (o) return { id: o.userData.itemId, point: h.point };
      }
      return null;
    };

    const planePoint = (e, plane) => {
      raycaster.setFromCamera(ndc(e), camera);
      const p = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, p);
      return p;
    };

    const onDown = (e) => {
      dom.setPointerCapture(e.pointerId);
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointersRef.current.size > 1) { dragRef.current = null; return; }

      if (modeRef.current === "draaien") {
        if (viewRef.current === "plan") { dragRef.current = null; return; }
        dragRef.current = { orbit: true, lastX: e.clientX, lastY: e.clientY };
        return;
      }
      const hit = pickItem(e);
      if (hit !== null) {
        setSelected(hit.id);
        pushHistoryRef.current();
        const item = itemsRef.current.find((i) => i.id === hit.id);
        // sleepvlak op de hoogte van het grijppunt: het object blijft
        // exact onder je vinger, ook bij hoge objecten zoals een wandlamp
        const grabY = THREE.MathUtils.clamp(hit.point.y, 0, 2.3);
        const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -grabY);
        dragRef.current = {
          id: hit.id, plane: dragPlane,
          offX: item.x - hit.point.x, offZ: item.z - hit.point.z,
        };
      } else {
        setSelected(null);
        dragRef.current = null;
      }
    };

    const findGroup = (id) =>
      furnitureRoot.children.find((c) => c.userData.itemId === id);

    const onMove = (e) => {
      if (!pointersRef.current.has(e.pointerId)) return;
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointersRef.current.size === 2) {
        const pts = [...pointersRef.current.values()];
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (dragRef.current?.pinchDist) {
          const delta = dragRef.current.pinchDist - dist;
          orbitRef.current.radius = THREE.MathUtils.clamp(orbitRef.current.radius + delta * 0.02, 2.6, 16);
        }
        dragRef.current = { pinchDist: dist };
        return;
      }

      const d = dragRef.current;
      if (!d) return;
      if (d.orbit) {
        const dx = e.clientX - d.lastX, dy = e.clientY - d.lastY;
        d.lastX = e.clientX; d.lastY = e.clientY;
        orbitRef.current.theta -= dx * 0.006;
        orbitRef.current.phi = THREE.MathUtils.clamp(orbitRef.current.phi + dy * 0.005, 0.35, 1.45);
      } else if (d.id !== undefined) {
        const p = planePoint(e, d.plane || floorPlane);
        if (!p) return;
        const { w, d: dep } = roomRef.current;
        let nx = p.x + d.offX;
        let nz = p.z + d.offZ;

        // --- snappen ---
        const fp = footprintRef.current[d.id];
        const SNAP_WALL = 0.18, SNAP_ALIGN = 0.12;
        if (fp) {
          // tegen wanden aan
          if (Math.abs((nx + fp.cx - fp.hx) - (-w / 2)) < SNAP_WALL) nx = -w / 2 - fp.cx + fp.hx;
          if (Math.abs((nx + fp.cx + fp.hx) - (w / 2)) < SNAP_WALL) nx = w / 2 - fp.cx - fp.hx;
          if (Math.abs((nz + fp.cz - fp.hz) - (-dep / 2)) < SNAP_WALL) nz = -dep / 2 - fp.cz + fp.hz;
          if (Math.abs((nz + fp.cz + fp.hz) - (dep / 2)) < SNAP_WALL) nz = dep / 2 - fp.cz - fp.hz;
        }
        // uitlijnen met andere meubels
        for (const o of itemsRef.current) {
          if (o.id === d.id) continue;
          if (Math.abs(o.x - nx) < SNAP_ALIGN) nx = o.x;
          if (Math.abs(o.z - nz) < SNAP_ALIGN) nz = o.z;
        }
        // binnen de kamer houden (op basis van werkelijke afmetingen)
        if (fp) {
          nx = THREE.MathUtils.clamp(nx, -w / 2 - fp.cx + fp.hx, w / 2 - fp.cx - fp.hx);
          nz = THREE.MathUtils.clamp(nz, -dep / 2 - fp.cz + fp.hz, dep / 2 - fp.cz - fp.hz);
          if (fp.hx * 2 > w) nx = 0;
          if (fp.hz * 2 > dep) nz = 0;
        } else {
          nx = THREE.MathUtils.clamp(nx, -w / 2 + 0.3, w / 2 - 0.3);
          nz = THREE.MathUtils.clamp(nz, -dep / 2 + 0.3, dep / 2 - 0.3);
        }
        d.nx = nx;
        d.nz = nz;
        const group = findGroup(d.id);
        if (group) group.position.set(nx, 0, nz);
        const { ring } = threeRef.current;
        if (ring) ring.position.set(nx, 0.02, nz);
      }
    };

    const onUp = (e) => {
      const d = dragRef.current;
      if (d?.id !== undefined && d.nx !== undefined) {
        setItems((cur) => cur.map((i) => (i.id === d.id ? { ...i, x: d.nx, z: d.nz } : i)));
      }
      pointersRef.current.delete(e.pointerId);
      if (pointersRef.current.size === 0) dragRef.current = null;
    };

    const onWheel = (e) => {
      e.preventDefault();
      orbitRef.current.radius = THREE.MathUtils.clamp(orbitRef.current.radius + e.deltaY * 0.005, 2.6, 16);
    };

    dom.addEventListener("pointerdown", onDown);
    dom.addEventListener("pointermove", onMove);
    dom.addEventListener("pointerup", onUp);
    dom.addEventListener("pointercancel", onUp);
    dom.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      dom.removeEventListener("pointerdown", onDown);
      dom.removeEventListener("pointermove", onMove);
      dom.removeEventListener("pointerup", onUp);
      dom.removeEventListener("pointercancel", onUp);
      dom.removeEventListener("wheel", onWheel);
    };
  }, []);

  const saveImage = () => {
    const { renderer, scene, camera } = threeRef.current;
    if (!renderer) return;
    renderer.render(scene, camera);
    const url = renderer.domElement.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "atelier3d-ontwerp.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return { mountRef, orbitRef, switchView, saveImage };
}
