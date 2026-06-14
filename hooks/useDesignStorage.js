import { useState, useEffect, useCallback } from "react";
import { STORAGE_KEY } from "../constants.js";
import { syncItemIdCounter } from "../ids.js";
import { storageGet, storageSet } from "../lib/storage.js";

export function useDesignStorage({
  getSnapshot,
  pushHistory,
  applySnapshot,
}) {
  const [designs, setDesigns] = useState([]);
  const [storageOk, setStorageOk] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await storageGet(STORAGE_KEY);
        if (res?.value) setDesigns(JSON.parse(res.value));
      } catch (e) {
        // sleutel bestaat nog niet of opslag onbeschikbaar
      }
    })();
  }, []);

  const persistDesigns = async (arr) => {
    setDesigns(arr);
    try {
      await storageSet(STORAGE_KEY, JSON.stringify(arr));
      setStorageOk(true);
    } catch (e) {
      setStorageOk(false);
    }
  };

  const saveDesign = useCallback(() => {
    const snap = getSnapshot();
    const now = new Date();
    const defaultName = `${snap.section === "bad" ? "Badkamer" : "Woonruimte"} · ${now.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} ${now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}`;
    const name = window.prompt("Naam voor dit ontwerp:", defaultName);
    if (!name?.trim()) return;

    const d = {
      id: Date.now(),
      name: name.trim(),
      items: snap.items,
      roomW: snap.roomW,
      roomD: snap.roomD,
      wallColor: snap.wallColor,
      wallFinish: snap.wallFinish,
      floorColor: snap.floorColor,
      floorFinish: snap.floorFinish,
      section: snap.section,
    };
    persistDesigns([d, ...designs].slice(0, 12));
  }, [designs, getSnapshot]);

  const loadDesign = useCallback(
    (d) => {
      if (!window.confirm(`Ontwerp "${d.name}" laden? Huidige wijzigingen gaan verloren.`)) return;
      pushHistory();
      applySnapshot({
        items: d.items.map((i) => ({ ...i })),
        roomW: d.roomW,
        roomD: d.roomD,
        wallColor: d.wallColor,
        wallFinish: d.wallFinish,
        floorColor: d.floorColor,
        floorFinish: d.floorFinish,
        section: d.section,
        activePreset: null,
      });
      syncItemIdCounter(d.items.length ? Math.max(...d.items.map((i) => i.id + 1)) : 1);
    },
    [applySnapshot, pushHistory]
  );

  const deleteDesign = useCallback(
    (id) => {
      const d = designs.find((x) => x.id === id);
      if (!window.confirm(`Ontwerp "${d?.name || "onbekend"}" verwijderen?`)) return;
      persistDesigns(designs.filter((x) => x.id !== id));
    },
    [designs]
  );

  return { designs, storageOk, saveDesign, loadDesign, deleteDesign };
}
