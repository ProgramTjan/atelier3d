import { useState, useEffect, useCallback } from "react";
import { STORAGE_KEY } from "../constants.js";
import { syncItemIdCounter } from "../ids.js";

export function useDesignStorage({
  items,
  roomW,
  roomD,
  wallColor,
  wallFinish,
  floorColor,
  floorFinish,
  section,
  pushHistory,
  setItems,
  setRoomW,
  setRoomD,
  setWallColor,
  setWallFinish,
  setFloorColor,
  setFloorFinish,
  setSection,
  setActivePreset,
  setSelected,
}) {
  const [designs, setDesigns] = useState([]);
  const [storageOk, setStorageOk] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY);
        if (res?.value) setDesigns(JSON.parse(res.value));
      } catch (e) {
        // sleutel bestaat nog niet of opslag onbeschikbaar — geen probleem
      }
    })();
  }, []);

  const persistDesigns = async (arr) => {
    setDesigns(arr);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(arr));
      setStorageOk(true);
    } catch (e) {
      setStorageOk(false);
    }
  };

  const saveDesign = useCallback(() => {
    const now = new Date();
    const name = `${section === "bad" ? "Badkamer" : "Woonruimte"} · ${now.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} ${now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}`;
    const d = {
      id: Date.now(),
      name,
      items,
      roomW,
      roomD,
      wallColor,
      wallFinish,
      floorColor,
      floorFinish,
      section,
    };
    persistDesigns([d, ...designs].slice(0, 12));
  }, [designs, floorColor, floorFinish, items, roomD, roomW, section, wallColor, wallFinish]);

  const loadDesign = useCallback(
    (d) => {
      pushHistory();
      setItems(d.items.map((i) => ({ ...i })));
      syncItemIdCounter(Math.max(...d.items.map((i) => i.id + 1), 1));
      setRoomW(d.roomW);
      setRoomD(d.roomD);
      setWallColor(d.wallColor);
      setWallFinish(d.wallFinish);
      setFloorColor(d.floorColor);
      setFloorFinish(d.floorFinish);
      setSection(d.section);
      setActivePreset(null);
      setSelected(null);
    },
    [
      pushHistory,
      setFloorColor,
      setFloorFinish,
      setItems,
      setRoomD,
      setRoomW,
      setSection,
      setActivePreset,
      setSelected,
      setWallColor,
      setWallFinish,
    ]
  );

  const deleteDesign = useCallback(
    (id) => persistDesigns(designs.filter((x) => x.id !== id)),
    [designs]
  );

  return { designs, storageOk, saveDesign, loadDesign, deleteDesign };
}
