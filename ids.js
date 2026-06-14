let nextId = 1;

export function createPresetItem(type, x, z, r = 0, c = null, v = 0) {
  return { id: nextId++, type, x, z, r, c, v };
}

export function nextItemId() {
  return nextId++;
}

export function syncItemIdCounter(minId) {
  nextId = Math.max(nextId, minId);
}
