import { useSyncExternalStore } from "react";

function createMediaQueryStore(query: string) {
  function subscribe(callback: () => void): () => void {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  }

  function getSnapshot(): boolean {
    return window.matchMedia(query).matches;
  }

  function getServerSnapshot(): boolean {
    return false;
  }

  return { subscribe, getSnapshot, getServerSnapshot };
}

const storeCache = new Map<string, ReturnType<typeof createMediaQueryStore>>();

function getStore(query: string) {
  let store = storeCache.get(query);
  if (!store) {
    store = createMediaQueryStore(query);
    storeCache.set(query, store);
  }
  return store;
}

export function useMediaQuery(query: string): boolean {
  const store = getStore(query);
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
