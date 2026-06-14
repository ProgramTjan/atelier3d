/** Eén opslag-API voor Cursor-artifacts (window.storage) en localStorage. */
export async function storageGet(key) {
  if (window.storage?.get) {
    return window.storage.get(key);
  }
  const value = localStorage.getItem(key);
  return value !== null ? { value } : undefined;
}

export async function storageSet(key, value) {
  if (window.storage?.set) {
    return window.storage.set(key, value);
  }
  localStorage.setItem(key, value);
}
