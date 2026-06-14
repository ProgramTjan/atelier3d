import { useRef, useState, useCallback } from "react";

export function useItemHistory(itemsRef, setItems, setSelected, setActivePreset) {
  const historyRef = useRef([]);
  const pushHistoryRef = useRef(() => {});
  const [canUndo, setCanUndo] = useState(false);

  const pushHistory = useCallback(() => {
    historyRef.current.push(JSON.stringify(itemsRef.current));
    if (historyRef.current.length > 40) historyRef.current.shift();
    setCanUndo(true);
  }, [itemsRef]);

  pushHistoryRef.current = pushHistory;

  const undo = useCallback(() => {
    const snap = historyRef.current.pop();
    if (snap) {
      setItems(JSON.parse(snap));
      setSelected(null);
      setActivePreset(null);
    }
    setCanUndo(historyRef.current.length > 0);
  }, [setItems, setSelected, setActivePreset]);

  return { pushHistory, pushHistoryRef, undo, canUndo };
}
