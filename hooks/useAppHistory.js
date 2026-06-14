import { useRef, useState, useCallback } from "react";

/** Undo-stack voor volledige ontwerp-snapshots (meubels + kamer + stijl). */
export function useAppHistory(getSnapshot, applySnapshot) {
  const historyRef = useRef([]);
  const getSnapshotRef = useRef(getSnapshot);
  const pushHistoryRef = useRef(() => {});

  getSnapshotRef.current = getSnapshot;
  const [canUndo, setCanUndo] = useState(false);

  const pushHistory = useCallback(() => {
    historyRef.current.push(JSON.stringify(getSnapshotRef.current()));
    if (historyRef.current.length > 40) historyRef.current.shift();
    setCanUndo(true);
  }, []);

  pushHistoryRef.current = pushHistory;

  const undo = useCallback(() => {
    const snap = historyRef.current.pop();
    if (snap) applySnapshot(JSON.parse(snap));
    setCanUndo(historyRef.current.length > 0);
  }, [applySnapshot]);

  return { pushHistory, pushHistoryRef, undo, canUndo };
}
